/**
 * VeloStream — Peer Discovery
 * Gerçek proje: Mock veri yok. Boş state gösterilir.
 * Gerçek peer'lar Go backend'den WebSocket/API üzerinden gelecek.
 */

class PeerManager {
  constructor(containerId) {
    this.el    = document.getElementById(containerId);
    this.peers = []; // gerçek backend buraya yazacak

    this._render();
    document.addEventListener('vs:langchange', () => this._render());

    // Gerçek backend bağlantısı hazır olduğunda:
    // this._connect();
  }

  /**
   * Backend'den peer listesi güncellemesi geldiğinde çağrılır.
   * @param {Array} peers  - [ { id, name, ip, latency, signal, status, avatar, os } ]
   */
  updatePeers(peers) {
    this.peers = peers;
    this._render();
    this._updateCount();
  }

  addPeer(peer) {
    if (!this.peers.find(p => p.id === peer.id)) {
      this.peers.push(peer);
      this._render();
      this._updateCount();
    }
  }

  removePeer(id) {
    this.peers = this.peers.filter(p => p.id !== id);
    this._render();
    this._updateCount();
  }

  updateLatency(id, ms) {
    const peer = this.peers.find(p => p.id === id);
    if (!peer) return;
    peer.latency = ms;
    const el = document.getElementById(`lat-${id}`);
    if (el) {
      el.textContent = `${ms}ms`;
      el.className   = `lat-badge ${this._latCls(ms)}`;
    }
  }

  _latCls(ms) {
    if (ms <= 15)  return 'low';
    if (ms <= 40)  return 'mid';
    return 'high';
  }

  _statusDot(s) {
    if (s === 'online')  return 'online';
    if (s === 'busy')    return 'busy';
    return 'offline';
  }

  _colCls(name) {
    // avatar rengi için basit hash
    const map = { 'c': 'c', 'v': 'v', 'g': 'g', 'y': 'y' };
    const letters = 'cvgy';
    return letters[(name?.charCodeAt(0) ?? 0) % 4];
  }

  _render() {
    if (!this.el) return;
    this.el.innerHTML = '';

    if (this.peers.length === 0) {
      this.el.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <svg width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"/>
          </svg>
          <p class="empty-title" data-i18n="peers.empty.title">${i18n.t('peers.empty.title')}</p>
          <p class="empty-sub"   data-i18n="peers.empty.sub">${i18n.t('peers.empty.sub')}</p>
        </div>`;
      return;
    }

    for (const peer of this.peers) {
      const col = this._colCls(peer.name);
      const card = document.createElement('div');
      card.className  = 'card peer-card';
      card.id         = `peer-${peer.id}`;
      card.innerHTML  = `
        <div class="peer-top">
          <div class="peer-av ${col}">
            ${(peer.avatar || peer.name?.slice(0, 2) || '??').toUpperCase()}
            <span class="peer-av-dot ${this._statusDot(peer.status)}"></span>
          </div>
          <div>
            <div class="peer-name">${peer.name}</div>
            <div class="peer-ip">${peer.ip}</div>
          </div>
        </div>
        <div class="peer-bot">
          <div class="peer-meta">
            <div class="sig s${peer.signal ?? 0}">
              <div class="sig-b"></div><div class="sig-b"></div>
              <div class="sig-b"></div><div class="sig-b"></div>
            </div>
            <span class="lat-badge ${this._latCls(peer.latency)}" id="lat-${peer.id}">${peer.latency}ms</span>
          </div>
        </div>`;
      this.el.appendChild(card);
    }
  }

  connectTo(id) {
    const peer = this.peers.find(p => p.id === id);
    if (!peer) return;
    // Gerçek bağlantı mantığı buraya gelecek
    console.log('[VeloStream] Connecting to peer:', peer);
    this._toast(`${i18n.t('peers.btn.connect')}: ${peer.name}`);
  }

  _updateCount() {
    const el = document.getElementById('peer-count');
    if (el) el.textContent = this.peers.length;
  }

  _toast(msg) {
    const t = Object.assign(document.createElement('div'), {
      textContent: msg,
    });
    Object.assign(t.style, {
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%) translateY(60px)',
      background: 'rgba(0,212,232,.1)',
      border: '1px solid rgba(0,212,232,.2)',
      backdropFilter: 'blur(12px)',
      color: '#f1f5f9', padding: '9px 18px',
      borderRadius: '100px', fontSize: '12px', fontWeight: '500',
      zIndex: '999', transition: 'transform .3s, opacity .3s', opacity: '0',
      pointerEvents: 'none',
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.transform = 'translateX(-50%) translateY(0)';
      t.style.opacity = '1';
    });
    setTimeout(() => {
      t.style.transform = 'translateX(-50%) translateY(60px)';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, 2600);
  }
}

window.PeerManager = PeerManager;
