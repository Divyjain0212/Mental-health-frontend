import React, { useState } from 'react';
import { Send, Bot, User, AlertCircle, Heart, Shield } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../utils/apiConfig';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

export const AIChat: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm here to provide mental health first aid support. I understand the unique challenges faced by college students in India. How can I help you today?",
      type: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // The ref, scrollToBottom function, and useEffect for scrolling have been removed.

  const fetchAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data } = await axios.post(apiConfig.endpoints.chat, { message: userMessage });
      return data.reply || 'Sorry, I could not generate a response.';
    } catch (e) {
      return 'Sorry, I am having trouble responding right now. Please try again later.';
    }
  };

  const crisisDetected = (text: string) => {
    const phrases = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm'];
    const lower = text.toLowerCase();
    return phrases.some(p => lower.includes(p));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue; // Capture value before clearing
    setInputValue('');
    setIsTyping(true);

    const replyText = await fetchAIResponse(currentInput);
    // Crisis detection and alert
    if (crisisDetected(currentInput)) {
      try {
        await axios.post(
          apiConfig.endpoints.alerts,
          { message: currentInput, level: 'critical' },
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );
      } catch {}
    }
    // Convert raw response to cleaner paragraphs and bullets
    const normalized = replyText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        if (/^[-•]/.test(l)) return `• ${l.replace(/^[-•]\s*/, '')}`;
        return l;
      })
      .join('\n');
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: normalized,
      type: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('chat.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t('chat.subtitle')}
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Privacy Notice:</strong> This chat is completely confidential and anonymous. No personal information is stored or shared. If you're in crisis, please contact emergency services or your campus counseling center immediately.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Crisis Support:</strong> If you're having thoughts of self-harm, please call <strong>022-27546669</strong> immediately or contact campus emergency. Your safety matters.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="h-96 overflow-y-auto p-6 space-y-4 border-b">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-gray-600' : 'bg-blue-600'
                }`}>
                  {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Render paragraphs and bullet lines nicely */}
                  <div className="text-sm space-y-2">
                    {message.content.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('•')) {
                        return (
                          <div key={idx} className="flex items-start">
                            <span className={`${message.type === 'user' ? 'text-blue-200' : 'text-gray-700'}`} style={{ marginRight: 6 }}>•</span>
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trimmed.replace(/^•\s*/, '')) }} />
                          </div>
                        );
                      }
                      return <p key={idx} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trimmed) }} />;
                    })}
                  </div>
                  <p className={`text-xs mt-1 text-right ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex space-x-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind... I'm here to listen and help."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Common topics I can help with:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Exam anxiety and academic pressure',
              'Homesickness and adjustment issues',
              'Relationship and social challenges',
            ].map((topic, index) => (
              <button
                key={index}
                onClick={() => setInputValue(`I need help with ${topic.toLowerCase()}`)}
                className="p-3 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center space-x-2">
                  <Heart size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{topic}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};