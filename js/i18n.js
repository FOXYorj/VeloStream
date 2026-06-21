/**
 * VeloStream — i18n System (TR / EN)
 */

const TRANSLATIONS = {
  en: {
    'nav.online':  'Local Network',
    'nav.offline': 'Offline',
    'nav.settings':'Settings',

    'hero.eyebrow':  'BROADCAST STATUS',
    'hero.title':    'Stream Anything.',
    'hero.accent':   'Instantly.',
    'hero.host':     'Host',
    'hero.ip':       'IP Address',
    'hero.port':     'Port',
    'hero.start':    'Start Broadcasting',
    'hero.stop':     'Stop',
    'hero.copy':     'Copy Link',
    'hero.on':       'LIVE',
    'hero.off':      'STANDBY',

    'stat.peers':   'Peers',
    'stat.latency': 'Avg Latency',
    'stat.bitrate': 'Throughput',
    'stat.uptime':  'Uptime',

    'peers.title':       'Peer Discovery',
    'peers.empty.title': 'No peers found',
    'peers.empty.sub':   'Make sure VeloStream is running on other devices on the same network.',
    'peers.btn.connect': 'Connect',
    'peers.btn.stream':  'Stream To',
    'peers.btn.disconnect': 'Disconnect',

    'streams.title':       'Active Streams',
    'streams.empty.title': 'No active streams',
    'streams.empty.sub':   'Start broadcasting or connect to a peer to see streams here.',
    'streams.btn.pause':   'Pause',
    'streams.btn.stop':    'Stop',
    'streams.btn.monitor': 'Monitor Mode',

    'roadmap.title': 'Roadmap',
    'roadmap.soon':  'Coming soon',
    'roadmap.done':  'Completed',

    'rm.audio.title': 'Virtual Audio Cable',
    'rm.audio.desc':  'Stream per-app audio without mixing system sound.',
    'rm.mobile.title':'Mobile Receiver',
    'rm.mobile.desc': 'Use any tablet or phone as a zero-lag secondary display.',
    'rm.rec.title':   'Stream Recording',
    'rm.rec.desc':    'Record streams to disk in H.264/VP9 with segment support.',
    'rm.multi.title': 'Multi-Cast',
    'rm.multi.desc':  'Broadcast to multiple receivers with bandwidth balancing.',
    'rm.remote.title':'Remote Control',
    'rm.remote.desc': 'Use your mobile device as a wireless mouse and keyboard.',
    'rm.gpu.title':   'Hardware Accel',
    'rm.gpu.desc':    'NVENC & AMF support for zero-impact host encoding.',

    'footer.copy':   '© 2025 VeloStream — Pure P2P, no cloud.',
    'footer.docs':   'Docs',
    'footer.github': 'GitHub',
    'footer.issues': 'Issues',

    's.network':    'Network',
    's.video':      'Video',
    's.audio':      'Audio',
    's.port':       'UDP Port',
    's.codec':      'Codec',
    's.fps':        'Target FPS',
    's.compress':   'Compression',
    's.discovery':  'Auto Discovery',
    's.audioen':    'Audio Streaming',
    's.sysaudio':   'System Audio',

    'author.projects':   'My Projects',
    'author.vs.desc':    'Pure P2P Local Network Streaming. Zero-latency, no cloud.',
    'author.share.desc': 'Secure file sharing project between devices on the local network.',
  },

  tr: {
    'nav.online':  'Yerel Ağ',
    'nav.offline': 'Çevrimdışı',
    'nav.settings':'Ayarlar',

    'hero.eyebrow':  'YAYIN DURUMU',
    'hero.title':    'Her Şeyi Yayınla.',
    'hero.accent':   'Anında.',
    'hero.host':     'Sunucu',
    'hero.ip':       'IP Adresi',
    'hero.port':     'Port',
    'hero.start':    'Yayını Başlat',
    'hero.stop':     'Durdur',
    'hero.copy':     'Bağlantıyı Kopyala',
    'hero.on':       'CANLI',
    'hero.off':      'BEKLEME',

    'stat.peers':   'Cihazlar',
    'stat.latency': 'Ort. Gecikme',
    'stat.bitrate': 'Bant Genişliği',
    'stat.uptime':  'Çalışma Süresi',

    'peers.title':       'Cihaz Keşfi',
    'peers.empty.title': 'Cihaz bulunamadı',
    'peers.empty.sub':   'Diğer cihazlarda VeloStream\'in çalıştığından ve aynı ağda olduğunuzdan emin olun.',
    'peers.btn.connect': 'Bağlan',
    'peers.btn.stream':  'Yayın Yap',
    'peers.btn.disconnect': 'Bağlantıyı Kes',

    'streams.title':       'Aktif Yayınlar',
    'streams.empty.title': 'Aktif yayın yok',
    'streams.empty.sub':   'Yayın başlatmak veya bir cihaza bağlanmak için yukarıdaki butonu kullanın.',
    'streams.btn.pause':   'Duraklat',
    'streams.btn.stop':    'Durdur',
    'streams.btn.monitor': 'Monitör Yap',

    'roadmap.title': 'Yol Haritası',
    'roadmap.soon':  'Yakında',
    'roadmap.done':  'Tamamlandı',

    'rm.audio.title': 'Sanal Ses Kablosu',
    'rm.audio.desc':  'Sistem sesini karıştırmadan uygulama bazlı ses yayını yapın.',
    'rm.mobile.title':'Mobil Alıcı',
    'rm.mobile.desc': 'Eski tablet veya telefonu sıfır gecikmeli ikinci ekrana dönüştürün.',
    'rm.rec.title':   'Yayın Kaydı',
    'rm.rec.desc':    'Gelen yayınları H.264/VP9 formatında diske kaydedin.',
    'rm.multi.title': 'Çoklu Yayın',
    'rm.multi.desc':  'Akıllı bant dengesiyle birden fazla alıcıya aynı anda yayın yapın.',
    'rm.remote.title':'Uzaktan Kontrol',
    'rm.remote.desc': 'Mobil cihazınızı PC için kablosuz fare ve klavye olarak kullanın.',
    'rm.gpu.title':   'Donanım Hızlandırma',
    'rm.gpu.desc':    'NVENC ve AMF desteğiyle işlemciyi yormadan sıfır gecikmeli yayın.',

    'footer.copy':   '© 2025 VeloStream — Saf P2P, bulut yok.',
    'footer.docs':   'Belgeler',
    'footer.github': 'GitHub',
    'footer.issues': 'Sorunlar',

    's.network':   'Ağ',
    's.video':     'Video',
    's.audio':     'Ses',
    's.port':      'UDP Port',
    's.codec':     'Codec',
    's.fps':       'Hedef FPS',
    's.compress':  'Sıkıştırma',
    's.discovery': 'Otomatik Keşif',
    's.audioen':   'Ses Yayını',
    's.sysaudio':  'Sistem Sesi',

    'author.projects':   'Projelerim',
    'author.vs.desc':    'Saf P2P Yerel Ağ Yayını. Sıfır gecikme, bulut yok.',
    'author.share.desc': 'Yerel ağda cihazlar arası güvenli dosya paylaşımı projesi.',
  },
};

class I18n {
  constructor() {
    const saved   = localStorage.getItem('vs_lang');
    const browser = navigator.language?.startsWith('tr') ? 'tr' : 'en';
    this.lang = saved || browser;
  }

  t(key) {
    return TRANSLATIONS[this.lang]?.[key]
        ?? TRANSLATIONS['en']?.[key]
        ?? key;
  }

  setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    localStorage.setItem('vs_lang', lang);
    this.applyAll();
  }

  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
        el.placeholder = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });
    document.documentElement.lang = this.lang;
    document.dispatchEvent(new CustomEvent('vs:langchange', { detail: { lang: this.lang } }));
  }
}

window.i18n = new I18n();
