import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, ChevronRight, 
  HelpCircle, AlertCircle, CheckCircle, Clock, 
  PhoneCall, TrendingUp, CloudRain, ShieldAlert,
  Info, Map as MapIcon, Megaphone
} from 'lucide-react';
import { useStore } from '@/lib/Store';
import { useNavigate } from 'react-router-dom';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: 'Namaste! I am your UrbanPulse Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user, complaints } = useStore();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => {
      processInput(input);
      setIsTyping(false);
    }, 800)
  };

  const getCityTrends = () => {
    if (!complaints || complaints.length === 0) return "No active reports yet.";
    const categories = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return `Right now, ${top[0]} is the most reported issue in the city with ${top[1]} active reports.`;
  };

  const processInput = (text) => {
    const query = text.toLowerCase();
    let response = "";
    let actions = null;

    if (query.includes('status') || query.includes('my report') || query.includes('complaint')) {
      if (!user) {
        response = "Please sign in to check your personal report status. I can redirect you to the login page!";
        actions = [{ label: 'Sign In', action: () => navigate('/login') }];
      } else {
        const userReports = complaints.filter(c => c.user === user.name || c.userId === user._id);
        if (userReports.length === 0) {
          response = `I don't see any reports from you yet, ${user.name}. Would you like to submit your first one? It only takes 30 seconds.`;
          actions = [{ label: 'Report Now', action: () => navigate('/report') }];
        } else {
          const latest = userReports[0];
          response = `You have ${userReports.length} reports. Your latest ("${latest.title}") is currently in the ${latest.status.toUpperCase()} stage.`;
          actions = [
            { label: 'Full Dashboard', action: () => navigate('/my-dashboard') },
            { label: 'View Latest', action: () => navigate(`/issue/${latest._id}`) }
          ];
        }
      }
    } else if (query.includes('emergency') || query.includes('help line') || query.includes('number') || query.includes('police')) {
      response = "Here are the State Emergency Helplines:\n\n• Police: 100 / 112\n• Fire: 101\n• Ambulance: 102\n• Women Helpline: 1091";
      actions = [{ label: 'Contact Authorities', action: () => {} }];
    } else if (query.includes('trend') || query.includes('city status') || query.includes('happen')) {
      response = `Here is the current Pulse of the city: ${getCityTrends()}`;
      actions = [{ label: 'View Analytics', action: () => navigate('/dashboard') }];
    } else if (query.includes('weather') || query.includes('rain')) {
      response = "The current forecast shows clear skies, but we recommend checking for waterlogging reports on the Map if it starts raining.";
      actions = [{ label: 'Open Map', action: () => navigate('/map') }];
    } else if (query.includes('report') || query.includes('file') || query.includes('submit')) {
      response = "To report an issue:\n1. Go to the Report page\n2. Pin the location\n3. Upload a photo\n4. Our AI will verify it instantly!";
      actions = [{ label: 'Start Report', action: () => navigate('/report') }];
    } else if (query.includes('hello') || query.includes('hi')) {
      response = `Namaste ${user ? user.name : ''}! I'm your AI civic assistant. I can track your issues, show city trends, or give you emergency contacts. What can I do for you?`;
    } else {
      response = "I'm not sure about that yet, but I can help with report tracking, city trends, or emergency contacts!";
    }

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'bot',
      text: response,
      actions,
      timestamp: new Date()
    }]);
  };

  const quickActions = [
    { label: 'Report Issue', icon: <Megaphone className="w-4 h-4" />, query: 'How do I report an issue?' },
    { label: 'My Status', icon: <Clock className="w-4 h-4" />, query: 'Status of my reports' },
    { label: 'Emergency', icon: <ShieldAlert className="w-4 h-4" />, query: 'Emergency numbers' },
    { label: 'City Trends', icon: <TrendingUp className="w-4 h-4" />, query: 'City trends' }
  ];

  return (
    <>
      {/* Bot Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-[1000] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90 group ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-primary hover:scale-110'}`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-background border px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Assistant
          </span>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            className="fixed bottom-[8.5rem] right-6 z-[1001] w-[340px] md:w-[380px] h-[500px] max-h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Elegant Light Header */}
            <div className="p-6 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all duration-700 group-hover:bg-primary/20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transition-all duration-700 group-hover:bg-blue-500/20" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping opacity-20" />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center border border-primary/20 shadow-sm relative z-10 bg-white">
                    <Bot className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 leading-tight tracking-tight">Urban Assistant</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Verified • Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors relative z-10 border border-slate-200 shadow-sm active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-white border text-primary'}`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.type === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 rounded-tl-none text-slate-700'
                      }`}>
                        {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                      
                      {msg.actions && (
                        <div className="flex flex-wrap gap-2">
                          {msg.actions.map((act, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                act.action();
                                if (act.label !== 'Report Now' && act.label !== 'Start Report') setIsOpen(false);
                              }}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:border-primary hover:text-primary transition-all flex items-center gap-2 shadow-sm"
                            >
                              {act.label} <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer with Quick Actions */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {quickActions.map((qa, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setInput(qa.query);
                      const fakeEvent = { preventDefault: () => {} };
                      setTimeout(() => handleSend(fakeEvent), 0);
                    }}
                    className="whitespace-nowrap px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                  >
                    {qa.icon} {qa.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl px-5 py-4 text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
