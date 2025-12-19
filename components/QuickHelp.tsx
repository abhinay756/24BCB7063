import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TrackingData } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickHelpProps {
  onClose: () => void;
  translations: any;
  lang: string;
  currentTrackingData: TrackingData | null;
}

const QuickHelp: React.FC<QuickHelpProps> = ({ onClose, translations: t, lang, currentTrackingData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const trackingContext = currentTrackingData 
        ? `The user is currently tracking order ${currentTrackingData.orderId} (${currentTrackingData.productName}). 
           The current status is ${currentTrackingData.steps[0]?.description}. 
           The carrier is ${currentTrackingData.carrier}.`
        : "The user has not entered any tracking details yet.";

      const prompt = `
        You are an official "India Post Logistics Assistant". 
        Your goal is to guide the user through any issues they are facing with their consignment or tracking.
        
        CONTEXT:
        - Current Language: ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}
        - Tracking Info: ${trackingContext}
        
        IMPORTANT CONTACT NUMBERS (ONLY PROVIDE IF USER NEEDS MAJOR HELP/COMPLAINT):
        - Toll Free: 1800 266 6868 (General Enquiry)
        - Business Support: 1800 11 2011
        - Grievance Cell: 011-23096060
        
        RULES:
        - Respond ONLY in ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}.
        - Be professional, helpful, and polite.
        - If the user reports a MAJOR ISSUE (e.g., lost item, damage, fraud, theft, long delay), you MUST provide the professional contact numbers above clearly.
        - If the user asks about delays, explain common reasons (weather, traffic, hub congestion).
        - If they ask what terms mean (like "Neural Locked"), explain that it's an AI-driven logistics prediction state.
        - Keep responses concise but informative.
        
        User Query: ${userMessage}
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const responseText = result.text || "...";
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error(error);
      const errorMsg = lang === 'te' ? "క్షమించండి, సర్వర్ సమస్య ఉంది." : lang === 'hi' ? "क्षमा करें, सर्वर समस्या है।" : "Sorry, I encountered a server error.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[600px] border border-gray-200">
        {/* Header */}
        <div className="bg-[#E31E24] p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-headset"></i>
             </div>
             <div>
                <h3 className="font-bold text-sm tracking-tight">{t.helpTitle}</h3>
                <p className="text-[10px] opacity-80 uppercase font-black">{t.departmentOfPosts}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                <i className="fa-solid fa-comments text-4xl text-gray-300"></i>
                <p className="text-xs font-bold px-8">{t.helpDesc}</p>
             </div>
           )}
           {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-[#E31E24] text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
             </div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
           <div className="relative flex items-center">
              <input 
                type="text"
                placeholder={t.typeMessage}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-gray-100 border-none rounded-full pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-red-100 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-30 transition-all active:scale-90"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
           </div>
           <p className="text-[8px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest">
             India Post AI Logistics Network • {lang.toUpperCase()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default QuickHelp;