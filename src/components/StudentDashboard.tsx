import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { useAuth } from '../contexts/AuthContext';
import { Smile, Meh, Frown, Bot, UserPlus, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Calendar as CalIcon } from 'lucide-react';
import MoodDetector from './MoodDetector';

// Mood history will be fetched from backend /api/moods/stats
const mockMoodHistory: { day: string; mood: number }[] = [];

const moodLevels = { 1: 'Sad', 2: 'Okay', 3: 'Happy' };

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Array<{ _id: string; date: string; time: string; counsellor?: { email: string }, status?: string }>>([]);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [history, setHistory] = useState<{ day: string; mood: number }[]>(mockMoodHistory);

  // 2. Add this useEffect hook to trigger notifications
  useEffect(() => {
    // Show a survey reminder after 3 seconds
    const surveyTimeout = setTimeout(() => {
      toast.success("Don't forget your Weekly Wellness Check-in!", {
        icon: '📝',
        duration: 6000,
      });
    }, 3000);

    // Show a motivational quote after 10 seconds
    const motivationTimeout = setTimeout(() => {
      toast('"The secret of getting ahead is getting started." - Mark Twain', {
        icon: '🌟',
        duration: 6000,
      });
    }, 10000);

    // Cleanup function to clear timers if the component unmounts
    return () => {
      clearTimeout(surveyTimeout);
      clearTimeout(motivationTimeout);
    };
  }, []); // The empty array [] means this runs only once when the component loads

  // Load upcoming appointments (real data)
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/appointments/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        // For student, entries include counsellor populated
        const upcoming = data
          .filter((a: any) => a.status === 'scheduled')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setAppointments(upcoming);
      } catch {}
    };
    if (token) load();
  }, [token]);

  const cancelAppointment = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      // Refetch after delete to ensure backend state is reflected
      const { data } = await axios.get('http://localhost:5000/api/appointments/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      const upcoming = data
        .filter((a: any) => a.status === 'scheduled')
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setAppointments(upcoming);
    } catch {}
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    try {
      const { data } = await axios.post('http://localhost:5000/api/moods', { mood, source: 'self' });
      if (data?.gamification) {
        setPoints(data.gamification.points);
        setStreak(data.gamification.streakCount);
      }
      // Refresh stats after check-in
      const stats = await axios.get('http://localhost:5000/api/moods/stats');
      if (stats?.data) {
        setHistory(stats.data.history7d || []);
        setPoints(stats.data.points || 0);
        setStreak(stats.data.streakCount || 0);
      }
    } catch {}
  };

  // Load initial mood stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/moods/stats');
        setHistory(data.history7d || []);
        setPoints(data.points || 0);
        setStreak(data.streakCount || 0);
      } catch {}
    };
    loadStats();
  }, []);

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50 to-green-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Welcome, {user?.email.split('@')[0]}
          </h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Mood + Survey */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Tracker */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-blue-100">
              <h2 className="text-xl font-semibold mb-4">Daily Mood Check-in</h2>
              <div className="flex justify-around items-center">
                <button onClick={() => handleMoodSelect('Happy')} className={`p-4 rounded-full transition-all ${selectedMood === 'Happy' ? 'bg-green-100 ring-2 ring-green-500' : 'hover:bg-green-50'}`}>
                  <Smile size={40} className="text-green-500" />
                  <span className="text-sm">Happy</span>
                </button>
                <button onClick={() => handleMoodSelect('Okay')} className={`p-4 rounded-full transition-all ${selectedMood === 'Okay' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'hover:bg-yellow-50'}`}>
                  <Meh size={40} className="text-yellow-500" />
                  <span className="text-sm">Okay</span>
                </button>
                <button onClick={() => handleMoodSelect('Sad')} className={`p-4 rounded-full transition-all ${selectedMood === 'Sad' ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-blue-50'}`}>
                  <Frown size={40} className="text-blue-500" />
                  <span className="text-sm">Sad</span>
                </button>
                <button onClick={() => handleMoodSelect('Angry')} className={`p-4 rounded-full transition-all ${selectedMood === 'Angry' ? 'bg-red-100 ring-2 ring-red-500' : 'hover:bg-red-50'}`}>
                  <AlertTriangle size={40} className="text-red-500" />
                  <span className="text-sm">Angry</span>
                </button>
              </div>
            </div>

            {/* Wellness Check-in (Survey CTA) */}
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Weekly Wellness Check-in</h2>
              <p className="mb-4">Take a few moments for a confidential mental health screening (PHQ-9 for depression). Your results are private.</p>
              <a href="https://quiz.theliven.com/en/5760_ogiw5/quiz?utm_source=google&utm_source_res=google&account=chesmint&utm_medium=display&utm_campaign=23005934627&utm_device=m&placement=&utm_creative=773355798399&campaign_name=5993_Search_General_w2w_Purch-GTM_WW-bl_AllSemantic_anxt-mpf_1009_YAR&adset_name=MC_Discovery_Top28_allG_25-65+_allL_TopCreo_anxt-mpf_Top-3_1009&matchtype=" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Screening
            </a>
            </div>

            {/* Mood History Chart */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Your Mood History (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis 
                    ticks={[1, 2, 3]} 
                    tickFormatter={(value: keyof typeof moodLevels) => moodLevels[value]} 
                  />
                  <Tooltip 
                    formatter={(value: keyof typeof moodLevels) => moodLevels[value]} 
                  />
                  <Bar dataKey="mood" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Gamification */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Your Points</div>
                <div className="text-2xl font-bold text-blue-600">{points}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-bold text-green-600">{streak} day{streak === 1 ? '' : 's'}</div>
              </div>
            </div>
            {/* Webcam Mood Detector */}
            <MoodDetector />
            {/* Camera Mood Detector CTA */}
          </div>

          {/* Side Panel: Quick Access */}
          <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><CalIcon size={18} className="text-indigo-600" />Upcoming Appointments</h3>
            {appointments.length === 0 ? (
              <div className="text-sm text-gray-500">No upcoming appointments.</div>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a._id} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{new Date(a.date).toLocaleDateString('en-GB')} at {a.time}</div>
                      <div className="text-xs text-gray-600">Counsellor: {a.counsellor?.email || 'TBD'}</div>
                    </div>
                    <button onClick={() => cancelAppointment(a._id)} className="text-xs px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
                  </div>
                ))}
              </div>
            )}
          </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Quick Access</h3>
              <div className="space-y-3">
                <Link to="/ai-support" className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Bot className="text-gray-600" />
                  <span className="font-medium">Talk to AI Assistant</span>
                </Link>
              <Link to="/counselors" className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                <UserPlus className="text-gray-600" />
                <span className="font-medium">Find a Counsellor</span>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;