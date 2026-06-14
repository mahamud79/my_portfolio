"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'easymde/dist/easymde.min.css';

// Dynamically import to prevent Next.js server crashes
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { 
  ssr: false, 
  loading: () => <div className="h-64 w-full bg-gray-900 border border-gray-700 rounded-lg animate-pulse flex items-center justify-center text-gray-500">Loading editor...</div> 
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  
  // FIXED: Now we ACTUALLY use useMemo! 
  // This tells React to memorize these settings and never rebuild the editor while typing.
  const options = useMemo(() => {
    return {
      placeholder: placeholder || "Write your article here...",
      spellChecker: false,
      status: false, // Hides the bottom word count bar for a cleaner look
      toolbar: [
        "bold", "italic", "heading", "|", 
        "quote", "unordered-list", "ordered-list", "|", 
        "link", "image", "code", "|", 
        "preview", "guide"
      ] as any
    };
  }, [placeholder]);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-700 text-black">
      {/* We use a wrapper div to force the text color to black, 
        otherwise, your dark mode text might blend into the white editor background! 
      */}
      <div className="text-black [&_.editor-toolbar]:border-none [&_.CodeMirror]:border-none [&_.CodeMirror]:bg-white">
        <SimpleMDE 
          value={value} 
          onChange={onChange} 
          options={options}
        />
      </div>
    </div>
  );
}