import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PORT, CORS_ORIGIN } from './config';
import { bootstrap } from './db/jsonStore';
import accountsRouter from './routes/accounts';

bootstrap();

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use('/api/accounts', accountsRouter);

// Captura qualquer erro não tratado — previne 500 genérico sem detalhe
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(Number(PORT), () => {
  console.log(`Server → http://localhost:${PORT}`);
});
