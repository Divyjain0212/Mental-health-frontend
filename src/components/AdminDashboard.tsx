import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import {
  BarChart3, Users, MessageSquare, TrendingUp, AlertTriangle,
  X, Download, Filter, Eye, MapPin
} from 'lucide-react';
import { apiConfig } from '../utils/apiConfig';

// The AdminDashboardProps interface is no longer needed

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  forumPosts: number;
  aiChatSessions: number;
  counselorBookings: number;
  crisisInterventions: number;
  topConcerns: Array<{ concern: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  campusData: Array<{ campus: string; users: number; concerns: string[] }>;
  weeklyTrends: Array<{ week: string; anxiety: number; depression: number; stress: number }>;
}

const mockAnalytics: AnalyticsData = {
  totalUsers: 2847,
  activeUsers: 1653,
  forumPosts: 342,
  aiChatSessions: 1829,
  counselorBookings: 245,
  crisisInterventions: 12,
  topConcerns: [
    { concern: 'Academic Stress', count: 678, trend: 'up' },
    { concern: 'Homesickness', count: 445, trend: 'stable' },
    { concern: 'Anxiety', count: 423, trend: 'up' },
    { concern: 'Social Isolation', count: 312, trend: 'down' },
    { concern: 'Family Pressure', count: 289, trend: 'up' }
  ],
  campusData: [
    { campus: 'Main Campus', users: 1245, concerns: ['Academic Stress', 'Social Issues'] },
    { campus: 'North Campus', users: 892, concerns: ['Homesickness', 'Adjustment'] },
    { campus: 'South Campus', users: 710, concerns: ['Academic Pressure', 'Anxiety'] }
  ],
  weeklyTrends: [
    { week: 'Week 1', anxiety: 45, depression: 23, stress: 67 },
    { week: 'Week 2', anxiety: 52, depression: 28, stress: 73 },
    { week: 'Week 3', anxiety: 48, depression: 31, stress: 69 },
    { week: 'Week 4', anxiety: 55, depression: 26, stress: 78 }
  ]
};

// 2. Remove the onClose prop from the component signature
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [overview, setOverview] = useState<{ totalUsers: number; counsellors: number; students: number; admins: number; upcomingAppointments: number } | null>(null);
  const [counsellors, setCounsellors] = useState<Array<{ _id: string; email: string; name?: string; campus?: string }>>([]);
  const [weekly, setWeekly] = useState<Array<{ label: string; happy: number; sad: number; neutral: number }>>([]);
  const [campus, setCampus] = useState<Array<{ campus: string; counsellors: number }>>([]);

  useEffect(() => {
    // fetch overview from backend, ignore failures
    fetch(`${apiConfig.endpoints.admin}/overview`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setOverview(d))
      .catch(() => {});
    fetch(apiConfig.endpoints.counsellors)
      .then(r => r.ok ? r.json() : [])
      .then(d => setCounsellors(d))
      .catch(() => {});
    fetch(`${apiConfig.endpoints.admin}/weekly-trends`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setWeekly(d))
      .catch(() => {});
    fetch(`${apiConfig.endpoints.admin}/campus-breakdown`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setCampus(d))
      .catch(() => {});
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-red-500" />;
      case 'down': return <TrendingUp size={16} className="text-green-500 transform rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Mental Health Analytics Dashboard</h2>
          {/* 4. Update the button's onClick to navigate to the login page */}
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Campuses</option>
              <option value="main">Main Campus</option>
              <option value="north">North Campus</option>
              <option value="south">South Campus</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1">
              <Download size={14} />
              <span>Export Report</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{(overview?.totalUsers ?? mockAnalytics.totalUsers).toLocaleString()}</p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Counsellors</p>
                  <p className="text-2xl font-bold text-green-900">{(overview?.counsellors ?? 0).toLocaleString()}</p>
                </div>
                <Eye className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Students</p>
                  <p className="text-2xl font-bold text-purple-900">{(overview?.students ?? 0).toLocaleString()}</p>
                </div>
                <MessageSquare className="text-purple-600" size={32} />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-red-900">{(overview?.upcomingAppointments ?? 0).toLocaleString()}</p>
                </div>
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Concerns */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Top Mental Health Concerns
              </h3>
              <div className="space-y-3">
                {mockAnalytics.topConcerns.map((concern, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{concern.concern}</span>
                      {getTrendIcon(concern.trend)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(concern.count / 700) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{concern.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Breakdown (Live) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                Campus-wise Counsellors
              </h3>
              <div className="space-y-3">
                {campus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="font-medium">{item.campus}</div>
                    <div className="text-sm text-gray-600">{item.counsellors} counsellors</div>
                  </div>
                ))}
                {campus.length === 0 && <div className="text-sm text-gray-500">No data yet.</div>}
              </div>
            </div>
          </div>

          {/* Weekly Trends Chart (Live) */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Mood Trends</h3>
            <div className="space-y-4">
              {weekly.map((w, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium">{w.label}</div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1"><span>Happy</span><span>{w.happy}</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${w.happy}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1"><span>Neutral</span><span>{w.neutral}</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${w.neutral}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1"><span>Sad</span><span>{w.sad}</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${w.sad}%` }}></div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Recommended Actions</h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Increase counselor availability during exam periods (high academic stress)</li>
              <li>• Develop targeted homesickness support programs for North Campus</li>
              <li>• Consider anxiety-specific workshops for affected student populations</li>
              <li>• Review crisis intervention protocols - response time improvement needed</li>
              <li>• Expand peer support volunteer training program</li>
            </ul>
          </div>

          {/* Real Counsellor List Snapshot */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Registered Counsellors</h3>
            {counsellors.length === 0 ? (
              <div className="text-sm text-gray-500">No counsellors found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {counsellors.slice(0, 6).map(c => (
                  <div key={c._id} className="p-4 border rounded">
                    <div className="font-medium">{c.name || c.email}</div>
                    <div className="text-xs text-gray-600">{c.email}</div>
                    {c.campus && <div className="text-xs text-gray-600">Campus: {c.campus}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};