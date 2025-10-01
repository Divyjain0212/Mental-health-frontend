import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Shield, Users, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { apiConfig } from '../utils/apiConfig';

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: { email: string; role: string } | string;
  createdAt: string;
  category: string;
  likes: string[];
  replies: any[];
  isAnonymous: boolean;
  tags: string[];
}

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const posted = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);
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
  
  const { t } = useLanguage();
  const { user, token } = useAuth();
  
  // Initialize posts with localStorage
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    try {
      const savedPosts = localStorage.getItem('peerForumPosts');
      const parsed = savedPosts ? JSON.parse(savedPosts) : [];
      console.log('PeerForum: Loaded', parsed.length, 'posts from localStorage');
      return parsed;
    } catch (error) {
      console.error('Failed to load posts from localStorage:', error);
      return [];
    }
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState({ content: '', isAnonymous: true });
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: true,
    tags: ''
  });

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    try {
      localStorage.setItem('peerForumPosts', JSON.stringify(posts));
      console.log('Saved', posts.length, 'posts to localStorage');
    } catch (error) {
      console.error('Failed to save posts to localStorage:', error);
    }
  }, [posts]);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading forum posts...', {
          endpoint: apiConfig.endpoints.forum,
          hasToken: !!token,
          userRole: user?.role
        });
        
        if (!token) {
          console.warn('No authentication token - skipping server post loading');
          setLoading(false);
          return;
        }
        
        // Set up proper headers with authentication
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(apiConfig.endpoints.forum, { headers });
        console.log('✅ Forum posts loaded from server:', data.length, 'posts');
        
        if (Array.isArray(data)) {
          // Merge server posts with any existing local posts
          setPosts(prevPosts => {
            const serverPosts = data;
            const localPosts = prevPosts.filter(post => post._id.startsWith('temp-'));
            
            // Combine server posts with local temporary posts
            const mergedPosts = [...serverPosts];
            localPosts.forEach(localPost => {
              // Only add local posts that aren't already in server posts
              if (!serverPosts.find(serverPost => serverPost.title === localPost.title && serverPost.content === localPost.content)) {
                mergedPosts.unshift(localPost);
              }
            });
            
            console.log('📊 Posts merged:', {
              server: serverPosts.length,
              local: localPosts.length,
              total: mergedPosts.length
            });
            return mergedPosts;
          });
        }
        setLoading(false);
      } catch (e: any) {
        console.error('❌ Forum load error:', {
          message: e.message,
          status: e?.response?.status,
          statusText: e?.response?.statusText,
          data: e?.response?.data
        });
        
        const errorMessage = `Failed to load posts: ${e?.response?.data?.message || e?.message || 'Unknown error'}`;
        setError(errorMessage);
        setLoading(false);
        console.log('🔄 API failed, preserving existing local posts');
        // Don't modify posts when API fails - preserve existing local posts
      }
    };

    console.log('🔄 PeerForum useEffect triggered', { hasToken: !!token, hasUser: !!user });
    if (token) { // Only try to load if we have a token
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  // Handle creating new posts
  const handleNewPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content.");
      return;
    }
    
    console.log('Creating forum post...');
    
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
    
    // Add post to local state immediately
    setPosts(prevPosts => [optimisticPost, ...prevPosts]);
    
    // Reset form
    setShowNewPostForm(false);
    setNewPost({ title: '', content: '', category: 'General Discussion', isAnonymous: true, tags: '' });
    
    // Try to save to server (with proper authentication)
    try {
      if (!token) {
        console.warn('No authentication token available - post will only be saved locally');
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      };
      
      console.log('Attempting to save post to server...', {
        endpoint: apiConfig.endpoints.forum,
        hasToken: !!token,
        postData: {
          title: optimisticPost.title,
          content: optimisticPost.content,
          category: optimisticPost.category,
          isAnonymous: optimisticPost.isAnonymous
        }
      });
      
      const response = await axios.post(apiConfig.endpoints.forum, {
        title: optimisticPost.title,
        content: optimisticPost.content,
        category: optimisticPost.category,
        isAnonymous: optimisticPost.isAnonymous
      }, { headers });
      
      console.log('✅ Post successfully saved to server:', response.status, response.data);
      
      // If server save was successful, replace the temp post with the server version
      if (response.data) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === optimisticPost._id ? response.data : post
          )
        );
        console.log('✅ Replaced temporary post with server version');
      }
    } catch (e: any) {
      console.error('❌ Failed to save to server:', {
        message: e.message,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        endpoint: apiConfig.endpoints.forum
      });
      
      // Show user-friendly error message
      if (e?.response?.status === 401) {
        setError('Authentication failed - please log in again');
      } else if (e?.response?.status === 403) {
        setError('Access denied - insufficient permissions');
      } else {
        setError('Failed to save post to server - post saved locally only');
      }
    }
  };

  // Handle adding replies to posts
  const handleReply = async (postId: string) => {
    if (!newReply.content.trim()) {
      alert("Please enter a reply.");
      return;
    }
    
    try {
      const headers = token ? { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      } : { 
        'Content-Type': 'application/json' 
      };
      
      const response = await axios.post(`${apiConfig.endpoints.forum}/${postId}/reply`, {
        content: newReply.content,
        isAnonymous: newReply.isAnonymous
      }, { headers });
      
      if (response.data) {
        // Update the post with the new reply
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, replies: [...post.replies, response.data] }
              : post
          )
        );
        
        // Reset reply form
        setNewReply({ content: '', isAnonymous: true });
        setReplyingTo(null);
      }
    } catch (e: any) {
      console.error('Failed to add reply:', e);
      // Add reply optimistically even if server fails
      const optimisticReply = {
        _id: `temp-reply-${Date.now()}`,
        content: newReply.content,
        author: newReply.isAnonymous ? 'Anonymous' : (user?.email || 'Anonymous'),
        isAnonymous: newReply.isAnonymous,
        createdAt: new Date().toISOString()
      };
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, replies: [...post.replies, optimisticReply] }
            : post
        )
      );
      
      setNewReply({ content: '', isAnonymous: true });
      setReplyingTo(null);
    }
  };

  // Handle deleting posts
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const headers = token ? { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      } : { 
        'Content-Type': 'application/json' 
      };
      
      await axios.delete(`${apiConfig.endpoints.forum}/${postId}`, { headers });
      
      // Remove post from local state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      
    } catch (e: any) {
      console.error('Failed to delete post:', e);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Toggle post expansion
  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  console.log('PeerForum: State - posts:', posts.length, 'loading:', loading, 'error:', error, 'user:', !!user, 'token:', !!token);
  
  // Minimal component to test basic rendering
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Peer Support Forum</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">Share your experiences and connect with others</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-4xl mx-auto">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 mb-2">Safe Space Guidelines</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Be respectful and supportive.</li>
                  <li>• Anonymous posting is encouraged.</li>
                  <li>• Discussions are moderated by trained volunteers.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <button 
            onClick={() => setShowNewPostForm(!showNewPostForm)} 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{showNewPostForm ? "Close Form" : "Share Your Experience"}</span>
          </button>
        </div>

        {/* Status Display for Errors Only */}
        {error && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Authentication Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-800">
                  <strong>Connected:</strong> Logged in as {user.email} - Posts will be saved to database
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800">
                  <strong>Local Mode:</strong> Please log in to save posts to database. Posts are currently saved locally only.
                </span>
              </>
            )}
          </div>
        </div>

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Share with the Community</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                value={newPost.title} 
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
              />
              <textarea 
                placeholder="Share your thoughts..." 
                value={newPost.content} 
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} 
                rows={4} 
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
              />
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="anonymous" 
                  checked={newPost.isAnonymous} 
                  onChange={(e) => setNewPost(prev => ({ ...prev, isAnonymous: e.target.checked }))} 
                  className="w-4 h-4 text-blue-600 rounded" 
                />
                <label htmlFor="anonymous" className="text-sm">Post anonymously</label>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleNewPost} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Share Post</button>
                <button onClick={() => setShowNewPostForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Display */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No posts have been shared yet.</p>
              <p className="text-gray-500">Be the first to start a conversation!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="font-medium text-blue-600">
                          {typeof post.author === 'string' ? post.author : post.author?.email || 'Anonymous'}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{post.category}</span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => togglePostExpansion(post._id)}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span>{post.replies.length} {expandedPosts.has(post._id) ? 'Hide Replies' : 'View Replies'}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(post._id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                    
                    {/* Delete button - only show for post author */}
                    {((typeof post.author === 'string' && post.author === user?.email) || 
                      (typeof post.author === 'object' && post.author?.email === user?.email)) && (
                      <button 
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-600 hover:text-red-800 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Replies Section */}
                  {expandedPosts.has(post._id) && post.replies.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Replies</h4>
                      <div className="space-y-3">
                        {post.replies.map((reply: any) => (
                          <div key={reply._id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                              <span className="font-medium text-blue-600">
                                {typeof reply.author === 'string' ? reply.author : reply.author?.email || 'Anonymous'}
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{formatTimeAgo(reply.createdAt)}</span>
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === post._id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Add Reply</h4>
                      <div className="space-y-3">
                        <textarea 
                          value={newReply.content}
                          onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your reply..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`reply-anonymous-${post._id}`}
                              checked={newReply.isAnonymous} 
                              onChange={(e) => setNewReply(prev => ({ ...prev, isAnonymous: e.target.checked }))} 
                              className="w-4 h-4 text-blue-600 rounded" 
                            />
                            <label htmlFor={`reply-anonymous-${post._id}`} className="text-sm">Reply anonymously</label>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleReply(post._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              Post Reply
                            </button>
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};