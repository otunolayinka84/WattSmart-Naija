import React, { useState, useRef, useEffect } from 'react';
import { InputParams } from '../utils/energyMath';
import { Send, User, Bot, Loader2, MessageSquare, ArrowRightLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AdvisorChatProps {
  userProfile: InputParams;
}

const QUICK_QUESTIONS = [
  "How can I cut my generator fuel bills?",
  "Explain Nigeria's Band A vs other Bands.",
  "Is solar cheaper than a 3kVA petrol generator?",
  "How do I select the right lithium solar battery?"
];

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! I am your AI Energy Efficiency Advisor. I have synchronized with your ${userProfile.userType === 'household' ? 'household' : 'SME'} profile, DisCo (${userProfile.disco}), and appliance list.\n\nAsk me any questions! For example, how to schedule heavy appliances to avoid generator runtimes, sizing solar hybrid setups, or specific tips to save money in Nigeria.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/advisory/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response.');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'model', content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Oh! I encountered a network error while connecting to the core server. Please check your internet connection or verify the AI settings.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div id="advisor-chat-container" className="bg-white rounded-2xl border border-neutral-100 shadow-sm flex flex-col h-[520px]">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-emerald-700" />
            <span className="absolute bottom-[-2px] right-[-2px] h-2 w-2 rounded-full bg-emerald-500 border border-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-800">Naija AI Advisor Console</h3>
            <span className="text-[10px] text-neutral-400 font-medium">Fully Sync'd with Profile & Appliances</span>
          </div>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/60 font-semibold text-neutral-600 font-mono">
          {userProfile.gridBand}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, index) => {
          const isModel = msg.role === 'model';
          return (
            <div key={index} className={`flex ${isModel ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}>
              <div className={`flex items-start gap-2 max-w-[85%] ${!isModel && 'flex-row-reverse'}`}>
                
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isModel ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-neutral-800 text-white'}`}>
                  {isModel ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isModel 
                    ? 'bg-neutral-50 border border-neutral-100 text-neutral-800 rounded-tl-sm' 
                    : 'bg-emerald-600 text-white rounded-tr-sm'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl rounded-tl-sm">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  Advisor is writing response...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggesters */}
      <div className="px-5 py-2 border-t border-neutral-50/60 flex gap-2 overflow-x-auto scrollbar-none shrink-0 py-2 bg-neutral-50/30">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="text-[10px] bg-white hover:bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1 font-semibold text-neutral-600 shrink-0 shadow-sm hover:shadow-none transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Text Input Box */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-neutral-100 flex gap-2 bg-neutral-50/50 rounded-b-2xl">
        <input
          type="text"
          id="input-chat-message"
          placeholder="Ask about load sizing, inverter AC payoffs, generator runtimes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          id="btn-send-message"
          disabled={!input.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white p-2.5 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
