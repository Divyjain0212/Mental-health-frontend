import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Plus, Shield, Users, Clock, Trash2, CornerDownRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { apiConfig } from '../utils/apiConfig';

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
  console.log('PeerForum: Component rendering...');
  
  // Minimal component to test basic rendering
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Peer Support Forum</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">Share your experiences and connect with others</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Forum is loading...</h3>
          <p className="text-gray-600">This is a simplified version to test component stability.</p>
        </div>
      </div>
    </section>
  );
};

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
    try {
      setLoading(true);
      setError('');
      console.log('Loading forum posts...');
      console.log('API endpoint:', apiConfig.endpoints.forum);
      console.log('Token exists:', !!token);
      
      const { data } = await axios.get(apiConfig.endpoints.forum);
      console.log('Forum posts loaded:', data);
      
      if (Array.isArray(data)) {
        // Merge server posts with local posts, removing duplicates and temporary posts
        const serverPosts = data;
        const localPosts = posts.filter(post => post._id.startsWith('temp-')); // Keep temporary posts
        
        // Create a map of server posts by ID for deduplication
        const serverPostMap = new Map(serverPosts.map(post => [post._id, post]));
        
        // Combine server posts with local temporary posts
        const mergedPosts = [...serverPosts];
        localPosts.forEach(localPost => {
          if (!serverPostMap.has(localPost._id)) {
            mergedPosts.unshift(localPost); // Add local posts at the beginning
          }
        });
        
        setPosts(mergedPosts);
      }
      setLoading(false);
    } catch (e: any) {
      console.error('Forum load error', e);
      console.error('Error response:', e?.response);
      console.error('Error status:', e?.response?.status);
      console.error('Error data:', e?.response?.data);
      const errorMessage = `Failed to load posts: ${e?.response?.data?.message || e?.message || 'Unknown error'}`;
      setError(errorMessage);
      setLoading(false);
      
      // Don't clear existing posts if we have any - preserve local state
      console.log('Preserving existing posts in local state:', posts.length);
    }
  };

  useEffect(() => {
    console.log('PeerForum useEffect triggered, token:', !!token);
    loadPosts();
  }, [token]);

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    try {
      localStorage.setItem('peerForumPosts', JSON.stringify(posts));
      console.log('Saved', posts.length, 'posts to localStorage');
    } catch (error) {
      console.error('Failed to save posts to localStorage:', error);
    }
  }, [posts]);

  const filteredPosts = (selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)
  );

  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
        alert("Please fill in both title and content.");
        return;
    }
    
    // Debug logging
    console.log('Creating forum post...');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    // Create optimistic post for immediate display
    const optimisticPost: ForumPost = {
      _id: `temp-${Date.now()}`,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      isAnonymous: newPost.isAnonymous,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: newPost.isAnonymous ? 'Anonymous' : (user?.email || 'Anonymous'),
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };
    
    // Add post to local state immediately (optimistic update)
    setPosts(prevPosts => [optimisticPost, ...prevPosts]);
    
    try {
      const res = await axios.post(apiConfig.endpoints.forum, {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        isAnonymous: newPost.isAnonymous,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
      }, token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } });
      
      if (res.status === 201 || res.status === 200 || res.status === 204) {
        console.log('Post created successfully on server');
        // Try to reload posts from server, but don't remove the optimistic post if it fails
        try {
          await loadPosts();
        } catch (reloadError) {
          console.warn('Failed to reload posts from server, keeping optimistic posts:', reloadError);
        }
      }
    } catch (e: any) {
      console.error('Forum create error', e);
      console.error('Error response:', e?.response);
      console.error('Error status:', e?.response?.status);
      console.error('Error data:', e?.response?.data);
      
      // Don't remove the optimistic post even if server call fails
      console.log('Server call failed, but keeping post visible locally');
      // window.alert(`Failed to share post: ${e?.response?.data?.message || e?.message || 'Unknown error'}`);
    }
    
    // Reset form regardless of server response
    setShowNewPostForm(false);
    setNewPost({ title: '', content: '', category: 'General Discussion', isAnonymous: true, tags: '' });
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(`${apiConfig.endpoints.forum}/${postId}/like`, {}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      if (res.status === 200) {
        loadPosts();
      }
    } catch (e: any) {
      console.error('Forum like error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to like post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await axios.delete(`${apiConfig.endpoints.forum}/${postId}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      if (res.status === 200) {
        loadPosts();
      }
    } catch (e: any) {
      console.error('Forum delete error', e);
      window.alert(e?.response?.data?.message || e?.message || 'Failed to delete post');
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(`${apiConfig.endpoints.forum}/${postId}/reply`, { text: replyText }, token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } });
      if (res.status === 201 || res.status === 200) {
        setReplyingTo(null);
        setReplyText('');
        loadPosts();
      }
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadPosts}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && (
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
                    <CornerDownRight size={16} /><span>{replyingTo === post._id ? 'Cancel' : 'Reply'}</span>
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
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No posts have been shared yet.</p>
              <p className="text-gray-500">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
};