import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Users, Calendar, Star, CheckCircle, MessageSquare, Plus } from 'lucide-react';

export const Mentorship = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const mentors = [
    {
      id: 'm1',
      name: 'Dr. Robert Vance',
      title: 'Staff Cloud Architect',
      department: 'Cloud Infrastructure',
      expertise: ['Distributed Systems', 'Kubernetes', 'Cloud Security'],
      rating: 4.9,
      sessionsCount: 48,
      availability: '2 slots open this week',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'm2',
      name: 'Amara Nwosu',
      title: 'Principal UI/UX Architect',
      department: 'UX & Product Design',
      expertise: ['Design Systems', 'Frontend Performance', 'React 19'],
      rating: 5.0,
      sessionsCount: 32,
      availability: '1 slot open next week',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            1-on-1 Mentorship Program
          </h1>
          <p className="text-xs text-slate-500">
            Connect with senior engineering leaders to accelerate career progression and overcome technical hurdles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentors.map((m) => (
          <Card key={m.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{m.title}</p>
                  <p className="text-[11px] text-slate-400">{m.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  {m.rating}
                </span>
                <span>• {m.sessionsCount} Sessions Conducted</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.expertise.map((exp, i) => (
                  <Badge key={i} variant="neutral" className="text-[10px]">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {m.availability}
              </span>
              <button
                onClick={() => {
                  setSelectedMentor(m);
                  setBookingModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
              >
                Schedule Session
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Session with ${selectedMentor?.name || 'Mentor'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select a convenient 45-minute timeslot to review your gap analysis and receive strategic career guidance.
          </p>
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">Select Date & Slot:</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
              <option>Thursday, Aug 6 at 2:00 PM - 2:45 PM EST</option>
              <option>Friday, Aug 7 at 10:00 AM - 10:45 AM EST</option>
              <option>Monday, Aug 10 at 4:00 PM - 4:45 PM EST</option>
            </select>
          </div>
          <button
            onClick={() => {
              alert(`Session booked successfully with ${selectedMentor?.name}`);
              setBookingModalOpen(false);
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            Confirm Mentorship Booking
          </button>
        </div>
      </Modal>
    </div>
  );
};
