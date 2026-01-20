# Kafe Denetim Merkezi (Cafe Audit App)

Bu proje, kafe yöneticileri ve saha denetçileri için geliştirilmiş modern, responsive bir web uygulamasıdır. Şu an için "Frontend-Only" mimaride çalışmakta olup, veriler tarayıcı yerel hafızasında (localStorage) saklanmaktadır. Gelecekte bir backend entegrasyonuna hazır olacak şekilde tasarlanmıştır.

## 🚀 Özellikler

*   **Rol Bazlı Giriş**: Yönetici (Admin) ve Denetçi (Auditor) panelleri.
*   **Dinamik Denetim Formu**: Önceden tanımlı kategoriler ve maddeler.
*   **Özel Madde Ekleme**: Denetçiler anlık olarak yeni denetim maddeleri ekleyebilir.
*   **Görsel ve Not Ekleme**: Her maddeye fotoğraf ve açıklama eklenebilir.
*   **Puanlama Sistemi**: Ağırlıklı puanlama ve anlık başarı skoru.
*   **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu arayüz.
*   **Arşivleme**: Tamamlanan denetimlerin yönetici ve denetçi tarafından görüntülenmesi.

## 🗄️ Veritabanı ve Veri Yapısı

Uygulama şu an `localStorage` kullanıyor olsa da, gerçek bir veritabanına geçiş için gerekli SQL şeması hazırdır.

*   `database.sql`: Projenin kök dizininde bulunan bu dosya, veri yapısının "Single Source of Truth" (Tek Gerçeklik Kaynağı) belgesidir.
*   **Kural**: Projedeki veri yapısında (User objesi, Audit yapısı vb.) yapılan her değişiklikte, bu SQL dosyası da güncellenerek backend geçişine her zaman hazır tutulacaktır.

## 🛠️ Kurulum ve Çalıştırma

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

3.  Tarayıcıda açın:
    `http://localhost:5173`

## 👤 Kullanıcı Bilgileri (Demo)

*   **Yönetici**: `admin` / `admin`
*   **Denetçi**: `engin` / `123`
