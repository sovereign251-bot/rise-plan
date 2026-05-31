import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (Buffer.isBuffer(body)) body = JSON.parse(body.toString());
    if (typeof body === 'string') body = JSON.parse(body);

    const { action, name, email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const key = `user:${email.toLowerCase().trim()}`;

    if (action === 'signup') {
      if (!name) return res.status(400).json({ error: 'Name required.' });
      const existing = await kv.get(key);
      if (existing) return res.status(409).json({ error: 'Account already exists. Please log in.' });
      await kv.set(key, { name: name.trim(), email: email.toLowerCase().trim(), password });
      return res.status(200).json({ ok: true, user: { name: name.trim(), email: email.toLowerCase().trim() } });
    }

    if (action === 'login') {
      const user = await kv.get(key);
      if (!user) return res.status(404).json({ error: 'No account found. Please sign up.' });
      if (user.password !== password) return res.status(401).json({ error: 'Incorrect password.' });
      return res.status(200).json({ ok: true, user: { name: user.name, email: user.email } });
    }

    return res.status(400).json({ error: 'Invalid action.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
