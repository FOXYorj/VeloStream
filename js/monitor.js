/**
 * VeloStream — Monitor Mode
 * Telefon veya tableti bir ikinci ekrana / monitöre dönüştürür.
 * Bağlantıyı yönetir, kalite gösterir, yeniden bağlanma dener.
 */

class MonitorMode {
  constructor() {
    this._streamHostId = null;
    this._reconnectTimer = null;
    this._reconnectAttempts = 0;
    this._maxReconnects = 10;
    this._active = false;

    this._buildUI();
  }

  /* ── UI Oluştur ──────────────────────────────── */
  _buildUI() {
    // Monitor Mode Overlay (tam ekran)
    const overlay = document.createElement('div');
    overlay.id = 'monitor-overlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 10000;
      flex-direction: column;
    `;
    overlay.innerHTML = `
      <!-- HUD Bar -->
      <div id="monitor-hud" style="
        position: absolute;
        top: 0; left: 0; right: 0;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
        z-index: 2;
        transition: opacity 0.4s ease;
      ">
        <!-- Left: Logo + Status -->
        <div style="display:flex; align-items:center; gap:10px;">
          <svg viewBox="0 0 30 30" fill="none" style="width:22px;height:22px;">
            <circle cx="15" cy="15" r="13" fill="none" stroke="#00d4e8" stroke-width="1" opacity=".4"/>
            <circle cx="15" cy="15" r="8"  fill="none" stroke="#00d4e8" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>
            <circle cx="15" cy="15" r="3.5" fill="#00d4e8"/>
          </svg>
          <span style="color:#fff;font-family:var(--font-sans,sans-serif);font-size:13px;font-weight:600;letter-spacing:.5px;">VeloStream</span>
          <div id="monitor-status-badge" style="
            display:flex;align-items:center;gap:5px;
            background:rgba(16,185,129,0.15);
            border:1px solid rgba(16,185,129,0.35);
            border-radius:20px;
            padding:2px 10px;
            font-size:11px;
            color:#10b981;
            font-family:var(--mono,monospace);
          ">
            <span id="monitor-dot" style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span>
            <span id="monitor-status-text">Monitor Mode</span>
          </div>
        </div>

        <!-- Right: Quality + Buttons -->
        <div style="display:flex;align-items:center;gap:8px;">
          <div id="monitor-quality" style="
            font-size:11px;
            color:rgba(255,255,255,0.5);
            font-family:var(--mono,monospace);
          ">—</div>
          <button id="monitor-fullscreen-btn" onclick="window.monitorMode.goFullscreen()" style="
            background:rgba(255,255,255,0.1);
            border:1px solid rgba(255,255,255,0.15);
            color:#fff;
            border-radius:8px;
            padding:6px 10px;
            cursor:pointer;
            font-size:12px;
            display:flex;align-items:center;gap:5px;
          ">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"/>
            </svg>
          </button>
          <button onclick="window.monitorMode.exit()" style="
            background:rgba(239,68,68,0.15);
            border:1px solid rgba(239,68,68,0.3);
            color:#ef4444;
            border-radius:8px;
            padding:6px 12px;
            cursor:pointer;
            font-size:12px;
            font-weight:600;
          ">Çıkış</button>
        </div>
      </div>

      <!-- Video -->
      <video id="monitor-video" autoplay playsinline style="
        width:100%;
        height:100%;
        object-fit:contain;
        display:block;
      "></video>

      <!-- Reconnecting Banner -->
      <div id="monitor-reconnect-banner" style="
        display:none;
        position:absolute;
        bottom:40px;left:50%;
        transform:translateX(-50%);
        background:rgba(11,15,25,0.9);
        border:1px solid rgba(0,212,232,0.3);
        border-radius:12px;
        padding:12px 20px;
        text-align:center;
        color:#00d4e8;
        font-size:13px;
        font-family:var(--font-sans,sans-serif);
        backdrop-filter:blur(12px);
      ">
        <div id="monitor-reconnect-text">Bağlantı kesildi. Yeniden bağlanılıyor...</div>
        <div id="monitor-reconnect-count" style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // HUD otomatik gizle (3sn dokunmadan sonra)
    let hudTimer = null;
    overlay.addEventListener('touchstart', () => {
      this._showHud();
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => this._hideHud(), 3000);
    });
    overlay.addEventListener('click', () => {
      this._showHud();
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => this._hideHud(), 3000);
    });

    this._overlay = overlay;
  }

  /* ── Monitör Modunu Başlat ───────────────────── */
  start(hostId) {
    this._streamHostId = hostId;
    this._reconnectAttempts = 0;
    this._active = true;
    this._overlay.style.display = 'flex';
    this._connect();
    this.goFullscreen();
    this._setStatus('Bağlanıyor...', '#f59e0b');
  }

  _connect() {
    if (!this._active) return;
    if (window.webrtcManager) {
      window.webrtcManager.watchStream(this._streamHostId, (stream) => {
        this._onStreamReceived(stream);
      });
    }
  }

  _onStreamReceived(stream) {
    const video = document.getElementById('monitor-video');
    if (!video) return;

    video.srcObject = stream;
    video.play().catch(() => {
      video.muted = true;
      video.play();
    });

    this._reconnectAttempts = 0;
    this._hideBanner();
    this._setStatus('Monitor Mode', '#10b981');

    // Kalite monitörü
    this._startQualityMonitor(stream);

    // Ses kısılmışsa kullanıcıya bir kez dokunma ipucu ver
    if (video.muted) {
      this._showMuteHint();
    }
  }

  _startQualityMonitor(stream) {
    if (this._qualityTimer) clearInterval(this._qualityTimer);
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    this._qualityTimer = setInterval(async () => {
      const pc = window.webrtcManager?._getActivePc(this._streamHostId);
      if (!pc) return;
      try {
        const stats = await pc.getStats();
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            const fps = report.framesPerSecond ?? '—';
            const kbps = report.bytesReceived
              ? Math.round((report.bytesReceived * 8) / 1000)
              : '—';
            const el = document.getElementById('monitor-quality');
            if (el) el.textContent = `${fps} FPS`;
          }
        });
      } catch (_) {}
    }, 1000);
  }

  /* ── Bağlantı Koptu → Yeniden Bağlan ──────────── */
  onDisconnected() {
    if (!this._active) return;
    this._reconnectAttempts++;
    if (this._reconnectAttempts > this._maxReconnects) {
      this._setStatus('Bağlantı Başarısız', '#ef4444');
      return;
    }

    this._setStatus('Yeniden Bağlanıyor...', '#f59e0b');
    this._showBanner(`Yeniden bağlanılıyor... (${this._reconnectAttempts}/${this._maxReconnects})`);

    clearTimeout(this._reconnectTimer);
    this._reconnectTimer = setTimeout(() => {
      this._connect();
    }, 2000);
  }

  /* ── Çıkış ───────────────────────────────────── */
  exit() {
    this._active = false;
    clearTimeout(this._reconnectTimer);
    clearInterval(this._qualityTimer);

    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const video = document.getElementById('monitor-video');
    if (video) video.srcObject = null;

    if (window.webrtcManager) window.webrtcManager.closePlayerModal();
    this._overlay.style.display = 'none';
    this._streamHostId = null;
  }

  /* ── Fullscreen ──────────────────────────────── */
  goFullscreen() {
    const el = this._overlay;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
    // iOS: video element için
    const video = document.getElementById('monitor-video');
    if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
  }

  /* ── HUD ─────────────────────────────────────── */
  _showHud() {
    const hud = document.getElementById('monitor-hud');
    if (hud) hud.style.opacity = '1';
  }
  _hideHud() {
    const hud = document.getElementById('monitor-hud');
    if (hud) hud.style.opacity = '0';
  }

  /* ── Status Badge ───────────────────────────── */
  _setStatus(text, color) {
    const badge = document.getElementById('monitor-status-badge');
    const dot = document.getElementById('monitor-dot');
    const textEl = document.getElementById('monitor-status-text');
    if (badge) badge.style.color = color;
    if (badge) badge.style.borderColor = color + '55';
    if (badge) badge.style.background = color + '22';
    if (dot) dot.style.background = color;
    if (textEl) textEl.textContent = text;
  }

  /* ── Reconnect Banner ───────────────────────── */
  _showBanner(text) {
    const banner = document.getElementById('monitor-reconnect-banner');
    const textEl = document.getElementById('monitor-reconnect-text');
    if (banner) banner.style.display = 'block';
    if (textEl) textEl.textContent = text;
  }
  _hideBanner() {
    const banner = document.getElementById('monitor-reconnect-banner');
    if (banner) banner.style.display = 'none';
  }

  _showMuteHint() {
    const video = document.getElementById('monitor-video');
    if (!video) return;
    const hint = document.createElement('div');
    hint.style.cssText = `
      position:absolute;bottom:80px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.15);
      color:#fff;border-radius:10px;padding:10px 18px;font-size:13px;
      text-align:center;z-index:3;backdrop-filter:blur(8px);cursor:pointer;
    `;
    hint.innerHTML = '🔇 Ses kısık — sesi açmak için buraya dokun';
    hint.onclick = () => {
      video.muted = false;
      hint.remove();
    };
    this._overlay.appendChild(hint);
    setTimeout(() => hint.remove(), 5000);
  }
}
