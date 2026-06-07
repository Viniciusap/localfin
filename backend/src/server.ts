import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, CORS_ORIGIN } from './config';
import { bootstrap } from './db/jsonStore';
import accountsRouter from './routes/accounts';

bootstrap();

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/accounts', accountsRouter);

const dist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

// Captura qualquer erro não tratado — previne 500 genérico sem detalhe
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(Number(PORT), () => {
  console.log(`Server → http://localhost:${PORT}`);
});
