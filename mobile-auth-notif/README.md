# Praktikum Autentikasi JWT dan Push Notification

Proyek ini mengimplementasikan autentikasi menggunakan JSON Web Token (JWT) pada REST API Express.js dengan basis data MySQL, serta integrasi Push Notification melalui Expo Push Service dan Firebase Cloud Messaging (FCM).

---

## Struktur Direktori

```text
PraktikumJWT/
├── api-auth-notif/             # Backend Express + MySQL + JWT
│   ├── middleware/
│   │   └── auth.js             # Middleware verifikasi Bearer JWT
│   ├── routes/
│   │   ├── auth.js             # Endpoint register, login, me
│   │   └── notifications.js    # Endpoint token & test push
│   ├── services/
│   │   └── pushService.js      # Pengiriman pesan ke Expo Push Service
│   ├── .env                    # Kredensial lingkungan backend
│   ├── .env.example            # Template variabel environment
│   ├── app.js                  # Konfigurasi Express & route global
│   ├── db.js                   # MySQL Connection Pool
│   ├── schema.sql              # Skema tabel users & push_tokens
│   ├── server.js               # Entry point menjalankan server
│   └── package.json
│
└── mobile-auth-notif/          # Frontend React Native Expo
    ├── app/
    │   ├── _layout.js          # Root Layout & AuthProvider
    │   ├── sign-in.js          # Layar login
    │   ├── register.js         # Layar registrasi
    │   └── (app)/
    │       ├── _layout.js      # App Layout & Notification Listener
    │       ├── index.js        # Home screen (Profile, Aktifkan/Test Push, Logout)
    │       └── profile.js      # Halaman profil privat
    ├── context/
    │   └── AuthContext.js      # Global state autentikasi & SecureStore
    ├── services/
    │   ├── api.js              # Helper HTTP fetch
    │   ├── authService.js      # Service autentikasi
    │   └── notificationService.js # Service simpan & uji push token
    ├── utils/
    │   └── notifications.js    # Handler izin notifikasi & ExpoPushToken
    ├── app.json                # Konfigurasi Expo & FCM Android
    ├── eas.json                # Konfigurasi build EAS
    └── .env                    # Variabel EXPO_PUBLIC_API_URL
```

---

## 1. Menjalankan Backend (`api-auth-notif`)

### Prasyarat
- Node.js (v18+)
- MySQL Server (XAMPP / MySQL Workbench / Docker)

### Langkah-langkah
1. Pastikan database MySQL sudah dibuat dan schema dieksekusi:
   ```sql
   -- Eksekusi schema.sql pada phpMyAdmin / MySQL CLI
   CREATE DATABASE IF NOT EXISTS db_mobile_auth;
   USE db_mobile_auth;
   -- Buat tabel users dan push_tokens sesuai schema.sql
   ```
2. Pastikan file `.env` sudah sesuai:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3307
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_mobile_auth
   JWT_SECRET=ganti_dengan_rahasia_panjang_acak_12345abcde
   JWT_EXPIRES_IN=1h
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan backend:
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:3000`.

---

## 2. Panduan Pengujian 13 Endpoint di Postman

Gunakan kredensial berikut untuk pengujian sesuai laporan:
- **Nama**: `Nazril Febry Fadli`
- **Email**: `nazril@example.com`
- **Password**: `rahasia123`

| No | Method | URL | Auth | Body (JSON) | Ekspektasi |
|:--:|:------:|:----|:----:|:------------|:-----------|
| **01** | `POST` | `http://localhost:3000/auth/register` | No Auth | `{"nama": "Nazril Febry Fadli", "email": "nazril@example.com", "password": "rahasia123"}` | `201 Created` Data user tanpa password |
| **02** | `POST` | `http://localhost:3000/auth/register` | No Auth | (Body sama seperti no. 01) | `409 Conflict` `{"pesan": "email sudah terdaftar"}` |
| **03** | `POST` | `http://localhost:3000/auth/register` | No Auth | `{}` | `400 Bad Request` `{"pesan": "nama, email, dan password wajib diisi"}` |
| **04** | `POST` | `http://localhost:3000/auth/register` | No Auth | `{"nama": "A", "email": "a@example.com", "password": "123"}` | `400 Bad Request` `{"pesan": "password minimal 8 karakter"}` |
| **05** | `POST` | `http://localhost:3000/auth/login` | No Auth | `{"email": "nazril@example.com", "password": "rahasia123"}` | `200 OK` Token JWT + data user (Simpan token ini!) |
| **06** | `POST` | `http://localhost:3000/auth/login` | No Auth | `{"email": "nazril@example.com", "password": "salah"}` | `401 Unauthorized` `{"pesan": "email atau password salah"}` |
| **07** | `GET` | `http://localhost:3000/auth/me` | No Auth | *Kosong* | `401 Unauthorized` `{"pesan": "token diperlukan"}` |
| **08** | `GET` | `http://localhost:3000/auth/me` | Bearer Token: `tokenrusak123` | *Kosong* | `401 Unauthorized` `{"pesan": "token tidak valid"}` |
| **09** | `GET` | `http://localhost:3000/auth/me` | Bearer Token: `<JWT dari No. 05>` | *Kosong* | `200 OK` Data profil { id, nama, email, dibuat_pada } |
| **10** | `POST` | `http://localhost:3000/notifications/token` | **No Auth** *(Pastikan tab Auth diset "No Auth")* | *Kosong* | `401 Unauthorized` `{"pesan": "token diperlukan"}` |
| **11** | `POST` | `http://localhost:3000/notifications/test` | Bearer Token: `<JWT dari No. 05>` | *Kosong* | `404 Not Found` `{"pesan": "perangkat belum mendaftarkan push token"}` |
| **12** | `POST` | `http://localhost:3000/notifications/token` | Bearer Token: `<JWT dari No. 05>` | `{"expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"}` | `201 Created` `{"pesan": "push token tersimpan"}` |
| **13** | `POST` | `http://localhost:3000/notifications/test` | Bearer Token: `<JWT dari No. 05>` | *Kosong* | `200 OK` `{"pesan": "notifikasi dikirim", "hasil": [...]}` |

> **Catatan Kendala Nomor 10:**
> Di Postman, bila Anda menggunakan Collection/Folder, pastikan tab **Authorization** pada Request nomor 10 disetel ke **No Auth** (bukan *Inherit auth from parent*). Bila token terkirim otomatis, backend akan memproses autentikasi dan meminta body token, sehingga tidak mengeluarkan status 401.

---

## 3. Menjalankan Frontend (`mobile-auth-notif`)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd ../mobile-auth-notif
   ```
2. Install dependency:
   ```bash
   npm install
   ```
3. Sesuaikan URL API pada file `.env`:
   - Jika menggunakan emulator Android: `http://10.0.2.2:3000`
   - Jika menggunakan perangkat fisik: `http://<IP_V4_LAPTOP>:3000` (contoh: `http://192.168.1.10:3000`)
4. Jalankan aplikasi:
   ```bash
   npx expo start
   ```
