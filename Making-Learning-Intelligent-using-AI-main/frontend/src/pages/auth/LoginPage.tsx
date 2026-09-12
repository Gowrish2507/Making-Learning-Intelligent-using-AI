import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const [role, setRole] = useState<'student' | 'teacher' | 'mentor'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'teacher' || roleParam === 'mentor' || roleParam === 'student') {
      setRole(roleParam);
      if (roleParam === 'student') setEmail('arun@learniq.com');
      else if (roleParam === 'teacher') setEmail('sarah@learniq.com');
      else if (roleParam === 'mentor') setEmail('rahul.mentor@learniq.com');
    } else {
      setEmail('arun@learniq.com');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'mentor') navigate('/mentor/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password, role);
      // navigation handled by useEffect
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (presetRole: 'student' | 'teacher' | 'mentor', presetEmail: string) => {
    setRole(presetRole);
    setEmail(presetEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">LearnIQ</span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your learning portal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Predictive AI Learning Platform with Support Escalation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl sm:px-10 border border-slate-200">
          
          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            {(['student', 'teacher', 'mentor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r === 'student') setEmail('arun@learniq.com');
                  else if (r === 'teacher') setEmail('sarah@learniq.com');
                  else if (r === 'mentor') setEmail('rahul.mentor@learniq.com');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition ${
                  role === r
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'teacher' ? 'Faculty / Teacher' : (r === 'mentor' ? 'Peer Mentor' : 'Student')}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="name@learniq.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Hackathon Demo Quick Credential Prefill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Sign-In:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreset('student', 'arun@learniq.com')}
                className="p-2 text-left rounded-lg bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 transition"
              >
                <div className="font-bold">Arun (Student)</div>
                <div className="text-[10px] text-rose-600">High Risk (87%)</div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('student', 'priya@learniq.com')}
                className="p-2 text-left rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition"
              >
                <div className="font-bold">Priya (Student)</div>
                <div className="text-[10px] text-amber-600">Med Risk (58%)</div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('teacher', 'sarah@learniq.com')}
                className="p-2 text-left rounded-lg bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 transition"
              >
                <div className="font-bold">Dr. Sarah (Faculty)</div>
                <div className="text-[10px] text-purple-600">Teacher Lead</div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('mentor', 'rahul.mentor@learniq.com')}
                className="p-2 text-left rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition"
              >
                <div className="font-bold">Rahul (Mentor)</div>
                <div className="text-[10px] text-emerald-600">94% Effective</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register now
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
