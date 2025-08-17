'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface EventMessage {
  id: string;
  content: string;
  messageType: 'TEXT' | 'SYSTEM' | 'ANNOUNCEMENT';
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
  parentId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  parent?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  replies?: EventMessage[];
}

interface EventChatProps {
  eventId: string;
  eventTitle: string;
}

export default function EventChat({ eventId, eventTitle }: EventChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<EventMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [eventId]);

  // Rechargement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        console.log('Messages chargés:', data.length);
      } else {
        const errorData = await response.json();
        console.error('Erreur API messages:', errorData);
      }
    } catch (error) {
      console.error('Erreur fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          parentId: replyTo?.id || null
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setReplyTo(null);
        // Recharger tous les messages pour s'assurer de la synchronisation
        await fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setSending(false);
    }
  };

  const editMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/events/${eventId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim()
        }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev => 
          prev.map(msg => msg.id === messageId ? updatedMessage : msg)
        );
        setEditingMessage(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short' 
      });
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isOwnMessage = (userId: string) => {
    return userId === session?.user?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3244c7]"></div>
        <span className="ml-2 text-gray-600">Chargement du chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#3244c7]/5 to-blue-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            💬 Chat - {eventTitle}
          </h3>
          <p className="text-sm text-gray-600">
            {messages.length} message{messages.length !== 1 ? 's' : ''} {loading && '(actualisation...)'}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 transition-colors"
        >
          {loading ? '🔄' : '↻'} 
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💭</div>
            <p className="text-gray-600">Aucun message pour le moment</p>
            <p className="text-sm text-gray-500">Soyez le premier à commencer la discussion !</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isOwnMessage(message.user.id) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage(message.user.id) ? 'order-2' : 'order-1'}`}>
                    {/* Avatar et nom */}
                    <div className={`flex items-center mb-1 ${isOwnMessage(message.user.id) ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3244c7] to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        {message.user.avatar ? (
                          <img 
                            src={message.user.avatar} 
                            alt={`${message.user.firstName} ${message.user.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getUserInitials(message.user.firstName, message.user.lastName)
                        )}
                      </div>
                      <span className={`text-sm font-medium text-gray-700 ${isOwnMessage(message.user.id) ? 'mr-2' : 'ml-2'}`}>
                        {isOwnMessage(message.user.id) ? 'Moi' : `${message.user.firstName} ${message.user.lastName}`}
                      </span>
                    </div>

                    {/* Message parent si réponse */}
                    {message.parent && (
                      <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mb-2 rounded text-sm">
                        <div className="text-xs text-gray-600 mb-1">
                          Réponse à {message.parent.user.firstName} {message.parent.user.lastName}
                        </div>
                        <div className="text-gray-700 truncate">
                          {message.parent.content}
                        </div>
                      </div>
                    )}

                    {/* Contenu du message */}
                    <div className={`relative group rounded-lg p-3 ${
                      isOwnMessage(message.user.id)
                        ? 'bg-gradient-to-br from-[#3244c7] to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {editingMessage === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => editMessage(message.id)}
                              className="text-xs"
                            >
                              Sauvegarder
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingMessage(null);
                                setEditContent('');
                              }}
                              className="text-xs"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          
                          {/* Actions du message */}
                          {isOwnMessage(message.user.id) && (
                            <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingMessage(message.id);
                                    setEditContent(message.content);
                                  }}
                                  className="p-1 rounded hover:bg-white/20 transition-colors"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="p-1 rounded hover:bg-white/20 transition-colors"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Métadonnées */}
                    <div className={`mt-1 flex items-center text-xs text-gray-500 ${isOwnMessage(message.user.id) ? 'justify-end' : 'justify-start'}`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {message.isEdited && (
                        <span className="ml-2">(modifié)</span>
                      )}
                      {!isOwnMessage(message.user.id) && (
                        <button
                          onClick={() => setReplyTo(message)}
                          className="ml-2 hover:text-[#3244c7] transition-colors"
                          title="Répondre"
                        >
                          <ArrowUturnLeftIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de réponse */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-600">
                Réponse à {replyTo.user.firstName} {replyTo.user.lastName}
              </div>
              <div className="text-sm text-gray-800 truncate">
                {replyTo.content}
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={replyTo ? `Répondre à ${replyTo.user.firstName}...` : "Tapez votre message..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3244c7] focus:border-[#3244c7] transition-all"
            maxLength={2000}
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        {newMessage.length > 1800 && (
          <div className="text-xs text-gray-500 mt-1">
            {2000 - newMessage.length} caractères restants
          </div>
        )}
      </form>
    </div>
  );
}