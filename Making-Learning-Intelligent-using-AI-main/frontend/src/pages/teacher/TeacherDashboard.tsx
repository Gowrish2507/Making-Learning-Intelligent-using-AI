import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teacherApi, interventionApi } from '../../api/client';
import { 
  Users, AlertTriangle, ShieldAlert, Award, 
  BookOpen, TrendingUp, BarChart3, ArrowRight, 
  Activity, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const teacherId = user?.id || 1;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getDashboard(teacherId);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const riskPieData = stats?.risk_distribution || [
    { name: 'Low Risk', value: 3, color: '#10B981' },
    { name: 'Medium Risk', value: 1, color: '#F59E0B' },
    { name: 'High Risk', value: 1, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Faculty Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.full_name} &bull; Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Department: <span className="font-semibold text-white">{user?.department || 'Computer Science'}</span> &bull; Active Cohort: <span className="font-semibold text-white">{stats?.total_students} Students</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/teacher/risk-monitor"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>High-Risk Queue ({stats?.high_risk_count})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900">{stats?.total_students}</div>
            <p className="text-xs text-slate-500 mt-1">Active learners across all programs</p>
          </div>
          <Link to="/teacher/students" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
            <span>View Directory</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* Class Average Mastery */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Class Mean Mastery</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900">{stats?.average_class_mastery}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${stats?.average_class_mastery}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-slate-500">Target benchmark: 75%</span>
        </div>

        {/* High Risk Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>High Risk (Tier 3)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-rose-600">{stats?.high_risk_count}</div>
            <p className="text-xs text-slate-500 mt-1">Requiring immediate faculty intervention</p>
          </div>
          <Link to="/teacher/risk-monitor" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center">
            <span>Review Escalation</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* Medium Risk Mentorship */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Medium Risk (Tier 2)</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-600">{stats?.medium_risk_count}</div>
            <p className="text-xs text-slate-500 mt-1">Assigned or eligible for peer mentors</p>
          </div>
          <Link to="/teacher/mentorship" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center">
            <span>View Mentors</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

      </div>

      {/* Visual Charts: Risk Distribution & Topic Deficits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution Donut Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cohort Risk Distribution</h2>
              <p className="text-xs text-slate-500">Continuous AI risk tier stratification</p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs font-semibold pt-2 border-t border-slate-100">
            {riskPieData.map((item: any) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Weakness & Difficulty Index */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Classwide Learning Gaps</h2>
              <p className="text-xs text-slate-500">Topics with highest student failure/difficulty rates</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-60 w-full">
            {stats?.topic_weaknesses?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topic_weaknesses} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                  <YAxis unit=" std" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: any) => [`${val} students struggling`, 'Count']} />
                  <Bar dataKey="students_struggling" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No significant topic deficits recorded.
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Top bottleneck topic: <strong className="text-rose-600">{stats?.topic_weaknesses?.[0]?.topic || 'None'}</strong>
          </div>
        </div>

      </div>

      {/* High-Risk Student Attention Queue */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Students Requiring Immediate Intervention (Tier 3)</h2>
            <p className="text-xs text-slate-500">Critical risk score &ge; 70% with active pedagogical deficits</p>
          </div>
          <Link
            to="/teacher/risk-monitor"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <span>Open Escalation Console</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Risk Score</th>
                <th className="px-5 py-3">Overall Mastery</th>
                <th className="px-5 py-3">Critical Deficits</th>
                <th className="px-5 py-3 text-right">Escalation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.high_risk_students?.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{s.full_name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                      {s.risk_score}% HIGH
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{s.mastery}%</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {s.weak_topics?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to="/teacher/risk-monitor"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition inline-flex items-center space-x-1"
                    >
                      <span>Intervene</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
