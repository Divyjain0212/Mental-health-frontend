import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Clock, Shield, Users, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// --- Interfaces for our data structures ---
interface ReplyContent {
  _id: string;
  author: { email: string } | string;
  text: string;
  createdAt: string;
}

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: { email: string; role: string } | string;
  createdAt: string;
  category: string;
  likes: string[]; // user ids
  replies: ReplyContent[];
  isAnonymous: boolean;
  tags: string[];
}

// --- Helper function to format time ---
const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const PeerForum: React.FC = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const API = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';
  const API_FALLBACKS = [API, 'http://localhost:5000', ''];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General Discussion',
    isAnonymous: true,
    tags: ''
  });

  const categories = [
    'all', 'Academic Stress', 'Adjustment Issues', 'Social Connections', 
    'Family Dynamics', 'Mental Health', 'General Discussion'
  ];

  const loadPosts = async () => {
    let lastErr: any = null;
    for (const base of API_FALLBACKS) {
      try {
        const url = base ? `${base}/api/forum` : '/api/forum';
        const { data } = await axios.get(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        setPosts(data);
        return;
      } catch (e: any) {
        lastErr = e;
      }
    }
    console.error('Forum load error', lastErr);
    window.alert(`${lastErr?.response?.status || ''} ${lastErr?.response?.statusText || ''}: ${lastErr?.response?.data?.message || lastErr?.message || 'Failed to load posts'}`);
  };

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadPosts();
  }, [token]);

  const filteredPosts = (selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)
  );

  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
        alert("Please fill in both title and content.");
        return;
    }
    try {
      let ok = false;
      for (const base of API_FALLBACKS) {
        try {
          const url = base ? `${base}/api/forum` : '/api/forum';
          const res = await axios.post(url, {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        isAnonymous: newPost.isAnonymous,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
          }, token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } });
          if (res.status === 201 || res.status === 200 || res.status === 204) {
            ok = true;
            break;
          }
        } catch (e) {
          // try next base
        }
      }
      if (!ok) throw new Error('All endpoints failed');
      setShowNewPostForm(false);
      setNewPost({ title: '', content: '', category: 'General Discussion', isAnonymous: true, tags: '' });
      loadPosts();
    } catch (e: any) {
      console.error('Forum create error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to share post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      let ok = false;
      for (const base of API_FALLBACKS) {
        try {
          const url = base ? `${base}/api/forum/${postId}/like` : `/api/forum/${postId}/like`;
          const res = await axios.post(url, {}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
          if (res.status === 200) { ok = true; break; }
        } catch {}
      }
      if (!ok) throw new Error('Failed to like');
      loadPosts();
    } catch (e: any) {
      console.error('Forum like error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to like post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      let ok = false;
      for (const base of API_FALLBACKS) {
        try {
          const url = base ? `${base}/api/forum/${postId}` : `/api/forum/${postId}`;
          const res = await axios.delete(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
          if (res.status === 200) { ok = true; break; }
        } catch {}
      }
      if (!ok) throw new Error('Failed to delete');
      loadPosts();
    } catch (e: any) {
      console.error('Forum delete error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to delete post');
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!replyText.trim()) return;
    try {
      let ok = false;
      for (const base of API_FALLBACKS) {
        try {
          const url = base ? `${base}/api/forum/${postId}/reply` : `/api/forum/${postId}/reply`;
          const res = await axios.post(url, { text: replyText }, token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } });
          if (res.status === 201 || res.status === 200) { ok = true; break; }
        } catch {}
      }
      if (!ok) throw new Error('Failed to reply');
      setReplyingTo(null);
      setReplyText('');
      loadPosts();
    } catch (e: any) {
      console.error('Forum reply error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to reply');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'volunteer': return 'Peer Volunteer';
      case 'moderator': return 'Moderator';
      default: return 'Student';
    }
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'volunteer': return 'text-green-600';
      case 'moderator': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header, Guidelines, Filters, and New Post Button */}
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('forum.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">{t('forum.subtitle')}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-4xl mx-auto">
                <div className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-2">Safe Space Guidelines</h3>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Be respectful and supportive.</li>
                            <li>• Anonymous posting is encouraged.</li>
                            <li>• Discussions are moderated by trained volunteers.</li>
                            <li>• Crisis posts are flagged for professional attention.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'}`}>
                    {category === 'all' ? 'All Topics' : category}
                </button>
            ))}
        </div>
        <div className="mb-8 text-center">
          <button onClick={() => setShowNewPostForm(!showNewPostForm)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center space-x-2">
            <Plus size={20} />
            <span>{showNewPostForm ? "Close Form" : "Share Your Experience"}</span>
          </button>
        </div>

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Share with the Community</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              <textarea placeholder="Share your thoughts..." value={newPost.content} onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              <div className="flex items-center space-x-4">
                <select value={newPost.category} onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))} className="border border-gray-300 rounded-lg px-4 py-2">
                  {categories.slice(1).map(cat => ( <option key={cat} value={cat}>{cat}</option>))}
                </select>
                <input type="text" placeholder="Tags (comma-separated)" value={newPost.tags} onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))} className="flex-1 border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="anonymous" checked={newPost.isAnonymous} onChange={(e) => setNewPost(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="anonymous" className="text-sm">Post anonymously</label>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleNewPost} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Share Post</button>
                <button onClick={() => setShowNewPostForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const userHasLiked = user && post.likes.some((id) => id === user._id);
            const authorEmail = typeof post.author === 'string' ? post.author : post.author?.email;
            const authorRole = typeof post.author === 'string' ? 'student' : (post.author as any)?.role || 'student';
            return (
            <div key={post._id} className="bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className={`font-medium ${getRoleColor(authorRole)}`}>{authorEmail || 'Anonymous'}</span>
                          <span>({getRoleBadge(authorRole)})</span>
                          <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{formatTimeAgo(post.createdAt)}</span>
                          </span>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{post.category}</span>
                    <button onClick={() => handleDelete(post._id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">#{tag}</span>)}
                    </div>
                )}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button onClick={() => handleLike(post._id)} className={`flex items-center space-x-1 transition-colors ${userHasLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                      <Heart size={16} fill={userHasLiked ? 'currentColor' : 'none'} />
                      <span>{post.likes.length}</span>
                    </button>
                    <span className="flex items-center space-x-1"><MessageCircle size={16} /><span>{post.replies.length} replies</span></span>
                  </div>
                  <button onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)} className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Reply size={16} /><span>{replyingTo === post._id ? 'Cancel' : 'Reply'}</span>
                  </button>
                </div>
                {replyingTo === post._id && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                            {post.replies.length > 0 ? post.replies.map(reply => (
                                <div key={reply._id} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-800">{reply.text}</p>
                                    <p className="text-xs text-gray-500 mt-1 text-right">- {typeof reply.author === 'string' ? reply.author : (reply.author as any)?.email || 'Anonymous'}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500">No replies yet. Be the first to offer support!</p>}
                        </div>
                        <div className="flex items-start space-x-3">
                            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a supportive reply..." rows={2} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
                            <button onClick={() => handleReplySubmit(post._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit</button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          )})}
        </div>
        
        {posts.length === 0 && !showNewPostForm && (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts have been shared yet.</p>
            <p className="text-gray-500">Be the first to start a conversation!</p>
          </div>
        )}
      </div>
    </section>
  );
};