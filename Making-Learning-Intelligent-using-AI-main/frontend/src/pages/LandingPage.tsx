import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, ShieldAlert, Users, TrendingUp, 
  ArrowRight, CheckCircle2, Sparkles, AlertTriangle, 
  BookOpen, Layers, Award, Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { quickSwitchUser } = useAuth();

  const handleQuickDemo = async (role: 'arun' | 'teacher' | 'mentor') => {
    await quickSwitchUser(role);
    if (role === 'arun') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'mentor') navigate('/mentor/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              LearnIQ
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login?role=student')}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Student Portal
            </button>
            <button
              onClick={() => navigate('/login?role=teacher')}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Faculty Portal
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 bg-indigo-950/80 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 mb-8 backdrop-blur">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>IBM Hackathon Edition &bull; Predictive AI Learning Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Predict. Personalize. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Intervene. Improve.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation EdTech platform that continuously computes student knowledge graphs, predicts learning risk with explainable reasoning, and orchestrates intelligent 3-tier support escalation.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/login?role=student')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login?role=teacher')}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-7 py-3.5 rounded-xl border border-slate-700 transition transform hover:-translate-y-0.5"
            >
              <span>Faculty Login</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold px-7 py-3.5 rounded-xl border border-slate-700 transition transform hover:-translate-y-0.5"
            >
              <span>New Student / Teacher Register</span>
            </button>
          </div>

          {/* 1-Click Live Hackathon Demo Launch Bar */}
          <div className="mt-14 max-w-3xl mx-auto p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Instant Hackathon Demonstration Personas</span>
              </div>
              <span className="text-[11px] text-indigo-300 font-medium">Real Backend Data Ready</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <button
                onClick={() => handleQuickDemo('arun')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 transition group text-left"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
                  <span>Arun Kumar</span>
                  <span className="bg-rose-900/50 text-rose-300 text-[10px] px-1.5 py-0.5 rounded">High-Risk (87%)</span>
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Deficits in Arrays & Recursion &bull; Tier 3 Faculty Escalated
                </div>
              </button>

              <button
                onClick={() => handleQuickDemo('mentor')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 transition group text-left"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                  <span>Rahul Sharma</span>
                  <span className="bg-emerald-900/50 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded">Mentor (94% Eff.)</span>
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Data Structures Expert &bull; Tier 2 Caseload Manager
                </div>
              </button>

              <button
                onClick={() => handleQuickDemo('teacher')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500/50 transition group text-left"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-1">
                  <span>Dr. Sarah Chen</span>
                  <span className="bg-purple-900/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded">Faculty Lead</span>
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  Class Risk Analytics &bull; Intervention Orchestration
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Problem & Solution Grid */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">The EdTech Gap</h2>
            <p className="text-3xl font-bold text-white">Why Traditional Learning Systems Fail at Scale</p>
            <p className="text-slate-400 text-sm mt-3">
              Most platforms only report grades post-mortem. LearnIQ observes continuous interaction to intervene before students fail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40">
              <div className="flex items-center space-x-3 text-rose-400 font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span>The Status Quo: Late & Blind Interventions</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>Teachers discover learning failures only after final examinations when it is too late to remediate.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>Generic automated feedback offers static practice without addressing foundational prerequisite blockers.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>No feedback loop: tutors and teachers work in disconnected silos without measurable before/after tracking.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-800/40">
              <div className="flex items-center space-x-3 text-indigo-400 font-bold mb-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>The LearnIQ Innovation: Explainable Predictive Loop</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Predictive Knowledge Graph:</strong> Topic-level mastery tracing dynamically estimates learning risk.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Explainable AI:</strong> Transparent reasoning explains exactly <em>why</em> a student is struggling.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Closed-Loop Reassessment:</strong> Tracks student performance <em>Before vs After</em> every intervention.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Tier Support Escalation Architecture */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2">Core Philosophy</h2>
            <p className="text-3xl font-bold text-white">The Three-Tier Intelligent Support Escalation</p>
            <p className="text-slate-400 text-sm mt-3">
              Right-sized intervention at the exact right moment based on computed risk thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tier 1 */}
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 flex flex-col justify-between hover:border-blue-500/50 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-900/50 text-blue-400 flex items-center justify-center font-black text-lg mb-4 border border-blue-700/50">
                  T1
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Tier 1 &bull; Low Risk (&lt;40%)</div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Self Support</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Autonomous remediation via personalized step-by-step topic breakdowns, cognitive load adjustments, and targeted practice problems with explainable rationale.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-blue-300 font-semibold">
                &bull; Instant practice questions &bull; Zero delay
              </div>
            </div>

            {/* Tier 2 */}
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 flex flex-col justify-between hover:border-amber-500/50 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-900/50 text-amber-400 flex items-center justify-center font-black text-lg mb-4 border border-amber-700/50">
                  T2
                </div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Tier 2 &bull; Medium Risk (40% - 70%)</div>
                <h3 className="text-xl font-bold text-white mb-2">Intelligent Peer Mentor Match</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Algorithmic matching pairs the student with certified tutors based on exact topic deficits, weekly schedule availability, current caseload, and historical outcome scores.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-amber-300 font-semibold">
                &bull; 1-on-1 tutoring &bull; Actionable session logs
              </div>
            </div>

            {/* Tier 3 */}
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 flex flex-col justify-between hover:border-rose-500/50 transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-900/50 text-rose-400 flex items-center justify-center font-black text-lg mb-4 border border-rose-700/50">
                  T3
                </div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Tier 3 &bull; High Risk (&gt;70%)</div>
                <h3 className="text-xl font-bold text-white mb-2">Faculty Escalation & Closed Loop</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automatic alert triggers faculty intervention. Instructors view comprehensive diagnostic history, log pedagogical notes, and conduct post-intervention reassessment.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-rose-300 font-semibold">
                &bull; Before vs After metrics &bull; Loop resolution
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Closed-Loop Workflow */}
      <section className="py-16 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">The Closed-Loop Cycle</h2>
          <p className="text-3xl font-bold text-white mb-10">How LearnIQ Completes the Educational Feedback Loop</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { step: '01', title: 'OBSERVE', desc: 'Assessments & submissions' },
              { step: '02', title: 'UNDERSTAND', desc: 'Topic knowledge graph' },
              { step: '03', title: 'PREDICT', desc: 'Risk & failure score' },
              { step: '04', title: 'RECOMMEND', desc: 'Actionable practice' },
              { step: '05', title: 'INTERVENE', desc: '3-tier human escalation' },
              { step: '06', title: 'REASSESS', desc: 'Diagnostic testing' },
              { step: '07', title: 'UPDATE', desc: 'Closed loop verified' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-black text-indigo-400 mb-1">{item.step}</div>
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Launch LearnIQ Application Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>LearnIQ &bull; Developed for IBM Hackathon Presentation &bull; Full-Stack Predictive EdTech Solution</p>
      </footer>

    </div>
  );
};
