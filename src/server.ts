import express from 'express';
import cors from 'cors';
import sendEmailRoute from './send-email';
import aiRoutes from './routes/ai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.use('/api/send-email', sendEmailRoute);
app.use('/api/ai', aiRoutes);

app.listen(3000, () => {
  console.log('✅ Serveur backend lancé sur http://localhost:3000');
});