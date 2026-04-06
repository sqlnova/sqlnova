import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'SQLNova — Aprendé SQL jugando',
  description: 'Lecciones cortas. Racha diaria. Sandbox con tus propios datos.',
  manifest: '/manifest.json', // Vital para que Android la reconozca como app
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SQLNova',
  },
}

// Configuración del Viewport para evitar que el usuario haga zoom 
// y rompa la interfaz de la "app"
export const viewport: Viewport = {
  themeColor: '#08090d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Aprovecha toda la pantalla en iPhones con notch
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script anti-flicker para el tema claro/oscuro */}
        <script 
          dangerouslySetInnerHTML={{ 
            __html: `try { 
              var t = localStorage.getItem('sqlnova-tema'); 
              if (t === 'claro') document.documentElement.setAttribute('data-theme', 'claro'); 
            } catch(e) {}` 
          }} 
        />
      </head>
      <body className="antialiased">
        {children}
        
        {/* Precarga de SQL.js optimizada */}
        <Script
          id="sqljs-preload"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window._sqljsReady = false;
                window._sqljsPromise = null;
                
                async function preloadSqlJs() {
                  if (window._sqljsPromise) return window._sqljsPromise;
                  
                  window._sqljsPromise = new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
                    script.async = true;
                    
                    script.onload = async () => {
                      try {
                        const SQL = await window.initSqlJs({ 
                          locateFile: function(f) { 
                            return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/' + f; 
                          } 
                        });
                        window._sqljsInstance = SQL; 
                        window._sqljsReady = true; 
                        console.log('SQLNova: Motor SQL listo');
                        resolve(SQL);
                      } catch(e) { 
                        console.error('SQLNova: Error motor SQL', e);
                        resolve(null); 
                      }
                    };
                    
                    script.onerror = () => resolve(null);
                    document.head.appendChild(script);
                  });
                  return window._sqljsPromise;
                }

                // Carga en tiempo de inactividad para no bloquear el render inicial
                if ('requestIdleCallback' in window) { 
                  requestIdleCallback(() => preloadSqlJs(), { timeout: 2000 }); 
                } else { 
                  setTimeout(preloadSqlJs, 1000); 
                }
              }
            `
          }}
        />
      </body>
    </html>
  )
}
