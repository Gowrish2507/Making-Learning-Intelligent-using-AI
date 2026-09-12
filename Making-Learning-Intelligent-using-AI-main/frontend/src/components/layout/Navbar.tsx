import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BrainCircuit, LogOut, User as UserIcon, 
  Sparkles, ShieldAlert, Users, GraduationCap, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitchUser } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'student':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Student
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Faculty / Teacher
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Users className="w-3.5 h-3.5 mr-1" /> Peer Mentor
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Motto */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">
                  LearnIQ
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-indigo-200">
                  AI Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Predict. Personalize. Intervene. Improve.
              </p>
            </div>
          </div>

          {/* Quick Demo Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            
            {/* 1-Click Persona Switcher for Hackathon Judges */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 font-medium flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> Demo Switch:
              </span>
              <button
                onClick={() => quickSwitchUser('arun')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  user?.email === 'arun@learniq.com' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="High-Risk Student (87% Risk - Arrays & Recursion)"
              >
                Arun (High-Risk)
              </button>
              <button
                onClick={() => quickSwitchUser('priya')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  user?.email === 'priya@learniq.com' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Medium-Risk Student (58% Risk - Functions)"
              >
                Priya (Med-Risk)
              </button>
              <button
                onClick={() => quickSwitchUser('mentor')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  user?.role === 'mentor' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Peer Mentor Rahul Sharma"
              >
                Mentor
              </button>
              <button
                onClick={() => quickSwitchUser('teacher')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  user?.role === 'teacher' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Faculty Dr. Sarah Chen"
              >
                Faculty
              </button>
            </div>

            {/* Current Role Badge */}
            <div className="hidden sm:block">
              {getRoleBadge()}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center pl-2 space-x-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">{user?.full_name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
