import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { knowledgeApi, assessmentApi, interventionApi, studentApi } from '../../api/client';
import { 
  User, Mail, GraduationCap, BrainCircuit, 
  AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert,
  Award, Clock, RefreshCw, Save
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [profile, setProfile] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Editable personal info
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || 'Year 2 - Semester 3');
  const [learningStyle, setLearningStyle] = useState(user?.learning_style || 'Visual / Practical');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [pRes, rRes, itRes, aRes] = await Promise.all([
        knowledgeApi.getProfile(studentId),
        knowledgeApi.getRisk(studentId),
        interventionApi.getStudentInterventions(studentId),
        assessmentApi.getAssessments({ student_id: studentId }),
      ]);
      setProfile(pRes.data);
      setRisk(rRes.data);
      setInterventions(itRes.data);
      setAssessments(aRes.data);
    } catch (err) {
      console.error('Error loading student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await studentApi.updateStudent(studentId, {
        full_name: fullName,
        grade_level: gradeLevel,
        learning_style: learningStyle,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating personal details:', err);
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student AI Knowledge Profile</h1>
          <p className="text-sm text-slate-500">
            Comprehensive diagnostic model tracing mastery, risk determinants, and intervention history
          </p>
        </div>
        <button
          onClick={loadProfile}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal & Academic */}
        <div className="space-y-6">
          
          {/* Personal Details Form */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <User className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdatePersonal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Grade / Semester</label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Visual / Conceptual">Visual / Conceptual</option>
                  <option value="Kinesthetic / Practical">Kinesthetic / Practical</option>
                  <option value="Logical / Analytical">Logical / Analytical</option>
                  <option value="Reading / Textual">Reading / Textual</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-2 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Details'}</span>
              </button>
            </form>
          </div>

          {/* Academic Overview Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Academic Trajectory</h2>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Overall Mastery:</span>
              <span className="font-bold text-slate-800">{profile?.overall_mastery}%</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Performance Trend:</span>
              <span className={`font-bold ${profile?.performance_trend === 'DECLINING' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {profile?.performance_trend}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Assessments Completed:</span>
              <span className="font-bold text-slate-800">{assessments.length}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Engagement Index:</span>
              <span className="font-bold text-slate-800">{profile?.engagement_score}%</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Consistency Score:</span>
              <span className="font-bold text-slate-800">{profile?.consistency_score}%</span>
            </div>
          </div>

        </div>

        {/* Center & Right Columns: AI Knowledge Profile, Risk & Interventions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Knowledge Profile Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">AI Knowledge & Mastery Engine</h2>
              </div>
              <span className="text-xs text-slate-400">
                Last calculated: {new Date(profile?.updated_at).toLocaleTimeString()}
              </span>
            </div>

            {/* Topic Mastery Grid */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Topic Knowledge Breakdown:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(profile?.topic_mastery || {}).map(([topic, score]: [string, any]) => (
                  <div key={topic} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{topic}</span>
                      <span className={`font-black ${score < 60 ? 'text-rose-600' : (score < 75 ? 'text-amber-600' : 'text-emerald-600')}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${score < 60 ? 'bg-rose-500' : (score < 75 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong & Weak Topic Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Strong Topics (&ge;75%)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.strong_topics?.length > 0 ? (
                    profile.strong_topics.map((t: string) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Developing strengths...</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Learning Gaps (&lt;60%)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.weak_topics?.length > 0 ? (
                    profile.weak_topics.map((t: string) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No critical learning deficits detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Profile & Explainable Reasons */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900">Risk Assessment & Explainability</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                risk?.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {risk?.risk_level} RISK &bull; {risk?.risk_score}%
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>AI Diagnostic Synthesis:</strong> {risk?.explanation}
            </p>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Explainable Reasons:</div>
              {risk?.reasons?.map((reason: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs text-rose-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Escalation History */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Support Escalation History</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Current Tier: <strong className="text-slate-800">{profile?.support_tier}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {interventions.length > 0 ? (
                interventions.map((it) => (
                  <div key={it.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-900 uppercase tracking-wider">{it.tier}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        it.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {it.status}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <strong>Trigger Reason:</strong> {it.trigger_reason}
                    </div>

                    {it.faculty_notes && (
                      <div className="text-purple-800 bg-purple-50 p-2 rounded border border-purple-100">
                        <strong>Faculty Note:</strong> {it.faculty_notes}
                      </div>
                    )}

                    {it.mentor_notes && (
                      <div className="text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                        <strong>Mentor Note:</strong> {it.mentor_notes}
                      </div>
                    )}

                    {it.outcome && (
                      <div className="font-bold text-emerald-700 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Outcome: {it.outcome}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No active escalation required &bull; Student performing within normal bounds.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
