import { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icons?: Record<string, string>;
  placeholder?: string;
  required?: boolean;
}

export function Combobox({ label, value, onChange, options, icons, placeholder, required }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const selectedIcon = icons?.[value];

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function select(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
      else { onChange(query); setOpen(false); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {selectedIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none">
            {selectedIcon}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={query}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => { setOpen(true); setHighlighted(0); }}
          onKeyDown={handleKeyDown}
          className={`w-full py-2 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 transition ${selectedIcon ? 'pl-9' : 'pl-3'}`}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((option, i) => (
            <li
              key={option}
              onMouseDown={() => select(option)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === highlighted
                  ? 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50'
              }`}
            >
              {icons && (
                <span className="w-5 text-center flex-shrink-0">{icons[option] ?? '🏷️'}</span>
              )}
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
