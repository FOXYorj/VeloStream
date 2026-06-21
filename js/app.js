/**
 * VeloStream — App Orchestrator
 */

/* ── App Orchestrator ── */

class App {
  constructor() {
    this._broadcasting = false;
    this._startTime    = null;
    this._ws           = null;

    this._clock();
    this._lang();
    this._broadcast();
    this._settings();
    this._authorModal();
    this._copyLink();
    this._initWs();

    i18n.applyAll();
  }

  /* ── WebSocket ─────────────── */
  _initWs() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/ws`;
    this._ws = new WebSocket(wsUrl);

    this._ws.onopen = () => {
      console.log('[VeloStream] WebSocket connected');
    };

    this._ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'INIT':
            this.myID = msg.payload.id;
            console.log('[VeloStream] My Client ID:', this.myID);
            break;
          case 'PEERS_UPDATE':
            if (window.peerManager) window.peerManager.updatePeers(msg.payload || []);
            break;
          case 'STREAMS_UPDATE':
            if (window.streamMonitor) window.streamMonitor.updateStreams(msg.payload || []);
            break;
          case 'BITRATE_UPDATE':
            if (window.streamMonitor) window.streamMonitor.pushBitrate(msg.payload.id, msg.payload.bitrate);
            break;
          case 'SIGNAL_OFFER':
            if (window.webrtcManager) window.webrtcManager.handleOffer(msg.senderId, msg.payload);
            break;
          case 'SIGNAL_ANSWER':
            if (window.webrtcManager) window.webrtcManager.handleAnswer(msg.senderId, msg.payload);
            break;
          case 'SIGNAL_ICE':
            if (window.webrtcManager) window.webrtcManager.handleIceCandidate(msg.senderId, msg.payload);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    this._ws.onclose = () => {
      console.log('[VeloStream] WebSocket disconnected, retrying in 3s...');
      setTimeout(() => this._initWs(), 3000);
    };
  }

  /* ── Clock ─────────────────── */
  _clock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      el.textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Language toggle ───────── */
  _lang() {
    const trBtn = document.getElementById('lang-tr');
    const enBtn = document.getElementById('lang-en');
    const thumb = document.getElementById('lang-thumb');

    const updateThumb = () => {
      const active = i18n.lang === 'tr' ? trBtn : enBtn;
      if (!active || !thumb) return;
      thumb.style.left  = active.offsetLeft + 'px';
      thumb.style.width = active.offsetWidth + 'px';
    };

    trBtn?.addEventListener('click', () => { i18n.setLang('tr'); updateThumb(); this._updateLangBtns(); });
    enBtn?.addEventListener('click', () => { i18n.setLang('en'); updateThumb(); this._updateLangBtns(); });
    document.addEventListener('vs:langchange', () => this._updateLangBtns());

    requestAnimationFrame(updateThumb);
  }

  _updateLangBtns() {
    const tr = document.getElementById('lang-tr');
    const en = document.getElementById('lang-en');
    if (!tr || !en) return;
    tr.classList.toggle('active', i18n.lang === 'tr');
    en.classList.toggle('active', i18n.lang === 'en');
  }

  /* ── WebRTC Signaling ───────── */
  sendSignal(targetId, type, payload) {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ targetId, type, payload }));
    }
  }

  /* ── Broadcast ─────────────── */
  _broadcast() {
    const startBtn  = document.getElementById('btn-start');
    const stopBtn   = document.getElementById('btn-stop');
    const ringLabel = document.getElementById('ring-label');
    const ringIcon  = document.getElementById('ring-icon');
    const ripples   = document.getElementById('ripples');

    if (stopBtn) stopBtn.style.display = 'none';

    startBtn?.addEventListener('click', async () => {
      if (window.webrtcManager) {
        const ok = await window.webrtcManager.startCapture();
        if (!ok) return;
      }

      this._broadcasting = true;
      this._startTime    = Date.now();
      startBtn.style.display = 'none';
      if (stopBtn)   stopBtn.style.display = '';
      if (ringLabel) { ringLabel.textContent = i18n.t('hero.on'); ringLabel.className = 'ring-label on'; }
      if (ringIcon)  ringIcon.classList.add('active');
      if (ripples)   ripples.classList.add('active-ripples');

      // Send to backend
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ type: 'START_STREAM', payload: {} }));
      }
    });

    stopBtn?.addEventListener('click', () => {
      if (window.webrtcManager) {
        window.webrtcManager.stopCapture();
      }

      this._broadcasting = false;
      this._startTime    = null;
      stopBtn.style.display  = 'none';
      if (startBtn)  startBtn.style.display = '';
      if (ringLabel) { ringLabel.textContent = i18n.t('hero.off'); ringLabel.className = 'ring-label off'; }
      if (ringIcon)  ringIcon.classList.remove('active');
      if (ripples)   ripples.classList.remove('active-ripples');
      const up = document.getElementById('val-uptime');
      if (up) up.textContent = '00:00';

      // Send to backend
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ type: 'STOP_STREAM', payload: {} }));
      }
    });

    // Uptime
    setInterval(() => {
      if (!this._broadcasting || !this._startTime) return;
      const s = Math.floor((Date.now() - this._startTime) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const el = document.getElementById('val-uptime');
      if (el) el.textContent = h
        ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
        : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }, 1000);

    document.addEventListener('vs:langchange', () => {
      const rl = document.getElementById('ring-label');
      if (rl) {
        rl.textContent = this._broadcasting ? i18n.t('hero.on') : i18n.t('hero.off');
      }
    });
  }

  /* ── Settings ──────────────── */
  _settings() {
    const overlay  = document.getElementById('overlay');
    const drawer   = document.getElementById('drawer');
    const openBtn  = document.getElementById('btn-settings');
    const closeBtn = document.getElementById('btn-drawer-close');
    const comprEl  = document.getElementById('s-compress');
    const comprVal = document.getElementById('s-compress-val');

    const open  = () => { overlay?.classList.add('open'); drawer?.classList.add('open'); };
    const close = () => { overlay?.classList.remove('open'); drawer?.classList.remove('open'); };

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    comprEl?.addEventListener('input', () => {
      if (comprVal) comprVal.textContent = `${comprEl.value}%`;
    });
  }

  /* ── Author Modal ───────────── */
  _authorModal() {
    const btn = document.getElementById('btn-author');
    const modal = document.getElementById('author-modal');
    const closeBtn = document.getElementById('btn-author-close');

    if (btn && modal && closeBtn) {
      const open = () => { modal.style.display = 'flex'; };
      const close = () => { modal.style.display = 'none'; };

      btn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
    }
  }

  /* ── Copy link ─────────────── */
  _copyLink() {
    document.getElementById('btn-copy')?.addEventListener('click', (e) => {
      const ip   = document.getElementById('val-ip')?.textContent   ?? '?';
      const port = document.getElementById('val-port')?.textContent ?? '?';
      navigator.clipboard?.writeText(`vs://${ip}:${port}`).catch(() => {});
      const btn = e.currentTarget;
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Copied`;
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.particles     = new ParticleNetwork('particle-canvas');
  window.webrtcManager = new WebRTCManager();
  window.peerManager   = new PeerManager('peer-grid');
  window.streamMonitor = new StreamMonitor('stream-list');
  window.monitorMode   = new MonitorMode();
  window.app           = new App();
});
