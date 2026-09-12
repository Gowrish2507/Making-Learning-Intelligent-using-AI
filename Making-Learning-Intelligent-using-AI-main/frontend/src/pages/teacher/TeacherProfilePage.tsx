import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Award, BookOpen, ShieldCheck } from 'lucide-react';

export const TeacherProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Faculty Lead Profile</h1>
        <p className="text-sm text-slate-500">Instructor credentials, academic department, and assigned courses</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-purple-200">
            {user?.full_name?.charAt(0) || 'F'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mt-1">
              Faculty / Department Head
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Academic Department</div>
            <div className="font-bold text-slate-800 text-sm">{user?.department || 'Computer Science & Engineering'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Area of Specialization</div>
            <div className="font-bold text-slate-800 text-sm">{user?.specialization || 'Machine Learning & Data Structures'}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5 text-indigo-950">
          <div className="font-bold flex items-center">
            <ShieldCheck className="w-4 h-4 text-indigo-600 mr-1.5" />
            Administrative Authority
          </div>
          <p className="text-indigo-800/80 leading-relaxed">
            As a faculty educator on LearnIQ, you have authorization to review Tier 3 escalated students, author curriculum lessons, add official academic guidance notes, and issue closed-loop reassessments.
          </p>
        </div>
      </div>
    </div>
  );
};
