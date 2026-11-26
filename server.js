const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();

const PORT = Number(process.env.PORT || 3000);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'plsp_one';
const SESSION_SECRET = process.env.SESSION_SECRET || 'replace-this-with-a-long-random-secret';

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(session({
  name: 'plsp.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));

const pool = mysql.createPool({
  host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME,
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

app.post('/api', async (req, res) => {
  const action = String(req.query.action || '');
  const data = req.body || {};
  try {
    if (action === 'register') {
      const id = String(data.student_id || '').trim();
      const name = String(data.name || '').trim();
      const course = String(data.course || '').trim();
      const year = String(data.year_level || '').trim();
      const section = String(data.section || 'A').trim().toUpperCase();
      const password = String(data.password || '');
      if (!/^\d{2}-\d{5}$/.test(id) || name.length < 2 || !course || !['1st Year','2nd Year','3rd Year','4th Year'].includes(year) || password.length < 6 || section.length > 3) {
        return sendError(res, 422, 'Please check your details. Student ID must be YY-NNNNN and password at least 6 characters.');
      }
      const [existing] = await pool.execute('SELECT student_id FROM students WHERE student_id = ? LIMIT 1', [id]);
      if (existing.length) return sendError(res, 409, 'This Student ID is already registered.');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 12);
      await pool.execute('INSERT INTO students (student_id, full_name, course, year_level, section, password_hash) VALUES (?, ?, ?, ?, ?, ?)', [id, name, course, year, section, hash]);
      return res.status(201).json({ success: true, message: 'Registration successful.' });
    }

    if (action === 'login') {
      const id = String(data.student_id || '').trim();
      const password = String(data.password || '');
      const [rows] = await pool.execute('SELECT student_id, full_name, course, year_level, section, password_hash FROM students WHERE student_id = ? AND status = \'Active\' LIMIT 1', [id]);
      const row = rows[0];
      const bcrypt = require('bcryptjs');
      if (!row || !(await bcrypt.compare(password, row.password_hash))) return sendError(res, 401, 'Incorrect Student ID or password.');
      req.session.studentId = row.student_id;
      return res.json({ success: true, user: { id: row.student_id, name: row.full_name, course: row.course, year: row.year_level, sec: row.section } });
    }

    if (action === 'update_profile') {
      if (!req.session.studentId) return sendError(res, 401, 'Please sign in again.');
      const name = String(data.name || '').trim();
      const course = String(data.course || '').trim();
      const year = String(data.year || '').trim();
      const section = String(data.section || 'A').trim().toUpperCase();
      if (name.length < 2 || !course || !['1st Year','2nd Year','3rd Year','4th Year'].includes(year) || section.length > 3) return sendError(res, 422, 'Please enter valid profile details.');
      await pool.execute('UPDATE students SET full_name=?, course=?, year_level=?, section=? WHERE student_id=?', [name, course, year, section, req.session.studentId]);
      return res.json({ success: true, user: { id: req.session.studentId, name, course, year, sec: section } });
    }

    if (action === 'logout') {
      return req.session.destroy(() => res.clearCookie('plsp.sid').json({ success: true }));
    }
    return sendError(res, 404, 'Unknown API action.');
  } catch (err) {
    console.error('API error:', err.message);
    if (err && err.code === 'ER_DUP_ENTRY') return sendError(res, 409, 'This Student ID is already registered.');
    return sendError(res, 500, 'Server or database error. Check MySQL settings and make sure the database has been imported.');
  }
});

app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

(async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => console.log(`PLSP ONE is running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Import database.sql and check DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.');
    process.exit(1);
  }
})();
