import { useState, useRef, useEffect } from 'react';
import '../index.css';
import CodeEditor from '../components/CodeEditor';
import { useYjs } from '../hooks/useYjs';
import { PresencePanel } from '../components/PresencePanel';
import AppWrapperHOC from '../Root/HOC';
import { CodeOutput, CodeOutputHandle } from '../components/CodeOutput';

interface GlobalHeaderProps {
  theme?: 'light' | 'vs-dark';
  language?: 'javascript' | 'typescript' | 'html';
}

function Room(props: GlobalHeaderProps) {
  const { theme, language } = props;
  const { location: { pathname } } = window;
  const room = pathname.split('/')[1] || 'default-room';
  const [executedCode, setExecutedCode] = useState('console.log("Start coding...")');
  const outputRef = useRef<CodeOutputHandle>(null);

  // Destructure ready and connectedUsers along with refs from useYjs
  const { providerRef, yTextRef, yOutputRef, ready } = useYjs(room);

  useEffect(() => {
    if (!yTextRef.current || !yOutputRef.current) return;
  
    yTextRef.current.delete(0, yTextRef.current.length);
    yOutputRef.current.delete(0, yOutputRef.current.length);
    setExecutedCode(''); // reset state
    outputRef.current?.reset(); // clear UI
  }, [language]);
  

  // ✅ Sync code with yText changes (Yjs reactive output)
  useEffect(() => {
    const yOutput = yOutputRef.current;
    if (!yOutput) return;
  
    const updateOutput = () => {
      setExecutedCode(yOutput.length ? yOutput.toString() : 'console.log("Start coding...")');
    };
  
    yOutput.observe(updateOutput); // sync on change
  
    return () => yOutput.unobserve(updateOutput); // cleanup
  }, [yOutputRef]);

  const renderCodeOutput = () => (
    <div className="flex-1 border shadow-md overflow-hidden flex flex-col rounded-xl">
      <h2
        className={`p-3 text-lg font-semibold border-b rounded-t-xl
          ${theme === 'vs-dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-black'}`}
      >
        🖥️ Output
      </h2>

      <CodeOutput ref={outputRef} code={executedCode} language={language || 'javascript'} theme={theme} />
    </div>
  );

  const renderCodeEditor = () => (
    <div
      className="flex-1 border shadow-md flex flex-col overflow-hidden rounded-xl 
        bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b 
          ${theme === 'vs-dark' ? 'bg-[#1e1e1e] border-gray-700' : 'bg-gray-100 border-gray-300'}`}
      >
        <h2 className={`text-lg font-semibold ${theme === 'vs-dark' ? 'text-white' : 'text-black'}`}>
          📝 Code Editor
        </h2>

        <div className="flex gap-2">
        <button
          onClick={() => {
            const editorContent = yTextRef.current?.toString?.();
            if (editorContent !== undefined) {
              yOutputRef.current?.delete(0, yOutputRef.current.length); // clear old
              yOutputRef.current?.insert(0, editorContent); // insert new
              setExecutedCode(editorContent);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          ▶️ Run Code
        </button>
        <button
          onClick={() => {
            const yOutput = yOutputRef.current;
            if (!yOutput) return;
            yOutput.delete(0, yOutput.length);
            outputRef.current?.reset();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
        >
          🧹 Clear Output
        </button>
        </div>
      </div>
      <CodeEditor
        language={language}
        providerRef={providerRef}
        yTextRef={yTextRef}
        theme={theme}
      />
    </div>
  );

  if (!ready || !providerRef.current || !yTextRef.current) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-300">Connecting to collaboration room...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
  <div className="flex flex-col items-start space-y-2">
    <button
      onClick={() => window.location.href = '/'}
      className={`px-4 py-2 ${theme === 'vs-dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray'} rounded-lg hover:${theme === 'vs-dark' ? 'bg-gray-800' : 'bg-white'} transition cursor-pointer`}
    >
      🔙 Back to Home
    </button>
    <div className="text-sm text-gray-500 dark:text-gray-400">
    Room: <code className="text-blue-600 dark:text-blue-400">
      {providerRef.current.roomname.charAt(0).toUpperCase() + providerRef.current.roomname.slice(1)}
    </code>
    </div>
  </div>

  <PresencePanel awareness={providerRef.current.awareness} theme={theme} />
</div>


      <div className="flex flex-col min-h-[90vh] px-4 py-4 space-y-4">
        <div className="flex flex-col lg:flex-row flex-1 gap-6">
          {/* Code Editor Panel */}
          {renderCodeEditor()}

          {/* Output Panel */}
          {renderCodeOutput()}
        </div>
      </div>
    </>
  );
}

const WrappedRoom = AppWrapperHOC(Room);
export default WrappedRoom;
