import { useState } from 'react';
import { useBackups } from '../hooks/useBackups';
import { Button } from './ui/Button';

interface Props {
  account: string;
  onClose: () => void;
  onRestored: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

export function BackupsPanel({ account, onClose, onRestored }: Props) {
  const { backups, loading, error, create, restore, remove } = useBackups(account);
  const [creating, setCreating] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true); setActionError(null);
    try { await create(); } catch (e) { setActionError((e as Error).message); }
    finally { setCreating(false); }
  }

  async function handleRestore(filename: string) {
    setActionError(null);
    try { await restore(filename); setConfirmRestore(null); onRestored(); }
    catch (e) { setActionError((e as Error).message); }
  }

  async function handleRemove(filename: string) {
    setActionError(null);
    try { await remove(filename); } catch (e) { setActionError((e as Error).message); }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm">← Contas</button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Backups — {account}</h2>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="text-xs px-3 py-1.5">{creating ? 'Salvando…' : '+ Criar backup'}</Button>
      </div>

      {(error ?? actionError) && (
        <p className="mx-5 mt-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">{error ?? actionError}</p>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading && <p className="text-sm text-slate-400 text-center py-8">Carregando…</p>}
        {!loading && backups.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum backup ainda.</p>}

        {backups.map(b => (
          <div key={b.filename} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-750">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{formatDate(b.createdAt)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatBytes(b.sizeBytes)}</span>
                  {b.auto && <span className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md">automático</span>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 ml-2">
                <button onClick={() => setConfirmRestore(b.filename)}
                  className="text-xs px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >Restaurar</button>
                <button onClick={() => handleRemove(b.filename)}
                  className="text-xs px-2 py-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >×</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">Restaurar backup?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">O estado atual de <strong>{account}</strong> será salvo como backup automático antes de restaurar.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Esta ação não pode ser desfeita manualmente.</p>
            {actionError && <p className="text-sm text-rose-600 dark:text-rose-400 mb-3">{actionError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmRestore(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleRestore(confirmRestore)}>Restaurar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
