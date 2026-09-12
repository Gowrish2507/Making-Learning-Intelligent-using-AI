import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  knowledgeApi, assessmentApi, enrollmentApi, mentorApi 
} from '../../api/client';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Sparkles, 
  BookOpen, Award, Users, ArrowRight, Activity, 
  Calendar, ShieldAlert, BarChart3, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [mentorAssignment, setMentorAssignment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const studentId = user?.id || 1;

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes, recRes, aRes, eRes, mRes] = await Promise.all([
        knowledgeApi.getProfile(studentId),
        knowledgeApi.getRisk(studentId),
        knowledgeApi.getRecommendations(studentId),
        assessmentApi.getAssessments({ student_id: studentId }),
        enrollmentApi.getStudentEnrollments(studentId),
        mentorApi.getStudentAssignments(studentId),
      ]);

      setProfile(pRes.data);
      setRisk(rRes.data);
      setRecommendation(recRes.data);
      setAssessments(aRes.data);
      setEnrollments(eRes.data);
      if (mRes.data && mRes.data.length > 0) {
        setMentorAssignment(mRes.data[0]);
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  const handleRecalculate = async () => {
    setRefreshing(true);
    await knowledgeApi.recalculate(studentId);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Computing AI Knowledge Profile & Risk...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data for topic mastery
  const topicData = profile?.topic_mastery
    ? Object.entries(profile.topic_mastery).map(([topic, score]) => ({
        topic,
        mastery: score as number,
      }))
    : [];

  // Prepare score trend chart
  const trendData = assessments.slice(-6).map((a, i) => ({
    name: a.topic || `Test ${i + 1}`,
    score: (a.score / (a.max_score || 100)) * 100,
  }));

  const getRiskColor = (level: string) => {
    if (level === 'HIGH') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (level === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'TIER_3_FACULTY') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Tier 3: Faculty Escalation
        </span>
      );
    }
    if (tier === 'TIER_2_MENTOR') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
          <Users className="w-3.5 h-3.5 mr-1" /> Tier 2: Mentor Intervention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
        <Sparkles className="w-3.5 h-3.5 mr-1" /> Tier 1: AI Self Support
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Student Dashboard</span>
              {getTierBadge(profile?.support_tier || 'TIER_1_AI')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Learning Profile: <span className="font-semibold text-white">{profile?.student_name || user?.full_name}</span> &bull; Style: <span className="font-semibold text-white">{user?.learning_style || 'Practical'}</span> &bull; {user?.grade_level || 'Year 2'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRecalculate}
              disabled={refreshing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/20 transition"
              title="Recalculate AI Knowledge Profile from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Recalculating...' : 'Sync AI Engine'}</span>
            </button>
            <button
              onClick={() => navigate('/student/assessments')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Predictive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Mastery */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Mastery</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900">{profile?.overall_mastery}%</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, profile?.overall_mastery || 0)}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Trend:{' '}
            <span className={`font-bold ${profile?.performance_trend === 'DECLINING' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {profile?.performance_trend}
            </span>
          </div>
        </div>

        {/* Predictive Risk Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Predicted Risk</span>
            <AlertTriangle className={`w-4 h-4 ${risk?.risk_level === 'HIGH' ? 'text-rose-600' : 'text-amber-500'}`} />
          </div>
          <div className="my-3">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{risk?.risk_score}%</span>
              <span className={`px-2 py-0.5 rounded text-xs font-extrabold uppercase border ${getRiskColor(risk?.risk_level)}`}>
                {risk?.risk_level} Risk
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  risk?.risk_level === 'HIGH' ? 'bg-rose-500' : (risk?.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500')
                }`}
                style={{ width: `${Math.min(100, risk?.risk_score || 0)}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-500 truncate">
            Support: <span className="font-semibold text-slate-800">{risk?.support_tier}</span>
          </div>
        </div>

        {/* Weak Learning Gaps */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Primary Deficit</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-3">
            <div className="text-xl font-bold text-slate-900 truncate">
              {profile?.weak_topics?.[0] || 'No critical gaps'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.weak_topics?.length || 0} topic(s) below 60% proficiency threshold
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile?.weak_topics?.map((t: string) => (
              <span key={t} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Peer Mentor */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Support Escalation</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="text-lg font-bold text-slate-900">
              {mentorAssignment ? mentorAssignment.mentor_name : (profile?.risk_level === 'LOW' ? 'Tier 1 Autonomous' : 'Matching Available')}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mentorAssignment ? `Assigned for ${mentorAssignment.topic}` : (profile?.risk_level === 'HIGH' ? 'Faculty Lead Review Required' : 'Self-guided practice active')}
            </p>
          </div>
          <Link
            to="/student/mentor"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <span>View Mentorship Portal</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

      </div>

      {/* Explainable AI Risk & Recommendations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Prediction Explainability Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${risk?.risk_level === 'HIGH' ? 'text-rose-600' : 'text-amber-500'}`} />
              <h2 className="text-base font-bold text-slate-900">Predictive Risk Explainability</h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${getRiskColor(risk?.risk_level)}`}>
              {risk?.risk_level} ({risk?.risk_score}%)
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4 italic leading-relaxed">
            "{risk?.explanation}"
          </p>

          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Identified Risk Factors:</div>
            {risk?.reasons?.map((reason: string, idx: number) => (
              <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Action:</span>
            <Link to="/student/progress" className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
              <span>View Closed-Loop Trajectory</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Personalized AI Recommendation Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">AI Personalized Recommendation</h2>
              </div>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                {recommendation?.difficulty_adjustment || 'Adaptive'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 mb-4">
              <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Recommended Next Step</div>
              <div className="text-sm font-bold text-indigo-950">
                {recommendation?.recommended_next}
              </div>
              <p className="text-xs text-indigo-800/80 mt-2 leading-relaxed">
                <span className="font-bold">Why:</span> {recommendation?.explanation}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Targeted Practice Module:</div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{recommendation?.recommended_resource}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">15 min</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Autonomous Tier 1 AI Support</span>
            <Link to="/student/recommendations" className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
              <span>Start Recommended Activity</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Visual Charts: Topic Mastery & Score Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Mastery Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Topic-by-Topic Mastery</h2>
              <p className="text-xs text-slate-500">Evaluated from weighted historical & recent assessments</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Mastery']} />
                <Bar dataKey="mastery" radius={[0, 8, 8, 0]}>
                  {topicData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.mastery < 60 ? '#ef4444' : (entry.mastery < 75 ? '#f59e0b' : '#10b981')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-center space-x-4 text-xs">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> &gt;=75% Mastered</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" /> 60-74% Developing</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" /> &lt;60% Critical Gap</span>
          </div>
        </div>

        {/* Score Trend Line Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Performance Trajectory</h2>
              <p className="text-xs text-slate-500">Historical assessment score trend</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [`${Math.round(value as number)}%`, 'Score']} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#4f46e5' }} 
                    activeDot={{ r: 7 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No assessments taken yet.
              </div>
            )}
          </div>

          <div className="mt-2 text-center text-xs text-slate-500">
            Current trajectory status: <strong className="text-slate-800">{profile?.performance_trend}</strong>
          </div>
        </div>

      </div>

      {/* Enrolled Courses & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Enrolled Courses */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">My Active Courses</h2>
            <Link to="/student/courses" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Browse All Courses
            </Link>
          </div>

          <div className="space-y-3">
            {enrollments.map((enr) => (
              <div 
                key={enr.id} 
                onClick={() => navigate(`/student/courses/${enr.course_id}`)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm text-slate-900">{enr.course_title || `Course #${enr.course_id}`}</div>
                  <span className="text-xs font-bold text-indigo-600">{enr.progress_percentage}%</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mb-2">{enr.course_description}</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all" 
                    style={{ width: `${enr.progress_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assessments Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Assessments</h2>
            <Link to="/student/assessments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Full History
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {assessments.slice(0, 4).map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{a.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Topic: <span className="font-medium text-slate-600">{a.topic || 'General'}</span> &bull; {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${a.score < 50 ? 'text-rose-600' : (a.score < 75 ? 'text-amber-600' : 'text-emerald-600')}`}>
                    {a.score} / {a.max_score}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{a.assessment_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
