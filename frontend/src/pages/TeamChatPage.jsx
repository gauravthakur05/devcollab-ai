import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MessagesSquare, Send } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import ProjectPicker from '../components/ProjectPicker';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import { useProjects } from '../hooks/useProjects';
import { useSocket } from '../hooks/useSocket';
import { chatApi } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/formatters';

export default function TeamChatPage() {
  const { projects, loading: loadingProjects } = useProjects();
  const { user } = useAuth();
  const toast = useToast();
  const socketRef = useSocket();
  const [projectId, setProjectId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0]._id);
  }, [projects]);

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    chatApi.list(projectId)
      .then((res) => setMessages(res.data.data.messages))
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join/leave the project's socket room and listen for live events.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !projectId) return undefined;

    socket.emit('project:join', projectId);

    const onMessage = (msg) => {
      if (msg.projectId === projectId || msg.projectId?._id === projectId) {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      }
    };
    const onTypingStart = ({ userId, projectId: pid }) => {
      if (pid === projectId && userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    };
    const onTypingStop = ({ userId, projectId: pid }) => {
      if (pid === projectId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    };

    socket.on('chat:message', onMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('chat:message', onMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [projectId, socketRef.current]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const messageText = text.trim();
    setText('');
    try {
      const res = await chatApi.send(projectId, messageText);
      setMessages((prev) => (prev.some((m) => m._id === res.data.data.message._id) ? prev : [...prev, res.data.data.message]));
      socketRef.current?.emit('typing:stop', { projectId });
    } catch (err) {
      toast.error(err.normalizedMessage || 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !projectId) return;
    socketRef.current.emit('typing:start', { projectId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing:stop', { projectId });
    }, 2000);
  };

  return (
    <AppLayout title="Team Chat">
      {loadingProjects ? null : projects.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="No projects yet" description="Create a project first to start chatting with your team." />
      ) : (
        <div className="card flex flex-col h-[calc(100vh-140px)]">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <ProjectPicker projects={projects} value={projectId} onChange={setProjectId} />
            <span className="flex items-center gap-1.5 text-xs text-mint"><span className="w-1.5 h-1.5 rounded-full bg-mint" /> Live</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <p className="text-sm text-muted text-center py-8">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No messages yet. Say hello!</p>
            ) : (
              messages.map((m) => {
                const isMe = (m.sender?._id || m.sender) === user?.id;
                return (
                  <div key={m._id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar user={m.sender} size={30} />
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`rounded-xl px-3 py-2 text-sm ${isMe ? 'bg-accent text-white' : 'bg-surface2 text-ink'}`}>
                        {m.text}
                      </div>
                      <span className="text-[11px] text-muted mt-1">{m.sender?.fullName} · {timeAgo(m.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
            {typingUsers.size > 0 && <p className="text-xs text-muted italic">Someone is typing…</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
            <input
              className="input"
              placeholder="Message the team…"
              value={text}
              onChange={(e) => { setText(e.target.value); handleTyping(); }}
            />
            <button type="submit" className="btn-primary px-3"><Send size={16} /></button>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
