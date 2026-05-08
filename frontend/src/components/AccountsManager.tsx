import { useState } from 'react';
import { BackupsPanel } from './BackupsPanel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  account: string;
  accounts: string[];
  onSwitch: (name: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (from: string, newName: string) => Promise<void>;
  onRemove: (name: string) => Promise<void>;
  onRestored: () => void;
  onClose: () => void;
}

export function AccountsManager({ account, accounts, onSwitch, onCreate, onRename, onRemove, onRestored, onClose }: Props) {
  const [backupsFor, setBackupsFor] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true); setError(null);
    try { await onCreate(newName.trim()); setNewName(''); }
    catch (e) { setError((e as Error).message); }
    finally { setCreating(false); }
  }

  async function handleRename(from: string) {
    if (!editName.trim() || editName === from) { setEditingAccount(null); return; }
    setError(null);
    try { await onRename(from, editName.trim()); setEditingAccount(null); }
    catch (e) { setError((e as Error).message); }
  }

  async function handleRemove(name: string) {
    setError(null);
    try { await onRemove(name); setDeleteConfirm(null); if (account === name) onClose(); }
    catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {backupsFor ? (
          <BackupsPanel account={backupsFor} onClose={() => setBackupsFor(null)} onRestored={() => { onRestored(); setBackupsFor(null); }} />
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Contas</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-2xl leading-none">×</button>
            </div>

            {error && <p className="mx-4 mt-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {accounts.map(a => (
                <div key={a} className={`p-3 rounded-xl border transition-colors ${
                  a === account
                    ? 'border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-700'
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}>
                  {editingAccount === a ? (
                    <div className="flex gap-2">
                      <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') void handleRename(a); if (e.key === 'Escape') setEditingAccount(null); }}
                        className="flex-1 px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500"
                      />
                      <Button className="text-xs px-2 py-1" onClick={() => handleRename(a)}>✓</Button>
                      <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => setEditingAccount(null)}>✕</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button onClick={() => { onSwitch(a); onClose(); }} className="flex items-center gap-2 flex-1 text-left">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a === account ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span className={`text-sm ${a === account ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{a}</span>
                      </button>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setBackupsFor(a)} className="text-xs px-2 py-1 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Backups">⊡</button>
                        <button onClick={() => { setEditingAccount(a); setEditName(a); setError(null); }} className="text-xs px-2 py-1 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Renomear">✏</button>
                        <button onClick={() => { setDeleteConfirm(a); setError(null); }} className="text-xs px-2 py-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Excluir">×</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex gap-2">
                <Input placeholder="Nome da nova conta" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void handleCreate(); }} className="flex-1" />
                <Button onClick={handleCreate} disabled={creating || !newName.trim()}>{creating ? '…' : 'Criar'}</Button>
              </div>
            </div>
          </>
        )}
      </aside>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">Excluir "{deleteConfirm}"?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Todos os dados e backups serão removidos permanentemente.</p>
            {error && <p className="text-sm text-rose-600 dark:text-rose-400 mb-3">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleRemove(deleteConfirm)}>Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
