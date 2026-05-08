export interface BackupFile {
  filename: string;
  createdAt: string; // ISO 8601
  sizeBytes: number;
  auto: boolean;     // true = criado automaticamente antes de um restore
}
