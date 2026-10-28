import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { kirimExpoPush } from '../services/pushService.js';

const router = Router();

router.post('/token', wajibLogin, async (req, res) => {
  const { expoPushToken } = req.body || {};
  if (!expoPushToken || !expoPushToken.startsWith('Expo')) {
    return res.status(400).json({ pesan: 'push token tidak valid' });
  }
  try {
    await pool.query(
      `INSERT INTO push_tokens (user_id, expo_push_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         diperbarui_pada = CURRENT_TIMESTAMP`,
      [req.user.sub, expoPushToken]
    );
    res.status(201).json({ pesan: 'push token tersimpan' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'gagal menyimpan push token' });
  }
});

router.post('/test', wajibLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT expo_push_token
       FROM push_tokens
       WHERE user_id = ?
       ORDER BY diperbarui_pada DESC`,
      [req.user.sub]
    );
    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'perangkat belum mendaftarkan push token' });
    }
    const hasil = [];
    for (const row of rows) {
      try {
        const ticket = await kirimExpoPush(row.expo_push_token, {
          title: 'Praktikum Pemrograman Mobile',
          body: 'Login JWT dan push notification berhasil.',
          data: { screen: 'profile' },
        });
        hasil.push(ticket);
      } catch (errPush) {
        console.warn('Gagal memanggil Expo Push Service:', errPush.message);
        hasil.push({ status: 'warning', message: errPush.message });
      }
    }
    res.json({ pesan: 'notifikasi dikirim', hasil });
  } catch (e) {
    console.error(e);
    res.status(500).json({ pesan: 'gagal mengirim notifikasi' });
  }
});

export default router;