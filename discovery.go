package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"runtime"
	"strings"
	"time"
)

const discoveryPort = 7433
const announceInterval = 3 * time.Second
const peerTimeout = 10 * time.Second

type DiscoveryMsg struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	OS     string `json:"os"`
	Port   int    `json:"port"`
	Action string `json:"action"` // "announce" or "bye"
}

type DiscoveryService struct {
	hub      *Hub
	myID     string
	myName   string
	myPort   int
	conn     *net.UDPConn
	stopChan chan struct{}
}

func NewDiscoveryService(hub *Hub, myID, myName string, myPort int) *DiscoveryService {
	return &DiscoveryService{
		hub:      hub,
		myID:     myID,
		myName:   myName,
		myPort:   myPort,
		stopChan: make(chan struct{}),
	}
}

func (d *DiscoveryService) Start() error {
	addr := &net.UDPAddr{Port: discoveryPort, IP: net.ParseIP("0.0.0.0")}
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		return fmt.Errorf("failed to bind UDP port %d: %v", discoveryPort, err)
	}
	d.conn = conn

	go d.listen()
	go d.announceLoop()
	go d.cleanupLoop()

	log.Printf("UDP Discovery started on port %d", discoveryPort)
	return nil
}

func (d *DiscoveryService) Stop() {
	close(d.stopChan)
	if d.conn != nil {
		d.conn.Close()
	}
	d.broadcastMsg("bye")
}

func (d *DiscoveryService) listen() {
	buf := make([]byte, 1024)
	for {
		n, remoteAddr, err := d.conn.ReadFromUDP(buf)
		if err != nil {
			select {
			case <-d.stopChan:
				return
			default:
				log.Printf("UDP read error: %v", err)
				continue
			}
		}

		var msg DiscoveryMsg
		if err := json.Unmarshal(buf[:n], &msg); err != nil {
			continue
		}

		// Ignore our own broadcasts
		if msg.ID == d.myID {
			continue
		}

		ip := remoteAddr.IP.String()

		if msg.Action == "bye" {
			d.hub.RemovePeer(msg.ID)
			continue
		}

		// Calculate a fake latency based on ID just for visuals
		latency := 5 + (len(msg.ID) % 15)
		
		peer := Peer{
			ID:       msg.ID,
			Name:     msg.Name,
			IP:       ip,
			Latency:  latency,
			Signal:   4, // Strong signal by default
			Status:   "online",
			Avatar:   msg.Name,
			OS:       msg.OS,
			LastSeen: time.Now().Unix(),
		}

		d.hub.AddOrUpdatePeer(peer)
	}
}

func (d *DiscoveryService) announceLoop() {
	ticker := time.NewTicker(announceInterval)
	defer ticker.Stop()

	d.broadcastMsg("announce")

	for {
		select {
		case <-ticker.C:
			d.broadcastMsg("announce")
		case <-d.stopChan:
			return
		}
	}
}

func (d *DiscoveryService) broadcastMsg(action string) {
	msg := DiscoveryMsg{
		ID:     d.myID,
		Name:   d.myName,
		OS:     runtime.GOOS,
		Port:   d.myPort,
		Action: action,
	}

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal discovery msg: %v", err)
		return
	}

	// Broadcast to 255.255.255.255
	addr := &net.UDPAddr{IP: net.ParseIP("255.255.255.255"), Port: discoveryPort}
	d.conn.WriteToUDP(data, addr)
	
	// Also broadcast to the local subnet broadcast address if possible
	interfaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range interfaces {
			if iface.Flags&net.FlagBroadcast != 0 && iface.Flags&net.FlagUp != 0 {
				addrs, _ := iface.Addrs()
				for _, a := range addrs {
					if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
						if ipnet.IP.To4() != nil {
							bcast := calculateBroadcastAddress(ipnet)
							if bcast != nil {
								bcastAddr := &net.UDPAddr{IP: bcast, Port: discoveryPort}
								d.conn.WriteToUDP(data, bcastAddr)
							}
						}
					}
				}
			}
		}
	}
}

func (d *DiscoveryService) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			now := time.Now().Unix()
			d.hub.mu.Lock()
			var toRemove []string
			for id, p := range d.hub.peers {
				if now-p.LastSeen > int64(peerTimeout.Seconds()) {
					toRemove = append(toRemove, id)
				}
			}
			d.hub.mu.Unlock()

			for _, id := range toRemove {
				d.hub.RemovePeer(id)
			}
		case <-d.stopChan:
			return
		}
	}
}

func calculateBroadcastAddress(n *net.IPNet) net.IP {
	ip := n.IP.To4()
	if ip == nil {
		return nil
	}
	mask := n.Mask
	bcast := make(net.IP, len(ip))
	for i := 0; i < len(ip); i++ {
		bcast[i] = ip[i] | ^mask[i]
	}
	return bcast
}

func getHostname() string {
	name, err := os.Hostname()
	if err != nil {
		return "Unknown Device"
	}
	// Take first part if it's a FQDN
	return strings.Split(name, ".")[0]
}
