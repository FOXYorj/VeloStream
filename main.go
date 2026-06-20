package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all for local network
	},
}

func main() {
	// Generate unique ID for this instance (Backend)
	backendID := generateID()
	myName := getHostname()

	hub := NewHub()
	go hub.Run()

	discovery := NewDiscoveryService(hub, backendID, myName, 8080)
	if err := discovery.Start(); err != nil {
		log.Fatalf("Failed to start discovery: %v", err)
	}
	defer discovery.Stop()

	// Static file server
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)

	// WebSocket handler
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r, myName)
	})

	log.Println("VeloStream Server running on :8080")
	log.Printf("Backend ID: %s, Hostname: %s", backendID, myName)
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request, backendName string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Each connection gets its own unique ID (this represents a User/Browser)
	clientID := generateID()
	client := &Client{ID: clientID, Conn: conn}

	hub.register <- client

	// Automatically add this client to the peers list so others can see it
	// In a real P2P app, peers are actual separate backends, but here we treat WS clients as peers too.
	peer := Peer{
		ID:       clientID,
		Name:     "Browser-" + clientID[:4],
		IP:       r.RemoteAddr,
		Latency:  1,
		Signal:   5,
		Status:   "online",
		Avatar:   "W",
		OS:       "Web",
		LastSeen: time.Now().Unix(),
	}
	hub.AddOrUpdatePeer(peer)

	go func() {
		defer func() {
			hub.RemovePeer(clientID)
			hub.unregister <- client
		}()
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var wsMsg WsMessage
			if err := json.Unmarshal(message, &wsMsg); err != nil {
				continue
			}

			// Ensure sender ID is attached
			wsMsg.SenderID = clientID
			handleFrontendMessage(hub, wsMsg, clientID)
		}
	}()
}

func handleFrontendMessage(hub *Hub, msg WsMessage, clientID string) {
	switch msg.Type {
	case "START_STREAM":
		streamID := "stream-" + clientID
		stream := Stream{
			ID:      streamID,
			Title:   "Stream " + clientID[:4],
			To:      "All Peers",
			Res:     "1080p",
			Codec:   "VP9",
			FPS:     60,
			Bitrate: 10.0,
		}
		hub.AddStream(stream)

	case "STOP_STREAM":
		streamID := "stream-" + clientID
		hub.RemoveStream(streamID)

	case "SIGNAL_OFFER", "SIGNAL_ANSWER", "SIGNAL_ICE":
		// Direct WebRTC signaling messages to target client
		if msg.TargetID != "" {
			hub.broadcast <- msg
		}
	}
}

func generateID() string {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(bytes)
}
