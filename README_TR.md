<div align="center">
  <img src="https://raw.githubusercontent.com/FOXYorj/VeloStream/main/css/logo.svg" alt="VeloStream Logo" width="120" onerror="this.style.display='none'"/>
  <h1>VeloStream</h1>
  <p><strong>Saf P2P Yerel Ağ Yayını. Sıfır gecikme, bulut yok.</strong></p>

  <p>
    <a href="README.md">🇬🇧 English</a> •
    <a href="README_TR.md">🇹🇷 Türkçe</a>
  </p>

  <p>
    <a href="#özellikler">Özellikler</a> •
    <a href="#nasıl-çalışır">Nasıl Çalışır</a> •
    <a href="#kurulum">Kurulum</a> •
    <a href="#kullanım">Kullanım</a> •
    <a href="#yol-haritası">Yol Haritası</a>
  </p>
</div>

---

**VeloStream**, ultra hızlı, tamamen eşler arası (P2P) bir yerel ağ yayın çözümüdür. Bilgisayarınızın ekranını ve sistem sesini, aynı Wi-Fi veya Ethernet ağı üzerindeki herhangi bir başka cihaza (telefon, tablet veya başka bir bilgisayar) yayınlamanızı sağlar.

İnternet üzerinden yönlendirme yok, bulut sunucular yok, abonelik yok. WebRTC ve Golang kullanılarak elde edilen saf yerel ağ performansı.

## ✨ Özellikler

- ⚡ **Sıfır Gecikmeli P2P:** WebRTC ile cihazdan cihaza doğrudan (direct) yayın.
- 🔍 **Otomatik Cihaz Keşfi:** UDP yayınlarını kullanarak ağınızdaki diğer VeloStream sunucularını otomatik bulur.
- 💻 **Çapraz Platform Alıcı:** Yayınınızı modern bir web tarayıcısı olan tüm cihazlardan (iOS, Android, Windows, Mac) izleyebilirsiniz.
- 🔊 **Sistem Sesi Desteği:** Ekranınızla beraber bilgisayarınızdaki tüm sesleri native olarak paylaşın.
- 🎨 **Modern ve Çift Dilli UI:** İçinde hem İngilizce hem de Türkçe desteği barındıran muazzam bir dark-mode arayüzü.
- 🛠 **Hafif Backend:** İnanılmaz eşzamanlılık (concurrency) hızı ve düşük bellek tüketimi için tamamen Go (Golang) ile geliştirildi.

## 📸 Ekran Görüntüleri

<div align="center">
  <img src="screenshots/desktop.png" alt="Masaüstü Arayüzü" width="600" style="border-radius: 8px; margin-right: 10px;" />
  <img src="screenshots/mobile.png" alt="Mobil Arayüz" width="280" style="border-radius: 8px;" />
</div>

## 🏗 Nasıl Çalışır?

1. **Go Backend:** HTML/JS/CSS dosyalarını HTTP üzerinden sunar ve bir WebSocket Hub'ı yönetir. Aynı zamanda ağdaki diğer VeloStream sunucularını bulmak için UDP paketleri yayar.
2. **Sinyal Sunucusu (Signaling):** Go backend, bağlanan cihazlar (tarayıcılar) arasındaki WebRTC sinyal mesajlarını (`SDP Offers`, `Answers` ve `ICE Candidates`) birbirine iletir.
3. **WebRTC:** Sinyalleşme tamamlandığında, tarayıcılar video/ses verilerini paylaşmak için birbirlerine doğrudan P2P olarak bağlanır. Yani videonuz Go sunucusu üzerinden geçmez; doğrudan host tarayıcıdan, izleyici tarayıcıya (örneğin telefonunuza) akar.

## 🚀 Kurulum

### Gereksinimler
- Bilgisayarınızda [Go (Golang)](https://golang.org/dl/) 1.20 veya daha yeni bir sürümünün kurulu olması gerekir.

### Hızlı Başlangıç

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/FOXYorj/VeloStream.git
   cd VeloStream
   ```
2. Gerekli kütüphaneleri indirin:
   ```bash
   go mod tidy
   ```
3. VeloStream sunucusunu başlatın:
   ```bash
   go run .
   ```
   *Not: Windows Güvenlik Duvarı izin isterse, UDP cihaz keşfinin ve web sunucusunun ağınızda çalışabilmesi için "Özel Ağlar" iznini verdiğinizden emin olun.*

## 📖 Kullanım

### 1. Yayın Başlatma (Host Bilgisayar)
- Go sunucusunun çalıştığı bilgisayarda modern bir tarayıcı (Chrome/Edge önerilir) açın.
- Şu adrese gidin: **`http://localhost:8080`**
  *(⚠️ **Kritik:** Yayıncı bilgisayarda lokal IP adresi yerine kesinlikle `localhost` yazmalısınız. Tarayıcılar güvenlik gereği ekran yakalama izinlerini sadece HTTPS veya `localhost` üzerinde verir).*
- **"Yayını Başlat"** butonuna tıklayın.
- Chrome size bir seçim ekranı açacaktır. **"Tüm Ekran"** (Entire Screen) sekmesini seçin.
- Bilgisayarın sesini de paylaşmak istiyorsanız o küçük penceredeki **"Sistem sesini paylaş"** kutucuğunu işaretlemeyi unutmayın.
- Seçiminizi yapıp onaylayın. Ekranınızın sağ alt köşesinde ne paylaştığınızı gösteren mini bir HUD açılacaktır.

### 2. Yayını İzleme (Mobil Alıcı / İkinci Bilgisayar)
- Telefonunuzu, tabletinizi veya dizüstü bilgisayarınızı host bilgisayarla **aynı Wi-Fi ağına** bağlayın.
- Tarayıcıyı açın ve yayıncı bilgisayarın o anki yerel IP adresini yazın. Örneğin: **`http://192.168.1.138:8080`**
- Gelen sayfada **"Aktif Yayınlar"** sekmesinin altında ana bilgisayarın yayınını göreceksiniz.
- **"Bağlan"** (Connect) butonuna basın.
- Yayın anında "Gerçek Tam Ekran (Native Fullscreen)" modunda ve sıfır gecikmeyle açılacaktır. (Eğer telefonunuz güvenlik gereği sesi kısarsa ekrandaki kontrollerden sesi açabilirsiniz).

## 🗺 Yol Haritası

- [x] **Mobil Alıcı:** Herhangi bir telefonu veya tableti gecikmesiz bir ikincil ekrana/monitöre çevirin.
- [x] **Sistem Sesini Paylaşma:** PC sesini video ile birlikte eşzamanlı olarak yayınlayın.
- [ ] **Sanal Ses Kablosu (Virtual Audio Cable):** Sistem seslerini karıştırmadan sadece belirli bir uygulamanın sesini yakalayın.
- [ ] **Yayın Kaydetme:** Gelen yayınları doğrudan MP4 (H.264/VP9) olarak diske kaydedin.
- [ ] **Çoklu Yayın (Multi-Cast):** Akıllı bant genişliği dağıtımı ile yayını ağdaki birden fazla cihaza eşzamanlı gönderin.

## 🤝 Katkıda Bulunma

Her türlü katkıya ve Pull Request'e (PR) açığız. Büyük değişiklikler için, ne değiştirmek istediğinizi tartışmak üzere öncelikle bir "Issue" (Sorun/Talep) açmanızı rica ederiz.

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Daha fazla detay için `LICENSE` dosyasına bakabilirsiniz.

---
*Yerel ağ sevdasına, tutkuyla geliştirildi.*
