
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type, LiveServerMessage, Modality, Chat } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_TICKET_TYPES } from '../data/mockData';

interface TicketContextData {
  id: string;
  title: string;
  description: string;
  onReply: (text: string) => void;
}

interface OmniVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData?: TicketContextData | null;
}

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: number;
}

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = markdownImageRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
        parts.push({ type: 'image', alt: match[1], url: match[2] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', content: text.substring(lastIndex) });
    return (
        <span className="whitespace-pre-wrap block">
            {parts.map((part, i) => {
                if (part.type === 'image') return <img key={i} src={part.url} alt={part.alt || "Visual content"} className="mt-2 mb-2 rounded-lg max-w-full h-auto border border-white/10 shadow-sm mx-auto" onError={(e) => (e.currentTarget.style.display = 'none')}/>;
                const rawImageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/gi;
                const subParts = part.content.split(rawImageRegex);
                return (
                    <span key={i}>
                        {subParts.map((subPart, j) => {
                            if (subPart.match(rawImageRegex)) return <img key={`${i}-${j}`} src={subPart} alt="Visual content" className="mt-2 mb-2 rounded-lg max-w-full h-auto border border-white/10 shadow-sm mx-auto" onError={(e) => (e.currentTarget.style.display = 'none')}/>;
                            return <span key={`${i}-${j}`}>{subPart}</span>;
                        })}
                    </span>
                );
            })}
        </span>
    );
};

const OmniVoiceOverlay: React.FC<OmniVoiceOverlayProps> = ({ isOpen, onClose, ticketData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t, isRTL } = useLanguage();
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
      { id: 'init', role: 'bot', text: language === 'ar' ? 'مرحباً! أنا أومني بوت. يمكنك الدردشة معي هنا أو التبديل إلى وضع الصوت لمحادثة مباشرة.' : 'Hi! I\'m Omnibot. You can chat with me here or switch to Voice mode for a live conversation.', timestamp: Date.now() }
  ]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentTranscriptRef = useRef<{ user: string; bot: string }>({ user: '', bot: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const [allowedTypes, setAllowedTypes] = useState<any[]>([]);

  useEffect(() => {
      try {
          const savedTypes = localStorage.getItem('omni_ticket_types');
          const allTypes = savedTypes ? JSON.parse(savedTypes) : DEFAULT_TICKET_TYPES;
          if (user && user.allowedTicketTypes && Array.isArray(user.allowedTicketTypes)) {
              const filtered = allTypes.filter((t: any) => user.allowedTicketTypes.includes(t.name));
              setAllowedTypes(filtered.length > 0 ? filtered : allTypes);
          } else {
              setAllowedTypes(allTypes);
          }
      } catch (e) {
          setAllowedTypes(DEFAULT_TICKET_TYPES);
      }
  }, [user]);

  useEffect(() => {
    if (process.env.API_KEY) aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }, []);

  const tools = useMemo(() => [
    {
      functionDeclarations: [
        {
          name: "navigate",
          description: "Navigate to a specific page.",
          parameters: {
            type: Type.OBJECT,
            properties: { page: { type: Type.STRING } },
            required: ["page"]
          }
        },
        {
          name: "create_ticket",
          description: "Create a new support ticket.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              ticketType: { type: Type.STRING }
            },
            required: ["title", "description", "priority", "ticketType"]
          }
        }
      ]
    }
  ], []);

  useEffect(() => {
      if (aiRef.current && allowedTypes.length > 0) {
          const typeNames = allowedTypes.map(t => t.name).join(', ');
          chatSessionRef.current = aiRef.current.chats.create({
              model: 'gemini-3-pro-preview',
              config: {
                  systemInstruction: `You are Omnibot, a helpful AI assistant for the OmniTicket app.
                  CURRENT LANGUAGE: ${language === 'ar' ? 'ARABIC (Please respond in Arabic)' : 'ENGLISH'}.
                  LAYOUT: ${isRTL ? 'Right-to-Left' : 'Left-to-Right'}.
                  TICKET TYPES: ${typeNames}.
                  Rules: Analyze requests, suggest type/priority, confirm before calling tools.`,
                  tools: tools
              }
          });
      }
  }, [ticketData, allowedTypes, tools, language, isRTL]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, mode]);
  useEffect(() => { if (!isOpen) disconnect(); }, [isOpen]);

  const disconnect = async () => {
      setIsConnected(false);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
      if (inputProcessorRef.current) inputProcessorRef.current.disconnect();
      if (inputSourceRef.current) inputSourceRef.current.disconnect();
      if (audioContextRef.current) await audioContextRef.current.close();
      sessionPromiseRef.current = null;
      setVolumeLevel(0);
      nextStartTimeRef.current = 0;
  };

  const handleModeSwitch = (newMode: 'chat' | 'voice') => {
      if (newMode === 'chat' && isConnected) disconnect();
      setMode(newMode);
  };

  const executeFunction = async (name: string, args: any): Promise<any> => {
      if (name === 'navigate') {
          const pageMap: Record<string, string> = { 'dashboard': '/', 'tickets': '/tickets', 'create_ticket': '/tickets/new', 'users': '/users', 'settings': '/settings' };
          const path = pageMap[args.page];
          if (path) { navigate(path); return { result: "Done" }; }
          return { result: "Not found" };
      }
      if (name === 'create_ticket') {
          const typeObj = allowedTypes.find(t => t.name === args.ticketType) || allowedTypes[0];
          const newTicket = {
            id: `${typeObj.reference || 'OMNI'}-${Math.floor(1000 + Math.random() * 9000)}`,
            title: args.title,
            description: args.description || '', 
            priority: args.priority,
            time: 'Just now',
            timestamp: Date.now(),
            tags: [ { label: 'Open', color: 'text-green-300', bg: 'bg-green-900/30', icon: 'radio_button_checked' } ],
            assignee: 'Unassigned',
            creator: user?.name || 'User',
            avatar: user?.avatar || null,
            typeId: typeObj.id,
            typeName: typeObj.name
          };
          const saved = localStorage.getItem('omni_tickets');
          const tickets = saved ? JSON.parse(saved) : [];
          localStorage.setItem('omni_tickets', JSON.stringify([newTicket, ...tickets]));
          navigate('/tickets');
          return { result: "Created and redirected." };
      }
      return { result: "Not implemented" };
  };

  const handleSendText = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputText.trim() || isSending || !chatSessionRef.current) return;
      const text = inputText;
      setInputText('');
      setIsSending(true);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
      try {
          let result = await chatSessionRef.current.sendMessage({ message: text });
          while (result.functionCalls && result.functionCalls.length > 0) {
              const functionResponses = [];
              for (const call of result.functionCalls) {
                  const executionResult = await executeFunction(call.name, call.args);
                  functionResponses.push({ functionResponse: { name: call.name, response: { result: executionResult } } });
              }
              result = await chatSessionRef.current.sendMessage({ message: functionResponses });
          }
          if (result.text) setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: result.text || '', timestamp: Date.now() }]);
      } catch (err) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: "Error", timestamp: Date.now() }]);
      } finally { setIsSending(false); }
  };

  const connect = async () => {
    if (!aiRef.current) return;
    try {
        setIsConnected(true);
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        const inputCtx = new AudioContext({ sampleRate: 16000 }); 
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const systemInstruction = `You are Omnibot. Respond in ${language === 'ar' ? 'Arabic' : 'English'}. Handle tickets correctly.`;
        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: { responseModalities: [Modality.AUDIO], tools: tools, systemInstruction: systemInstruction },
            callbacks: {
                onopen: () => {
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0;
                        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                        setVolumeLevel(Math.sqrt(sum / inputData.length) * 10);
                        const pcmData = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                        sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: "audio/pcm;rate=16000", data: base64 } }));
                    };
                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            const result = await executeFunction(fc.name, fc.args);
                            sessionPromise.then(session => session.sendToolResponse({ functionResponses: [{ id: fc.id, name: fc.name, response: { result } }] }));
                        }
                    }
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) playAudio(await decodeAudioData(audioData, ctx), ctx);
                    if (msg.serverContent?.turnComplete) {
                        if (currentTranscriptRef.current.user.trim()) { setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: currentTranscriptRef.current.user.trim(), timestamp: Date.now() }]); currentTranscriptRef.current.user = ''; }
                        if (currentTranscriptRef.current.bot.trim()) { setMessages(prev => [...prev, { id: Math.random().toString(), role: 'bot', text: currentTranscriptRef.current.bot.trim(), timestamp: Date.now() }]); currentTranscriptRef.current.bot = ''; }
                    }
                    if (msg.serverContent?.interrupted) { scheduledSourcesRef.current.forEach(source => source.stop()); scheduledSourcesRef.current = []; nextStartTimeRef.current = 0; }
                },
                onclose: () => setIsConnected(false),
                onerror: () => setIsConnected(false)
            }
        });
        sessionPromiseRef.current = sessionPromise;
    } catch (e) { setIsConnected(false); }
  };

  const decodeAudioData = async (base64: string, ctx: AudioContext) => {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      return buffer;
  };

  const playAudio = (buffer: AudioBuffer, ctx: AudioContext) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      scheduledSourcesRef.current.push(source);
      source.onended = () => { scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source); };
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 z-[100] w-[90vw] md:w-[400px] h-[600px] max-h-[85vh] flex flex-col bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 overflow-hidden ${isRTL ? 'left-4' : 'right-4'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}></div>
            <span className="font-bold text-white text-sm">{t('omnibot_title')}</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">close</span></button>
      </div>

      <div className="flex px-4 pt-4 pb-2 shrink-0">
          <div className="bg-background-dark/50 p-1 rounded-xl flex w-full border border-white/5">
              <button onClick={() => handleModeSwitch('chat')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'chat' ? 'bg-surface-highlight text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><span className="material-symbols-outlined text-[16px]">chat</span> {t('chat_mode')}</button>
              <button onClick={() => handleModeSwitch('voice')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'voice' ? 'bg-surface-highlight text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><span className="material-symbols-outlined text-[16px]">mic</span> {t('voice_mode')}</button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface-highlight text-slate-200 rounded-bl-none border border-white/5'}`}><MessageContent text={msg.text} /></div>
              </div>
          ))}
          {isSending && <div className="flex justify-start"><div className="bg-surface-highlight border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1"><div className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="size-2 bg-slate-400 rounded-full animate-bounce"></div></div></div>}
          <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-white/5 bg-surface-dark/50 backdrop-blur-md">
          {mode === 'chat' && (
              <form onSubmit={handleSendText} className="p-4 flex gap-2">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t('ask_omnibot')} className="flex-1 bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"/>
                  <button type="submit" disabled={!inputText.trim() || isSending} className="size-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 transition-all shadow-lg active:scale-95"><span className="material-symbols-outlined text-[20px] rtl:rotate-180">send</span></button>
              </form>
          )}

          {mode === 'voice' && (
              <div className="p-4 flex flex-col gap-4 items-center justify-center">
                  <div className="flex items-center justify-center gap-1 h-8">{[...Array(5)].map((_, i) => (<div key={i} className={`w-1 bg-primary rounded-full transition-all duration-75`} style={{ height: isConnected ? `${Math.min(32, Math.max(4, volumeLevel * 10 * (Math.random() + 0.5)))}px` : '4px', opacity: isConnected ? 1 : 0.3 }}></div>))}</div>
                  <button onClick={() => isConnected ? disconnect() : connect()} className={`w-full py-3 rounded-full flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${isConnected ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary text-white hover:bg-primary-dark'}`}><span className="material-symbols-outlined">{isConnected ? 'call_end' : 'mic'}</span> {isConnected ? (language === 'ar' ? 'إنهاء الجلسة' : 'End Session') : (language === 'ar' ? 'بدء المحادثة' : 'Start Conversation')}</button>
              </div>
          )}
      </div>
    </div>
  );
};

export default OmniVoiceOverlay;