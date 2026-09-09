import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Spinner } from '../../components';
import { Send, Zap } from 'lucide-react';

export const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // chat, resume, interview, recommendation

  const modes = [
    { id: 'chat', label: 'General Chat', icon: '💬' },
    { id: 'resume', label: 'Resume Analysis', icon: '📄' },
    { id: 'interview', label: 'Interview Prep', icon: '🎯' },
    { id: 'recommendation', label: 'Job Recommendation', icon: '⭐' },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;
      
      if (mode === 'chat') {
        response = await aiService.chat(input, user.id);
      } else if (mode === 'resume') {
        response = await aiService.resumeAnalysis(input, user.id);
      } else if (mode === 'interview') {
        response = await aiService.interviewPreparation(input, '', [], user.id);
      } else if (mode === 'recommendation') {
        response = await aiService.jobRecommendation(user.id);
      }

      const aiMessage = { role: 'ai', content: response.data.message || response.data.analysis || response.data.preparation || response.data.recommendation };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'ai', content: 'Error: ' + (error.response?.data?.message || 'Something went wrong') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-800">AI Placement Assistant</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setMessages([]);
            }}
            className={`p-4 rounded-lg transition-all ${
              mode === m.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-primary'
            }`}
          >
            <div className="text-2xl mb-2">{m.icon}</div>
            <p className="font-semibold text-sm">{m.label}</p>
          </button>
        ))}
      </div>

      <Card className="h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Zap size={48} className="mx-auto mb-4 text-primary" />
                <p>Start a conversation with AI Assistant</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <Spinner size="sm" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-primary text-white"
          >
            <Send size={20} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIAssistant;
