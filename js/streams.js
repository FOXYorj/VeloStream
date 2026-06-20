/**
 * VeloStream — Stream Monitor
 * Gerçek proje: Mock veri yok. Aktif yayınlar Go backend'den gelecek.
 */

class StreamMonitor {
  constructor(containerId) {
    this.el      = document.getElementById(containerId);
    this.streams = []; // gerçek backend buraya yazacak
    this.charts  = {};

    this._render();
    document.addEventListener('vs:langchange', () => this._render());
  }

  /**
   * Backend'den yayın listesi güncellemesi geldiğinde çağrılır.
   * @param {Array} streams
   */
  updateStreams(streams) {
    this.streams = streams;
    this._render();
    this._updateCount();
  }

  addStream(stream) {
    if (!this.streams.find(s => s.id === stream.id)) {
      this.streams.push(stream);
      this._render();
      this._updateCount();
    }
  }

  removeStream(id) {
    this.streams = this.streams.filter(s => s.id !== id);
    delete this.charts[id];
    this._render();
    this._updateCount();
  }

  /**
   * Gerçek zamanlı bitrate verisi push edildiğinde:
   */
  pushBitrate(id, mbps) {
    if (this.charts[id]) {
      this.charts[id].push(mbps);
    }
    const el = document.getElementById(`bps-${id}`);
    if (el) el.textContent = `${mbps.toFixed(1)} Mbps`;
  }

  _render() {
    if (!this.el) return;

    // destroy old charts
    Object.values(this.charts).forEach(c => c?.destroy?.());
    this.charts = {};

    this.el.innerHTML = '';

    if (this.streams.length === 0) {
      this.el.innerHTML = `
        <div class="empty">
          <svg width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>
          </svg>
          <p class="empty-title" data-i18n="streams.empty.title">${i18n.t('streams.empty.title')}</p>
          <p class="empty-sub"   data-i18n="streams.empty.sub">${i18n.t('streams.empty.sub')}</p>
        </div>`;
      return;
    }

    for (const s of this.streams) {
      const card = document.createElement('div');
      card.className = 'card stream-card';
      card.id        = `stream-${s.id}`;
      card.innerHTML = `
        <div class="stream-info">
          <div class="stream-name">${s.title ?? s.id}</div>
          <div class="stream-tags">
            ${s.res    ? `<span class="tag">${s.res}</span>` : ''}
            ${s.codec  ? `<span class="tag">${s.codec}</span>` : ''}
            ${s.fps    ? `<span class="tag">${s.fps} FPS</span>` : ''}
            ${s.to     ? `<span class="tag">→ ${s.to}</span>` : ''}
          </div>
          <canvas class="stream-chart" id="chart-${s.id}" height="28"></canvas>
        </div>
        <div class="stream-right">
          <span class="stream-bps" id="bps-${s.id}">${(s.bitrate ?? 0).toFixed(1)} Mbps</span>
          <div class="stream-actions">
            <button class="btn btn-ghost btn-sm" onclick="streamMonitor.watchStream('${s.id}')"
              data-i18n="peers.btn.connect">${i18n.t('peers.btn.connect')}</button>
          </div>
        </div>`;
      this.el.appendChild(card);

      requestAnimationFrame(() => {
        const canvas = document.getElementById(`chart-${s.id}`);
        if (canvas) {
          this.charts[s.id] = new SparklineChart(canvas, {
            color: '#00d4e8', max: 40, points: 40,
          });
        }
      });
    }
  }

  watchStream(streamId) {
    if (window.webrtcManager) {
      // streamId is usually "stream-CLIENTID", we need the target client ID
      const targetId = streamId.replace('stream-', '');
      window.webrtcManager.watchStream(targetId);
    }
  }

  _updateCount() {
    const el = document.getElementById('stream-count');
    if (el) el.textContent = this.streams.length;
  }
}

window.StreamMonitor = StreamMonitor;
