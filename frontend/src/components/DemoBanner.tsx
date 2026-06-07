export function DemoBanner() {
  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 py-1.5 bg-violet-600/10 border-b border-violet-500/20 backdrop-blur-sm text-xs text-violet-700 dark:text-violet-300">
        <span className="font-medium">⚡ Modo demo — dados fictícios, reset no reload</span>
        <span className="text-violet-300 dark:text-violet-600 select-none">·</span>
        <a
          href="https://github.com/Viniciusap/localfin"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-violet-900 dark:hover:text-violet-100 transition-colors"
        >
          Instalar localmente →
        </a>
      </div>
      {/* Spacer so content doesn't hide under the fixed banner */}
      <div className="h-8" />
    </>
  );
}
