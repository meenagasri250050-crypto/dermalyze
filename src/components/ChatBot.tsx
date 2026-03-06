import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, RefreshCcw, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  language?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello! I am your Dermalyze AI Chatbot. How can I help you today? You can ask me about skincare ingredients, natural remedies, or how to use our scanning features. (Preferred Language: ${language || 'Auto'})` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChatSession(language);
    setMessages([
      { role: 'model', text: `Hello! I am your Dermalyze AI Chatbot. How can I help you today? You can ask me about skincare ingredients, natural remedies, or how to use our scanning features. (Preferred Language: ${language || 'Auto'})` }
    ]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = createChatSession();
      }
      const result = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text || 'I am sorry, I could not process that.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    chatRef.current = createChatSession(language);
    setMessages([
      { role: 'model', text: 'Chat reset. How else can I help you?' }
    ]);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`flex flex-col glass transition-all duration-300 overflow-hidden ${
      isFullScreen 
        ? 'fixed inset-0 z-[60] rounded-none h-screen w-screen bg-white' 
        : 'max-w-3xl mx-auto h-[600px] rounded-3xl card-shadow'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Expert Chat</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullScreen}
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={resetChat}
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
            title="Reset Chat"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-zinc-200' : 'bg-zinc-900 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-tr-none' 
                    : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-zinc-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about skincare..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 p-2 rounded-xl transition-all ${
              !input.trim() || isLoading 
                ? 'text-zinc-300' 
                : 'text-white bg-zinc-900 hover:bg-zinc-800 shadow-md'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
