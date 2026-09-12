import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../api/client';
import { 
  BarChart2, TrendingUp, AlertTriangle, ShieldCheck, 
  Cpu, Layers, Sparkles 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';

export const PredictiveAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const teacherId = user?.id || 1;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getDashboard(teacherId);
        setStats(res.data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [teacherId]);

  const featureWeights = [
    { feature: 'Recent Score Delta (Trend)', importance: 35, category: 'Velocity' },
    { feature: 'Prerequisite Topic Mastery', importance: 30, category: 'Knowledge' },
    { feature: 'Repeated Failed Quizzes', importance: 20, category: 'Retention' },
    { feature: 'Overall Course Progress', importance: 15, category: 'Engagement' },
  ];

  const radarData = [
    { subject: 'Arrays', classProficiency: 58, target: 75 },
    { subject: 'Recursion', classProficiency: 52, target: 75 },
    { subject: 'Functions', classProficiency: 72, target: 75 },
    { subject: 'Loops', classProficiency: 81, target: 75 },
    { subject: 'Variables', classProficiency: 88, target: 75 },
    { subject: 'SQL Joins', classProficiency: 64, target: 75 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <Cpu className="w-4 h-4" />
          <span>Explainable ML Model Diagnostics</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Predictive Analytics & Model Architecture</h1>
        <p className="text-sm text-slate-500">
          LearnIQ Explainable Knowledge Tracing and Risk Prediction model transparency
        </p>
      </div>

      {/* Model Overview Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
              Architecture: Hybrid Explainable Heuristic &amp; Extensible ML Pipeline
            </span>
            <h2 className="text-xl font-bold text-white">Active Scoring Algorithm: Multi-Factor Weighted Tracing</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Computes student risk using weighted decay functions on assessment attempts, consecutive deficit penalties, and prerequisite dependency graphs. Architecture is prepared for XGBoost / Random Forest model weights.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 text-center min-w-[140px]">
            <div className="text-[10px] text-slate-300 uppercase font-semibold">Inference Latency</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">&lt; 15 ms</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Real-time SQLite DB</div>
          </div>
        </div>
      </div>

      {/* Feature Importance & Radar Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feature Importance */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Feature Importance Weights</h3>
            <p className="text-xs text-slate-500">How the Risk Engine determines student vulnerability scores</p>
          </div>

          <div className="space-y-3 pt-2">
            {featureWeights.map((f) => (
              <div key={f.feature} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">{f.feature}</span>
                  <span className="font-extrabold text-indigo-600">{f.importance}% weight</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${f.importance * 2.5}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Category: {f.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Topic Competency Radar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Classwide Topic Competency Radar</h3>
            <p className="text-xs text-slate-500">Cohort proficiency vs 75% institutional target benchmark</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Class Mean" dataKey="classProficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs font-semibold pt-2 border-t border-slate-100">
            <span className="text-indigo-600">&bull; Class Mean Proficiency</span>
            <span className="text-emerald-600">&bull; Target Benchmark (75%)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
