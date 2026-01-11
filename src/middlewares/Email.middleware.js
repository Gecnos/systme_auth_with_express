function validateEmail(req, res, next) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Email invalide' });

  next();
}

module.exports = { validateEmail };
