import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, User, BookOpen, FileCheck, 
  Sparkles, Users, TrendingUp, AlertTriangle, 
  GraduationCap, ClipboardList, ShieldAlert,
  BarChart2, LogOut, CheckCircle2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/assessments', label: 'Assessments', icon: FileCheck },
    { to: '/student/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/student/mentor', label: 'My Mentor', icon: Users },
    { to: '/student/progress', label: 'Closed-Loop Progress', icon: TrendingUp },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'Student Directory', icon: GraduationCap },
    { to: '/teacher/risk-monitor', label: 'Risk Monitor & Faculty Queue', icon: AlertTriangle },
    { to: '/teacher/courses', label: 'Course Management', icon: BookOpen },
    { to: '/teacher/assessments', label: 'Assessments & Grading', icon: FileCheck },
    { to: '/teacher/mentorship', label: 'Mentorship Matching', icon: Users },
    { to: '/teacher/interventions', label: 'Interventions Overview', icon: ShieldAlert },
    { to: '/teacher/analytics', label: 'Predictive Analytics', icon: BarChart2 },
    { to: '/teacher/profile', label: 'Faculty Profile', icon: User },
  ];

  const mentorLinks = [
    { to: '/mentor/dashboard', label: 'Mentor Dashboard', icon: LayoutDashboard },
    { to: '/mentor/students', label: 'My Assigned Students', icon: Users },
    { to: '/mentor/interventions', label: 'Tier 2 Interventions', icon: ShieldAlert },
    { to: '/mentor/sessions', label: 'Session Logs', icon: ClipboardList },
    { to: '/mentor/profile', label: 'Mentor Profile', icon: User },
  ];

  const links = role === 'student' ? studentLinks : (role === 'teacher' ? teacherLinks : mentorLinks);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-6">
        
        {/* Role header info box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Current Portal</div>
          <div className="text-sm font-semibold text-slate-800 capitalize mt-0.5">
            {role === 'student' ? 'Student Workspace' : (role === 'teacher' ? 'Faculty Command Center' : 'Peer Mentor Portal')}
          </div>
          <div className="text-xs text-slate-500 truncate mt-1">{user?.full_name}</div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Support escalation model hint & Logout */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100 text-xs">
          <div className="font-semibold text-indigo-900 flex items-center mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mr-1.5" /> 3-Tier Escalation
          </div>
          <p className="text-indigo-700/80 text-[11px] leading-relaxed">
            AI Support &rarr; Mentor Match &rarr; Faculty Escalation
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
