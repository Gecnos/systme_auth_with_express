import 'dotenv/config';
import express from 'express';
import emailRoutes from './routes/emailRoutes.js';

const app = express();

app.use((req, res, next) => {
  console.log('\n========== REQUÊTE REÇUE ==========');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log('Body après parsing:', req.body);
  console.log('====================================\n');
  next();
});

app.use('/api/email', emailRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});