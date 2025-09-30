import React, { useState, useMemo, FC, useEffect } from 'react';
import { MapPin, Phone, Mail, Calendar, Star, Filter, Clock, Languages, X, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../utils/apiConfig';

// --- INTERFACES & MOCK DATA ---

interface Counselor {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  location: string;
  campus: string;
  phone: string;
  email: string;
  availableDays: string[];
  availableHours: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  emergencyContact: boolean;
  culturalBackground?: string;
}

interface Appointment {
    id: string;
    counselorName: string;
    counselorId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM AM/PM
}

interface Helpline {
    name: string;
    phone: string;
    description: string;
    availability: string;
}

// Will be loaded from backend

const helplines: Helpline[] = [
  {
    name: 'National Suicide Prevention Helpline',
    phone: '022-27546669',
    description: '24/7 crisis support',
    availability: 'Available 24/7'
  },
  {
    name: 'Campus Emergency Line',
    phone: '+91-9876543200',
    description: 'Immediate campus security and medical assistance',
    availability: 'Available 24/7'
  },
  {
    name: 'Student Support Hotline',
    phone: '+91-9876543201',
    description: 'General student support and guidance',
    availability: 'Mon-Fri, 8 AM - 8 PM'
  }
];

// --- HELPER FUNCTIONS ---
const generateTimeSlots = (startStr: string, endStr: string): string[] => {
    const slots: string[] = [];
    const parseTime = (timeStr: string): number => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    let startMinutes = parseTime(startStr);
    const endMinutes = parseTime(endStr);

    while (startMinutes < endMinutes) {
        const hours = Math.floor(startMinutes / 60);
        const minutes = startMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
        startMinutes += 60;
    }
    return slots;
};

// --- MAIN COMPONENT ---
export const CounselorDirectory: FC = () => {
  const { token } = useAuth();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingDetails, setBookingDetails] = useState<{date: string, time: string}>({ date: '', time: '' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCounsellors = async () => {
      const { data } = await axios.get(apiConfig.endpoints.counsellors);
      const mapped: Counselor[] = data.map((u: any) => ({
        id: u._id,
        name: u.name || u.email,
        title: (u.specialization && u.specialization[0]) || 'Counsellor',
        specialization: u.specialization || [],
        location: u.location || 'Counselling Center',
        campus: u.campus || 'Main Campus',
        phone: u.phone || '',
        email: u.email,
        availableDays: u.availableDays || ['Monday', 'Wednesday', 'Friday'],
        availableHours: u.availableHours || '9:00 AM - 5:00 PM',
        languages: u.languages || ['English'],
        rating: 4.7,
        reviewCount: 50,
        isAvailable: true,
        emergencyContact: false,
        culturalBackground: ''
      }));
      setCounselors(mapped);
    };
    loadCounsellors();
  }, []);

  const handleBookAppointmentClick = (counselor: Counselor): void => {
    setSelectedCounselor(counselor);
    setShowBookingModal(true);
    setError('');
    const today = new Date().toISOString().split('T')[0];
    setBookingDetails({ date: today, time: '' });
  };
  
  const handleConfirmBooking = (): void => {
    if (!selectedCounselor) {
        setError('No counselor selected. Please try again.');
        return;
    }
    if (!bookingDetails.date || !bookingDetails.time) {
        setError('Please select both a date and a time.');
        return;
    }
    const dayOfWeek = new Date(bookingDetails.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!selectedCounselor.availableDays.includes(dayOfWeek)) {
        setError(`Dr. ${selectedCounselor.name.split(' ').pop()} is not available on ${dayOfWeek}s.`);
        return;
    }
    const doBook = async () => {
      try {
        const { data } = await axios.post(
          apiConfig.endpoints.appointments,
          { counsellorId: selectedCounselor.id, date: bookingDetails.date, time: bookingDetails.time },
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );
        const newAppointment: Appointment = {
          id: data._id,
          counselorId: selectedCounselor.id,
          counselorName: selectedCounselor.name,
          date: data.date,
          time: data.time,
        };
        setAppointments([...appointments, newAppointment]);
        setShowBookingModal(false);
        setSelectedCounselor(null);
      } catch (err) {
        setError('Failed to book appointment. Please try again.');
      }
    };
    doBook();
  };

  const handleCancelAppointment = async (appointmentId: string): Promise<void> => {
      try {
        await axios.delete(`${apiConfig.endpoints.appointments}/${appointmentId}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        // Refetch to ensure backend state is authoritative
        const { data } = await axios.get(`${apiConfig.endpoints.appointments}/me`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        const upcoming: Appointment[] = data
          .filter((a: any) => a.status === 'scheduled')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((a: any) => ({ id: a._id, counselorId: a.counsellor?._id || a.counsellor, counselorName: a.counsellor?.email || 'Counsellor', date: a.date, time: a.time }));
        setAppointments(upcoming);
      } catch (e) {
        // Optional: surface error
      }
  }

  // Load upcoming appointments for student
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${apiConfig.endpoints.appointments}/me`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        const upcoming: Appointment[] = data
          .filter((a: any) => a.status === 'scheduled')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((a: any) => ({ id: a._id, counselorId: a.counsellor?._id || a.counsellor, counselorName: a.counsellor?.email || 'Counsellor', date: a.date, time: a.time }));
        setAppointments(upcoming);
      } catch {}
    };
    if (token) load();
  }, [token]);

  const specializations = useMemo<string[]>(() => [
    'all', ...Array.from(new Set(counselors.flatMap(c => c.specialization)))
  ], [counselors]);

  const allLanguages = useMemo<string[]>(() => Array.from(new Set(counselors.flatMap(c => c.languages))), [counselors]);

  const filteredCounselors = useMemo<Counselor[]>(() => counselors.filter(counselor => {
    const specializationMatch = selectedSpecialization === 'all' || counselor.specialization.includes(selectedSpecialization);
    const availabilityMatch = !showOnlyAvailable || counselor.isAvailable;
    const languageMatch = selectedLanguage === 'all' || counselor.languages.includes(selectedLanguage);
    return specializationMatch && availabilityMatch && languageMatch;
  }), [selectedSpecialization, showOnlyAvailable, selectedLanguage]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Counselor Directory</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find confidential, professional support for your well-being.</p>
        </div>

        {/* Upcoming Appointments (Advanced UI) */}
        <div className="mb-12 bg-white/80 backdrop-blur border border-indigo-100 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><UserCheck className="mr-2 text-indigo-600" size={24} />Your Upcoming Appointments</h3>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((app) => (
                <div key={app.id} className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between border border-indigo-100">
                    <div>
                        <p className="font-semibold text-indigo-900">{app.counselorName}</p>
                        <p className="text-sm text-gray-700">
                            {new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {app.time}
                        </p>
                    </div>
                    <button onClick={() => handleCancelAppointment(app.id)} className="text-xs px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">You have no upcoming appointments.</p>
          )}
        </div>

        {/* Emergency Helplines */}
        <div className="mb-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center"><Phone className="mr-2" size={20} />Emergency Helplines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {helplines.map((helpline, index) => (
              <div key={index} className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{helpline.name}</h4>
                <a href={`tel:${helpline.phone}`} className="text-red-600 font-bold text-lg hover:underline">{helpline.phone}</a>
                <p className="text-sm text-gray-600">{helpline.description}</p>
                <p className="text-xs text-gray-500">{helpline.availability}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Find the Right Support</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <select value={selectedSpecialization} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSpecialization(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {specializations.map(spec => (<option key={spec} value={spec}>{spec === 'all' ? 'All Specializations' : spec}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select value={selectedLanguage} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLanguage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="English">English</option>
                {allLanguages.filter(lang => lang !== 'English').map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                <option value="all">All Languages</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <input type="checkbox" id="available-only" checked={showOnlyAvailable} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowOnlyAvailable(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="available-only" className="text-sm text-gray-700">Show only available counselors</label>
            </div>
          </div>
        </div>

        {/* Counselors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCounselors.map(counselor => (
            <div key={counselor.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{counselor.name}</h3>
                    <p className="text-blue-600 font-medium">{counselor.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1"><Star className="text-yellow-400" size={16} fill="currentColor" /><span>{counselor.rating}</span></div>
                    <p className="text-xs text-gray-500">({counselor.reviewCount} reviews)</p>
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${counselor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{counselor.isAvailable ? 'Available' : 'Busy'}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {counselor.specialization.map(spec => (<span key={spec} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{spec}</span>))}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2"><MapPin size={16} /><span>{counselor.location}</span></div>
                  <div className="flex items-center space-x-2"><Clock size={16} /><span>{counselor.availableHours} ({counselor.availableDays.join(', ')})</span></div>
                  <div className="flex items-center space-x-2"><Languages size={16} /><span>{counselor.languages.join(', ')}</span></div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => handleBookAppointmentClick(counselor)} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center disabled:bg-gray-400" disabled={!counselor.isAvailable}><Calendar size={16} className="inline mr-2" />Book Session</button>
                  <a href={`mailto:${counselor.email}`} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"><Mail size={16} className="text-gray-600" /></a>
                  <a href={`tel:${counselor.phone}`} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"><Phone size={16} className="text-gray-600" /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCounselors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No counselors found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCounselor && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Book a Session</h3>
            <p className="text-gray-600 mb-6">with <span className="font-semibold">{selectedCounselor.name}</span></p>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                    <input 
                        type="date"
                        id="booking-date"
                        value={bookingDetails.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setBookingDetails({...bookingDetails, date: e.target.value});
                            setError('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
                 <div>
                    <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
                    <select
                        id="booking-time"
                        value={bookingDetails.time}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setBookingDetails({...bookingDetails, time: e.target.value});
                            setError('');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="" disabled>Select a time slot</option>
                        {generateTimeSlots(selectedCounselor.availableHours.split(' - ')[0], selectedCounselor.availableHours.split(' - ')[1]).map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
            <div className="mt-8">
              <button onClick={handleConfirmBooking} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CounselorDirectory;
