-- Veritabanı Oluşturma
CREATE DATABASE IF NOT EXISTS cafe_audit_db;
USE cafe_audit_db;

-- 1. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Gerçek uygulamada hashlenmiş olmalı
    name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'AUDITOR') NOT NULL,
    avatar VARCHAR(10), -- Emoji karakteri için
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek Kullanıcı Verileri
INSERT INTO users (username, password, name, role, avatar, location) VALUES
('engin', '123', 'Engin Koç', 'AUDITOR', '👨‍💼', 'Merkez Şube / İstanbul'),
('merve', '123', 'Merve Demir', 'AUDITOR', '👩‍🔬', 'Kadıköy Şube / İstanbul'),
('can', '123', 'Can Yılmaz', 'AUDITOR', '👨‍🔧', 'Beşiktaş Şube / İstanbul'),
('admin', 'admin', 'Yönetici', 'ADMIN', '👑', 'Genel Merkez');

-- 2. Denetimler (Audits) Tablosu
CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(50) PRIMARY KEY, -- 'AUD-12345' formatı için
    auditor_id INT NOT NULL,
    location VARCHAR(100) NOT NULL,
    audit_date DATE NOT NULL,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auditor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Denetim Cevapları (Responses) Tablosu
CREATE TABLE IF NOT EXISTS audit_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(10) NOT NULL, -- 'A', 'B' vb.
    item_id VARCHAR(50) NOT NULL, -- 'a1', 'b2' veya 'custom-...'
    label VARCHAR(255) NOT NULL,
    status ENUM('good', 'bad') NOT NULL,
    note TEXT,
    photo LONGTEXT, -- Base64 formatındaki resimler için geniş alan
    is_custom BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
);

-- Örnek Sorgular:

-- A) Bir denetçinin tüm geçmiş denetimlerini getir
-- SELECT * FROM audits WHERE auditor_id = 1 ORDER BY audit_date DESC;

-- B) Belirli bir denetimin detaylarını ve cevaplarını getir
-- SELECT * FROM audit_responses WHERE audit_id = 'AUD-12345';
