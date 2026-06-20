/**
 * VeloStream — WebRTC Manager
 * Handles Screen Capture and P2P Connections.
 */

class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.peerConnections = {}; // Map of targetID -> RTCPeerConnection
    
    // Config for local network: STUN is not strictly needed for local LAN,
    // but having a public one as fallback prevents some browser errors.
    this.rtcConfig = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
  }

  // 1. Capture Screen
  async startCapture() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Ekran paylaşımı bu tarayıcıda desteklenmiyor veya güvenli bağlantı (HTTPS / localhost) gerektiriyor.\n\nEğer bilgisayardaysanız lütfen IP adresi yerine http://localhost:8080 adresinden girmeyi deneyin.");
        return false;
      }

      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always", 
          frameRate: 60,
          displaySurface: "monitor"
        },
        audio: true
      });

      if (this.localStream.getAudioTracks().length === 0) {
        alert("Uyarı: Chrome ekran paylaşım menüsünde 'Sistem sesini de paylaş' seçeneğini GÖZDEN KAÇIRDINIZ.\n\nŞu an yayında SES OLMAYACAK. Sesin de gitmesini istiyorsanız yayını durdurup tekrar başlatırken o kutucuğu (sol altta veya üstte olabilir) işaretlemeyi unutmayın.");
      }
      
      // Stop broadcast if user clicks "Stop sharing" on browser banner
      this.localStream.getVideoTracks()[0].onended = () => {
        if (window.app && window.app._broadcasting) {
          document.getElementById('btn-stop').click(); // trigger stop UI
        }
      };

      // Show local preview
      const preview = document.getElementById('local-video');
      if (preview) {
        preview.srcObject = this.localStream;
        preview.style.display = 'block';
      }

      return true;
    } catch (err) {
      console.error('[WebRTC] Failed to capture screen:', err);
      alert("Ekran yakalama başarısız oldu veya izin reddedildi.");
      return false;
    }
  }

  stopCapture() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    const preview = document.getElementById('local-video');
    if (preview) {
      preview.style.display = 'none';
      preview.srcObject = null;
    }
    
    // Close all active peer connections
    for (const id in this.peerConnections) {
      this.peerConnections[id].close();
      delete this.peerConnections[id];
    }
  }

  // 2. Watch a Stream (Receiver side creates Offer)
  async watchStream(targetID) {
    console.log('[WebRTC] Creating offer for:', targetID);
    const pc = this._createPeerConnection(targetID);
    
    // Add a transceiver to receive BOTH video and audio
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send offer to host
    window.app.sendSignal(targetID, 'SIGNAL_OFFER', offer);
    this._showPlayerModal();
  }

  // 3. Handle incoming Offer (Host side creates Answer)
  async handleOffer(senderID, offer) {
    console.log('[WebRTC] Received offer from:', senderID);
    if (!this.localStream) {
      console.warn('[WebRTC] Received offer but no local stream is active');
      return;
    }

    const pc = this._createPeerConnection(senderID);

    // Add local stream tracks to PC
    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    window.app.sendSignal(senderID, 'SIGNAL_ANSWER', answer);
  }

  // 4. Handle incoming Answer (Receiver side)
  async handleAnswer(senderID, answer) {
    console.log('[WebRTC] Received answer from:', senderID);
    const pc = this.peerConnections[senderID];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // 5. Handle ICE Candidate
  async handleIceCandidate(senderID, candidate) {
    const pc = this.peerConnections[senderID];
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('[WebRTC] Error adding ICE candidate', e);
      }
    }
  }

  // Internals
  _createPeerConnection(targetID) {
    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections[targetID] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        window.app.sendSignal(targetID, 'SIGNAL_ICE', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track');
      const remoteVideo = document.getElementById('remote-video');
      if (remoteVideo && event.streams[0]) {
        if (remoteVideo.srcObject !== event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
          remoteVideo.play().catch(err => {
            console.warn('[WebRTC] Autoplay prevented by browser', err);
            remoteVideo.muted = true;
            remoteVideo.play();
            alert("Telefonunuz otomatik sesli oynatmayı engelledi. Sesi duymak için videonun üzerindeki kontrollerden (hoparlör simgesi) sesi açın.");
          });
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection with ${targetID}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        pc.close();
        delete this.peerConnections[targetID];
      }
    };

    return pc;
  }

  _showPlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.style.display = 'flex';
    
    // Auto trigger fullscreen if supported
    setTimeout(() => this.goFullscreen(), 500);
  }

  goFullscreen() {
    const video = document.getElementById('remote-video');
    if (!video) return;
    
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(e => console.warn('[WebRTC] Fullscreen auto-play prevented', e));
    } else if (video.webkitEnterFullscreen) {
      // iOS Safari native fullscreen
      video.webkitEnterFullscreen();
    }
  }

  closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (modal) modal.style.display = 'none';
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo) remoteVideo.srcObject = null;

    // Close receiver connections
    for (const id in this.peerConnections) {
      this.peerConnections[id].close();
      delete this.peerConnections[id];
    }
  }
}
