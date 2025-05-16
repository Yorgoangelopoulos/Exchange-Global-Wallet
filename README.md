# CryptoVault - Çok Ağlı Kripto Para Cüzdanı

![CryptoVault Logo](./generated-icon.png)

## Proje Tanımı

CryptoVault, tek bir kurtarma ifadesi kullanarak çoklu blok zinciri ağları için cüzdan adresleri oluşturabilen, kullanıcı dostu ve güvenli bir kripto para cüzdanıdır. Exodus benzeri modern bir arayüze sahip olup, tüm kripto varlıklarınızı tek bir platformda yönetmenize olanak tanır.

## Özellikler

### ✨ Temel Özellikler
- **Çoklu Blok Zinciri Desteği**: Ethereum, BNB Smart Chain (BSC), Solana ve TRON ağlarında cüzdan oluşturma ve yönetme.
- **HD Cüzdan Teknolojisi**: Tek bir kurtarma ifadesinden farklı blok zincirleri için adresler türetme.
- **Güvenli Erişim**: Master şifre koruması ve oturum zaman aşımı.
- **Gerçek Adresler**: Tüm oluşturulan adresler, blok gezginlerinde doğrulanabilir gerçek adreslerdir.
- **Bakiye Görüntüleme**: Her kripto para için gerçek zamanlı bakiye görüntüleme.
- **Portföy Takibi**: Tüm varlıklarınızı görselleştirme ve toplam portföy değerini izleme.

### 🎨 Kullanıcı Arayüzü
- **Modern Şeffaf Tasarım**: Exodus benzeri koyu tema ve cam benzeri şeffaf bileşenler.
- **Duyarlı Arayüz**: Farklı ekran boyutlarına uyum sağlayan tasarım.
- **Animasyonlu Geçişler**: Framer Motion ile akıcı kullanıcı deneyimi.
- **Gerçek Zamanlı Güncelleme**: Fiyat verilerinin düzenli güncellenmesi.

### 🔐 Güvenlik
- **Yerel Depolama**: Hassas veriler yalnızca yerel olarak saklanır.
- **Şifre Koruması**: Kripto para varlıklarına erişim için master şifre gerekliliği.
- **Oturum Zaman Aşımı**: 20 dakika kullanılmadığında otomatik oturum kapatma.
- **Özel Anahtarlar**: Cüzdan adlarına göre düzenlenmiş kurtarma ifadeleri ve özel anahtarlar.

## Desteklenen Kripto Para Birimleri

| Logo | Kripto Para | Sembol | Blok Zinciri |
|------|-------------|--------|--------------|
| ![Ethereum](https://cryptologos.cc/logos/ethereum-eth-logo.svg) | Ethereum | ETH | Ethereum |
| ![BNB](https://cryptologos.cc/logos/bnb-bnb-logo.svg) | BNB Smart Chain | BNB | Binance Smart Chain |
| ![Solana](https://cryptologos.cc/logos/solana-sol-logo.svg) | Solana | SOL | Solana |
| ![TRON](https://cryptologos.cc/logos/tron-trx-logo.svg) | TRON | TRX | TRON |

## Teknoloji Yığını

### Frontend
- React (TypeScript)
- Tailwind CSS
- Shadcn UI Bileşenleri
- Framer Motion (Animasyonlar)

### Backend
- Express.js
- PostgreSQL Veritabanı
- Drizzle ORM
- API Entegrasyonları (CoinGecko, Blok Zinciri API'leri)

### Cüzdan Teknolojileri
- HD (Hiyerarşik Deterministik) Cüzdan
- BIP39 Kurtarma İfadeleri
- Çoklu Blok Zinciri Adresleri
- ECDSA İmzalama (Ethereum/BSC)
- ED25519 İmzalama (Solana)

## Kurulum

### Gereksinimler
- Node.js (v18+)
- PostgreSQL Veritabanı

### Kurulum Adımları
```bash
# Repoyu klonla
git clone https://github.com/Yorgoangelopoulos/Exchange-Global-Wallet.git
cd Exchange-Global-Wallet

# Bağımlılıkları yükle
npm install

# Veritabanını hazırla
npm run db:push

# Uygulamayı başlat
npm run dev
```

## Kullanım Kılavuzu

### Cüzdan Oluşturma
1. Ana ekrandan "Cüzdan Oluştur" seçeneğini tıklayın
2. Master şifrenizi belirleyin ve güvenli bir yere kaydedin
3. Oluşturulan kurtarma ifadesini kaydedin (kaybetmeyeceğiniz güvenli bir yerde saklayın)
4. Yeni cüzdanınız için bir isim girin ve oluşturmayı tamamlayın

### Cüzdana Erişim
1. Uygulama her başlatıldığında master şifre istenecektir
2. Doğru şifreyi girdikten sonra cüzdanınıza erişebilirsiniz
3. 20 dakika işlem yapılmazsa oturum otomatik olarak sonlandırılır

### Portföy Görüntüleme
1. Dashboard ekranında tüm kripto para varlıklarınızı görebilirsiniz
2. Her kripto para kartı, mevcut bakiye ve fiyat bilgilerini gösterir
3. Portföy sayfasında varlıklarınızın dağılımını görebilirsiniz

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylı bilgi için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

GitHub: [Yorgoangelopoulos](https://github.com/Yorgoangelopoulos)
=======
# Exchange-Global-Wallet
>>>>>>> f85f17263355074e4a17b6c5637f07e0c6b0e4e3
