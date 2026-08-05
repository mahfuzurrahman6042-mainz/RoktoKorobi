"use client";

import { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages, markMessageAsRead } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/firebase';
import { Send, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  requestId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessagingChatProps {
  requestId: string;
  receiverId: string;
  receiverName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagingChat({ requestId, receiverId, receiverName, isOpen, onClose }: MessagingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!isOpen || !requestId) return;

    const unsubscribe = getMessages(requestId, (msgs) => {
      setMessages(msgs);
      
      // Mark messages as read when they're received
      msgs.forEach(async (msg) => {
        if (msg.receiverId === currentUser?.uid && !msg.read) {
          await markMessageAsRead(msg.id, requestId);
        }
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [requestId, isOpen, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      await sendMessage(currentUser.uid, receiverId, requestId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{receiverName || 'Chat'}</h3>
            <p className="text-xs text-gray-500">Blood Request #{requestId.slice(-6)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUser?.uid;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-red-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-red-200' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {!message.read && isOwn && ' • Unread'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
