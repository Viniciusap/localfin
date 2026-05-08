import 'dotenv/config';
import path from 'path';

export const PORT = process.env.PORT ?? '3333';
export const DB_DIR = process.env.DB_DIR ?? 'DBs';
export const BACKUP_DIR = process.env.BACKUP_DIR ?? path.join(DB_DIR, 'backups');
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
