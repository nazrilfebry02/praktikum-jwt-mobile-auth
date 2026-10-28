import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { nama, email, password } = req.body || {};
  if (!nama || !email || !password) {
    return res.status(400).json({ pesan: 'nama, email, dan password wajib diisi' });
  }
  if (password.length < 8) {
    return res.status(400).json({ pesan: 'password minimal 8 karakter' });
  }
  const emailBersih = email.trim().toLowerCase();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [hasil] = await pool.query(
      `INSERT INTO users (nama, email, password_hash) VALUES (?, ?, ?)`,
      [nama.trim(), emailBersih, passwordHash]
    );
    return res.status(201).json({ id: hasil.insertId, nama: nama.trim(), email: emailBersih });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'email sudah terdaftar' });
    }
    console.error(e);
    return res.status(500).json({ pesan: 'gagal membuat akun' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ pesan: 'email dan password wajib diisi' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ pesan: 'email atau password salah' });
    }
    const user = rows[0];
    const cocok = await bcrypt.compare(password, user.password_hash);
    if (!cocok) {
      return res.status(401).json({ pesan: 'email atau password salah' });
    }
    const token = jwt.sign(
      { email: user.email, nama: user.nama },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'pemrograman-mobile-api',
        audience: 'mobile-app',
        algorithm: 'HS256',
      }
    );
    return res.json({ token, user: { id: user.id, nama: user.nama, email: user.email } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ pesan: 'gagal login' });
  }
});

router.get('/me', wajibLogin, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nama, email, dibuat_pada FROM users WHERE id = ?',
    [req.user.sub]
  );
  if (rows.length === 0) {
    return res.status(404).json({ pesan: 'pengguna tidak ditemukan' });
  }
  res.json(rows[0]);
});

export default router;