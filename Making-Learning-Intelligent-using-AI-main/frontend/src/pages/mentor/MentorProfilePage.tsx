import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Award, Clock, Star, Users } from 'lucide-react';

export const MentorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const skills = (user?.expertise || 'Python, Data Structures, Algorithms').split(',').map((s: string) => s.trim());

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Peer Mentor Profile</h1>
        <p className="text-sm text-slate-500">Tutor credentials, tutoring domain specialties, and availability bandwidth</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-200">
            {user?.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
              Tier 2 Certified Peer Mentor
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Weekly Availability</div>
            <div className="font-bold text-slate-800 text-sm">14.0 hrs / week</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Student Outcome Rating</div>
            <div className="font-bold text-emerald-600 text-sm flex items-center">
              <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
              94.0% Effectiveness
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Active Caseload</div>
            <div className="font-bold text-indigo-600 text-sm">1 Student</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Verified Domain Expertise:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
