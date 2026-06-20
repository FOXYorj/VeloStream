package main

type WsMessage struct {
	Type     string      `json:"type"`
	TargetID string      `json:"targetId,omitempty"`
	SenderID string      `json:"senderId,omitempty"`
	Payload  interface{} `json:"payload"`
}

type Peer struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IP       string `json:"ip"`
	Latency  int    `json:"latency"`
	Signal   int    `json:"signal"`
	Status   string `json:"status"`
	Avatar   string `json:"avatar"`
	OS       string `json:"os"`
	LastSeen int64  `json:"-"`
}

type Stream struct {
	ID      string  `json:"id"`
	Title   string  `json:"title"`
	To      string  `json:"to"`
	Res     string  `json:"res"`
	Codec   string  `json:"codec"`
	FPS     int     `json:"fps"`
	Bitrate float64 `json:"bitrate"`
}
