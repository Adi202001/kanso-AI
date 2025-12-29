
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Languages, Siren, Banknote, ExternalLink, Mic, Volume2, StopCircle } from 'lucide-react';
import { chatWithTravelAssistant, generateSpeech } from '../services/geminiService';
import { ChatMessage, Itinerary, Activity } from '../types';

interface ChatWidgetProps {
  itinerary?: Itinerary | null;
  onUpdateItinerary?: (day: number, activities: Activity[], theme?: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ itinerary, onUpdateItinerary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AI travel companion. I can help with itinerary changes, translations, currency, or local emergency info.', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of message currently playing
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check Speech Support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSpeechSupported(true);
    }
  }, []);

  // Audio Context Initialization
  useEffect(() => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithTravelAssistant(history, userMsg.text, itinerary || undefined);
      
      let responseText = response.text;

      // Handle Function Calls
      if (response.toolCalls && response.toolCalls.length > 0 && onUpdateItinerary) {
        for (const call of response.toolCalls) {
          if (call.name === 'update_day_activities') {
            const { day, activities, theme } = call.args as any;
            onUpdateItinerary(day, activities, theme);
            responseText = `I've updated Day ${day} of your itinerary.`;
          }
        }
      }

      // Process grounding chunks (sources)
      let sources: {title: string, uri: string}[] = [];
      if (response.groundingChunks) {
         response.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri && chunk.web?.title) {
               sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
         });
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "I encountered an error processing your request.",
         timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech to Text
  const startListening = () => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    };
    
    recognition.start();
  };

  // Text to Speech
  const playAudio = async (text: string, msgId: string) => {
    if (isPlaying) {
      activeSourceRef.current?.stop();
      setIsPlaying(null);
      if (isPlaying === msgId) return; // Toggle off
    }

    setIsPlaying(msgId);
    try {
      const base64Audio = await generateSpeech(text);
      if (!audioContextRef.current) return;

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = audioContextRef.current.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(null);
      source.start();
      activeSourceRef.current = source;

    } catch (e) {
      console.error("Playback failed", e);
      setIsPlaying(null);
    }
  };

  const QuickAction = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-lg hover:bg-stone-100 transition-colors active:scale-95"
    >
      <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 shadow-sm">
        <Icon size={14} />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-stone-500">{label}</span>
    </button>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-12 right-6 md:right-12 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'scale-0 opacity-0' : 'bg-stone-900 text-white'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed z-50 bg-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col overflow-hidden
        ${isOpen ? 'bottom-0 right-0 w-full h-full md:w-[400px] md:h-[650px] md:bottom-12 md:right-12 md:rounded-2xl opacity-100' : 'bottom-0 right-0 w-0 h-0 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
               <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-stone-900">Travel Assistant</h3>
              <p className="text-xs text-stone-500 uppercase tracking-wider">
                {itinerary ? `Guide for ${itinerary.destination}` : 'Concierge'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCF8]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm relative group ${
                  msg.role === 'user' 
                    ? 'bg-stone-900 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-stone-100 text-stone-800 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.text}
                
                {/* Audio Playback Button for Model */}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => playAudio(msg.text, msg.id)}
                    className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-stone-900"
                    title="Read Aloud"
                  >
                    {isPlaying === msg.id ? <StopCircle size={16} className="text-stone-900 animate-pulse" /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
              
              {/* Grounding Sources */}
              {msg.sources && (
                 <div className="mt-2 max-w-[85%] grid gap-1">
                    {msg.sources.map((src, i) => (
                       <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 hover:underline bg-white border border-stone-100 px-2 py-1 rounded-full w-fit">
                          <ExternalLink size={8} /> {src.title}
                       </a>
                    ))}
                 </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-sm flex gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 pb-2 bg-white flex justify-center gap-2 border-t border-stone-50 pt-2">
           <QuickAction icon={Languages} label="Translate" onClick={() => setInputValue("Translate this phrase to local language: ")} />
           <QuickAction 
             icon={Banknote} 
             label="Currency" 
             onClick={() => {
                const dest = itinerary?.destination || 'this location';
                handleSend(`What is the local currency in ${dest} and what is the current exchange rate vs USD?`);
             }} 
           />
           <QuickAction icon={Siren} label="Emergency" onClick={() => handleSend("What are the emergency numbers (police, ambulance) for this location?")} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white">
          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 focus-within:border-stone-400 transition-colors">
            
            {/* Microphone Button */}
            {isSpeechSupported && (
              <button
                 onClick={startListening}
                 className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                 title="Voice Input"
              >
                 <Mic size={18} />
              </button>
            )}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={itinerary ? (isListening ? "Listening..." : "Ask or translate...") : (isListening ? "Listening..." : "Ask anything...")}
              className="flex-1 bg-transparent border-none outline-none px-2 text-stone-900 placeholder:text-stone-400 text-sm"
              autoFocus={isOpen}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
