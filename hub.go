package main

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
}

type Hub struct {
	clients    map[string]*Client
	broadcast  chan WsMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex

	// State
	peers   map[string]Peer
	streams map[string]Stream
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan WsMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]*Client),
		peers:      make(map[string]Peer),
		streams:    make(map[string]Stream),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			h.sendState(client)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				client.Conn.Close()
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			if message.TargetID != "" {
				// Direct message to specific client
				if targetClient, ok := h.clients[message.TargetID]; ok {
					err := targetClient.Conn.WriteJSON(message)
					if err != nil {
						log.Printf("websocket error direct: %v", err)
						targetClient.Conn.Close()
						delete(h.clients, message.TargetID)
					}
				}
			} else {
				// Broadcast to all clients
				for id, client := range h.clients {
					// Don't send broadcast back to sender if specified
					if message.SenderID != "" && message.SenderID == id {
						continue
					}
					err := client.Conn.WriteJSON(message)
					if err != nil {
						log.Printf("websocket error broadcast: %v", err)
						client.Conn.Close()
						delete(h.clients, id)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) sendState(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	var peerList []Peer
	for _, p := range h.peers {
		peerList = append(peerList, p)
	}
	var streamList []Stream
	for _, s := range h.streams {
		streamList = append(streamList, s)
	}

	if peerList == nil {
		peerList = []Peer{}
	}
	if streamList == nil {
		streamList = []Stream{}
	}

	// Tell the client its own ID
	client.Conn.WriteJSON(WsMessage{Type: "INIT", Payload: map[string]string{"id": client.ID}})
	client.Conn.WriteJSON(WsMessage{Type: "PEERS_UPDATE", Payload: peerList})
	client.Conn.WriteJSON(WsMessage{Type: "STREAMS_UPDATE", Payload: streamList})
}

func (h *Hub) AddOrUpdatePeer(p Peer) {
	h.mu.Lock()
	h.peers[p.ID] = p
	var peerList []Peer
	for _, peer := range h.peers {
		peerList = append(peerList, peer)
	}
	h.mu.Unlock()
	h.broadcast <- WsMessage{Type: "PEERS_UPDATE", Payload: peerList}
}

func (h *Hub) RemovePeer(id string) {
	h.mu.Lock()
	delete(h.peers, id)
	var peerList []Peer
	for _, peer := range h.peers {
		peerList = append(peerList, peer)
	}
	h.mu.Unlock()
	h.broadcast <- WsMessage{Type: "PEERS_UPDATE", Payload: peerList}
}

func (h *Hub) AddStream(s Stream) {
	h.mu.Lock()
	h.streams[s.ID] = s
	var streamList []Stream
	for _, stream := range h.streams {
		streamList = append(streamList, stream)
	}
	h.mu.Unlock()
	h.broadcast <- WsMessage{Type: "STREAMS_UPDATE", Payload: streamList}
}

func (h *Hub) RemoveStream(id string) {
	h.mu.Lock()
	delete(h.streams, id)
	var streamList []Stream
	for _, stream := range h.streams {
		streamList = append(streamList, stream)
	}
	h.mu.Unlock()
	h.broadcast <- WsMessage{Type: "STREAMS_UPDATE", Payload: streamList}
}
