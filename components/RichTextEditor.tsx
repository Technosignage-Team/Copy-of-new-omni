import React, { useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className, height = 'h-32' }) => {
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const spacer = value.length > 0 && !value.endsWith(' ') ? ' ' : '';
      onChange(value + spacer + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const insertFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newCursorPos = end;

    switch (format) {
        case 'bold': newText = value.substring(0, start) + `**${selectedText || 'bold text'}**` + value.substring(end); newCursorPos = end + 2 + (selectedText ? 0 : 9); break;
        case 'italic': newText = value.substring(0, start) + `*${selectedText || 'italic text'}*` + value.substring(end); newCursorPos = end + 1 + (selectedText ? 0 : 11); break;
        case 'h1': newText = value.substring(0, start) + `\n# ${selectedText || 'Heading 1'}\n` + value.substring(end); newCursorPos = end + 3; break;
        case 'list': newText = value.substring(0, start) + `\n- ${selectedText || 'List item'}` + value.substring(end); newCursorPos = end + 3; break;
        case 'list-ol': newText = value.substring(0, start) + `\n1. ${selectedText || 'List item'}` + value.substring(end); newCursorPos = end + 4; break;
        case 'link': newText = value.substring(0, start) + `[${selectedText || 'Link Text'}](url)` + value.substring(end); newCursorPos = end + 1; break;
        case 'quote': newText = value.substring(0, start) + `\n> ${selectedText || 'Blockquote'}\n` + value.substring(end); newCursorPos = end + 3; break;
        case 'code': newText = value.substring(0, start) + `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n` + value.substring(end); newCursorPos = end + 4; break;
        case 'image': newText = value.substring(0, start) + `\n![Alt Text](https://)` + value.substring(end); newCursorPos = end + 13; break;
        case 'table': 
            const table = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
            newText = value.substring(0, start) + table + value.substring(end); 
            newCursorPos = start + table.length; 
            break;
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={`bg-background-dark/50 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all ${className}`}>
        <div className="flex items-center gap-1 p-2 bg-surface-highlight/30 border-b border-white/5 overflow-x-auto no-scrollbar">
            <button type="button" onClick={() => insertFormat('h1')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Heading"><span className="material-symbols-outlined text-[20px]">title</span></button>
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
            <button type="button" onClick={() => insertFormat('bold')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Bold"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
            <button type="button" onClick={() => insertFormat('italic')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Italic"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
            <button type="button" onClick={() => insertFormat('list')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Bullet List"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
            <button type="button" onClick={() => insertFormat('list-ol')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Numbered List"><span className="material-symbols-outlined text-[20px]">format_list_numbered</span></button>
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
            <button type="button" onClick={() => insertFormat('link')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Link"><span className="material-symbols-outlined text-[20px]">link</span></button>
            <button type="button" onClick={() => insertFormat('quote')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Quote"><span className="material-symbols-outlined text-[20px]">format_quote</span></button>
            <button type="button" onClick={() => insertFormat('code')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Code"><span className="material-symbols-outlined text-[20px]">code</span></button>
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
            <button type="button" onClick={() => insertFormat('image')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Image"><span className="material-symbols-outlined text-[20px]">image</span></button>
            <button type="button" onClick={() => insertFormat('table')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0" title="Table"><span className="material-symbols-outlined text-[20px]">table_chart</span></button>
            <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
            <button type="button" onClick={toggleListening} className={`p-1.5 rounded-md transition-colors flex items-center gap-1 shrink-0 ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`} title="Speech to Text"><span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span></button>
        </div>
        <textarea 
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-transparent border-none px-4 py-3 text-white placeholder-slate-500 focus:ring-0 resize-none text-sm leading-relaxed ${height}`} 
            placeholder={placeholder}
        ></textarea>
    </div>
  );
};

export default RichTextEditor;