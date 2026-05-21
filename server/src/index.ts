import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import qrRoutes from './routes/qr';
import imageRoutes from './routes/image';
import utilsRoutes from './routes/utils';
import pdfRoutes from './routes/pdf';
import mediaRoutes from './routes/media';
import aiRoutes from './routes/ai';
import shortenerRoutes from './routes/shortener';
import currencyRoutes from './routes/currency';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/qr', qrRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/shortener', shortenerRoutes);
app.use('/api/currency', currencyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
