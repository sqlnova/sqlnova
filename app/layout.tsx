import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'SQLNova — Aprendé SQL jugando',
  description: 'Lecciones cortas. Racha diaria. Sandbox con tus propios datos.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { var t = localStorage.getItem('sqlnova-tema'); if (t === 'claro') document.documentElement.setAttribute('data-theme', 'claro'); } catch(e) {}` }} />
      </head>
      <body>
        {children}
        <Script
          id="sqljs-preload"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window._sqljsReady = false;
                window._sqljsPromise = null;
                function preloadSqlJs() {
                  if (window._sqljsPromise) return window._sqljsPromise;
                  const script = document.createElement('script');
                  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
                  document.head.appendChild(script);
                  window._sqljsPromise = new Promise((resolve) => {
                    script.onload = async () => {
                      try {
                        const SQL = await window.initSqlJs({ locateFile: function(f) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/' + f; } });
                        window._sqljsInstance = SQL; window._sqljsReady = true; resolve(SQL);
                      } catch(e) { resolve(null); }
                    };
                    script.onerror = function() { resolve(null); };
                  });
                  return window._sqljsPromise;
                }
                if ('requestIdleCallback' in window) { requestIdleCallback(preloadSqlJs, { timeout: 3000 }); }
                else { setTimeout(preloadSqlJs, 1500); }
              }
            `
          }}
        />
      </body>
    </html>
  )
}
