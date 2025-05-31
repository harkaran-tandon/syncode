import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as Babel from '@babel/standalone'

interface CodeOutputProps {
  code: string | null | undefined
  language: 'javascript' | 'typescript' | 'html' | 'react'
  theme?: 'light' | 'vs-dark';
}

export interface CodeOutputHandle {
  reset: () => void,
}

export const CodeOutput = forwardRef<CodeOutputHandle, CodeOutputProps>(({ code, language, theme }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isDark = theme === 'vs-dark';
  const bodyClass = isDark ? 'dark' : 'light';

  const css = `
      body.light {
        background: white;
        color: black;
        margin: 0; padding: 10px;
        font-family: monospace;
      }
      body.dark {
        background: #1a202c;
        color: white;
        margin: 0; padding: 10px;
        font-family: monospace;
      }
    `;

  useImperativeHandle(ref, () => {
    const isDark = theme === 'vs-dark';
    const bodyClass = isDark ? 'dark' : 'light';
  
    return {
      reset() {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = `
            <html>
              <head><style>${css}</style></head>
              <body class="${bodyClass}">
                <pre style="padding:10px; font-family: monospace;">Start coding...</pre>
              </body>
            </html>
          `;
        }
      }
    }
  }, [theme, language]);
  

  useEffect(() => {
    if (!iframeRef.current) return
    const iframe = iframeRef.current

    let finalCode = code || ''

    // Handle React or TypeScript transpilation with Babel
    if (language === 'typescript') {
      try {
        finalCode = Babel.transform(finalCode, {
          presets: ['typescript', 'env'],
          filename: 'file.ts',
        }).code || ''
      } catch (err) {
        finalCode = `console.error("Transpile Error: ${(err as Error).message}")`
      }
    } else if (language === 'react') {
      // Transpile JSX + TS + modern JS to browser JS
      try {
        finalCode = Babel.transform(finalCode, {
          presets: ['react', 'typescript', 'env'],
          filename: 'file.tsx',
        }).code || ''
      } catch (err) {
        finalCode = `console.error("Transpile Error: ${(err as Error).message}")`
      }
    }

    // For HTML, just embed code directly in body (no transpile)
    if (language === 'html') {
      if (!finalCode.trim()) {
        iframe.srcdoc = `
          <html>
            <head><style>${css}</style></head>
            <body class="${bodyClass}">
              <pre style="padding:10px; font-family: monospace;">Start coding...</pre>
            </body>
          </html>
        `;
        return;
      }
      if (finalCode.includes('console.log')) {
        const htmlContent = `
        <html>
          <head><style>${css}</style></head>
          <body class="${theme === 'vs-dark' ? 'dark' : 'light'}">
            <script>
              ${finalCode}
            </script>
          </body>
        </html>
      `;
      iframe.srcdoc = htmlContent;
      return;
      }
      iframe.srcdoc = finalCode
      return
    }

  const wrappedCode = `
  try {
    (function() {
      ${finalCode}
    })();
  } catch (err) {
    console.error(err);
  }
`;

    // For JS, TS, React — run inside iframe with console override and timeout
    const html = `
      <html>
        <head>
          ${language === 'react' ? `
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          ` : ''}
          <style>${css}</style>
        </head>
        <body class="${bodyClass}">
          <pre id="output" style="padding:10px; font-family:monospace;"></pre>
          <script>
            const output = document.getElementById('output');

            const log = (...args) => {
              output.innerText += args.map(a => {
                try {
                  return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
                } catch { return String(a); }
              }).join(' ') + '\\n';
            };

            console.log = log;
            console.error = log;
            console.warn = log;

            const kill = setTimeout(() => {
              log('[Execution stopped: timeout exceeded 2000ms]');
              window.stop?.();
            }, 2000);

            try {
              ${wrappedCode}
            } catch (err) {
              log('[Error]', err.message);
            } finally {
              clearTimeout(kill);
            }
          </script>
        </body>
      </html>
    `

    iframe.srcdoc = html
  }, [code, language, theme])

  return (
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="w-full flex-1"
        title="Code Output"
      />
  )
})
