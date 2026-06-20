<div align="center">
  <img src="https://raw.githubusercontent.com/FOXYorj/VeloStream/main/css/logo.svg" alt="VeloStream Logo" width="120" onerror="this.style.display='none'"/>
  <h1>VeloStream</h1>
  <p><strong>Pure P2P Local Network Streaming. Zero-latency, no cloud.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#how-it-works">How it Works</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

---

**VeloStream** is an ultra-fast, pure peer-to-peer (P2P) local network streaming solution. It allows you to broadcast your screen and system audio from your computer to any other device (like a phone, tablet, or another PC) on the same Wi-Fi or Ethernet network. 

No internet routing, no cloud servers, no subscriptions. Just raw, pure local performance using WebRTC and Golang.

## ✨ Features

- ⚡ **Zero-Latency P2P:** Streams directly device-to-device via WebRTC.
- 🔍 **Auto Peer Discovery:** Automatically finds other VeloStream instances on your local network using UDP broadcasts.
- 💻 **Cross-Platform Alıc (Receiver):** Watch your stream on any device with a modern web browser (iOS, Android, Windows, Mac).
- 🔊 **System Audio Support:** Capture and stream your desktop audio natively.
- 🎨 **Modern Bilingual UI:** Beautiful dark-mode dashboard with built-in English (EN) and Turkish (TR) support.
- 🛠 **Lightweight Backend:** Built entirely in Go (Golang) for incredible concurrency and low memory footprint.

## 🏗 How It Works

1. **The Go Backend:** Serves the HTML/JS/CSS files over HTTP and manages a WebSocket Hub. It also broadcasts UDP packets to discover other VeloStream servers on the network.
2. **The Signaling Server:** The Go backend routes WebRTC signaling messages (`SDP Offers`, `Answers`, and `ICE Candidates`) between connected browser clients.
3. **WebRTC:** Once signaling is complete, the browser establishes a direct P2P connection to share the video/audio tracks. The video doesn't pass through the Go server; it flows directly from the host browser to the receiving browser.

## 🚀 Installation

### Prerequisites
- [Go (Golang)](https://golang.org/dl/) 1.20 or higher installed on your computer.

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/FOXYorj/VeloStream.git
   cd VeloStream
   ```
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Run the VeloStream server:
   ```bash
   go run .
   ```
   *Note: If Windows Firewall prompts you, click "Allow access" for Private Networks so UDP discovery and the web server can work locally.*

## 📖 Usage

### 1. Starting a Broadcast (The Host PC)
- Open a modern browser (Chrome/Edge recommended) on the computer running the Go server.
- Go to: **`http://localhost:8080`** 
  *(⚠️ **Crucial:** You must use `localhost` and not your local IP address on the host PC. Browsers restrict screen capturing APIs to secure contexts like HTTPS or `localhost`)*.
- Click **"Start Broadcasting"**.
- Chrome will open a dialog. Select **"Entire Screen"**.
- If you want to share audio, make sure to check the **"Share system audio"** checkbox at the bottom/top of the dialog.
- Click **Share**. A mini-preview will appear on the bottom right of your screen.

### 2. Watching a Stream (The Mobile Receiver / Second PC)
- Connect your phone/tablet/laptop to the **same Wi-Fi network**.
- Open the browser and go to the Host PC's local IP address. For example: **`http://192.168.1.X:8080`**
- Under the **"Active Streams"** section, you will see the host's broadcast.
- Click **"Connect"** (Bağlan).
- The stream will open in Native Fullscreen with zero latency. If you don't hear audio immediately, tap the screen/volume controls to unmute (due to mobile autoplay policies).

## 🗺 Roadmap

- [x] **Mobile Receiver:** Use any tablet or phone as a zero-lag secondary display.
- [x] **System Audio Sharing:** Stream PC audio alongside the video.
- [ ] **Virtual Audio Cable:** Stream per-app audio without mixing system sound.
- [ ] **Stream Recording:** Record incoming streams to disk in H.264/VP9.
- [ ] **Multi-Cast:** Broadcast to multiple receivers with smart bandwidth balancing.

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
*Created for the pure love of local networks.*
