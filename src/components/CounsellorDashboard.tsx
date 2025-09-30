import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../utils/apiConfig';

interface AppointmentItem {
  _id: string;
  date: string;
  time: string;
  status: string;
  student?: { email: string };
}
interface AlertItem {
  _id: string;
  message: string;
  createdAt: string;
  student?: { email: string };
}

const CounsellorDashboard = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${apiConfig.endpoints.appointments}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(data);
        const { data: alertsData } = await axios.get(`${apiConfig.endpoints.alerts}/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(alertsData);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await axios.patch(
        `${apiConfig.endpoints.appointments}/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev => prev.map(a => (a._id === id ? data : a)));
    } catch (e) {
      // noop
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>
      {alerts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-800 mb-2">Critical Alerts</div>
          <ul className="space-y-2">
            {alerts.map(a => (
              <li key={a._id} className="text-sm text-red-900">
                {new Date(a.createdAt).toLocaleString()} — {a.student?.email || 'Unknown'}: {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map(appt => (
            <div key={appt._id} className="bg-white border p-4 rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{new Date(appt.date).toLocaleDateString('en-GB')} at {appt.time}</div>
                <div className="text-sm text-gray-600">Student: {appt.student?.email || 'N/A'}</div>
                <div className="text-sm">Status: {appt.status}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => updateStatus(appt._id, 'completed')} className="px-3 py-1 bg-green-600 text-white rounded">Mark Completed</button>
                <button onClick={() => updateStatus(appt._id, 'cancelled')} className="px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounsellorDashboard;