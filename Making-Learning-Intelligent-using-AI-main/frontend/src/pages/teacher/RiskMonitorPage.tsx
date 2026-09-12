import React, { useState, useEffect } from 'react';
import { interventionApi, studentApi, knowledgeApi } from '../../api/client';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  ArrowRight, User, Clock, FileText, Award, RefreshCw, X 
} from 'lucide-react';

export const RiskMonitorPage: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Faculty Note / Action Modal state
  const [activeIntervention, setActiveIntervention] = useState<any>(null);
  const [facultyNote, setFacultyNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Student Profile Inspector Modal
  const [inspectingStudent, setInspectingStudent] = useState<any>(null);
  const [inspectingProfile, setInspectingProfile] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await interventionApi.getHighRisk();
      setInterventions(res.data);
    } catch (err) {
      console.error('Error fetching high risk interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspectStudent = async (studentId: number) => {
    try {
      const [sRes, pRes] = await Promise.all([
        studentApi.getStudent(studentId),
        knowledgeApi.getProfile(studentId),
      ]);
      setInspectingStudent(sRes.data);
      setInspectingProfile(pRes.data);
    } catch (err) {
      console.error('Error inspecting student:', err);
    }
  };

  const handleSaveFacultyNote = async (id: number) => {
    try {
      setIsUpdating(true);
      await interventionApi.updateIntervention(id, {
        faculty_notes: facultyNote,
      });
      await loadData();
      setActiveIntervention(null);
      setFacultyNote('');
    } catch (err) {
      console.error('Error saving faculty note:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveIntervention = async (id: number) => {
    try {
      await interventionApi.updateIntervention(id, {
        status: 'resolved',
        outcome: 'Faculty Review Completed - Student Advised',
      });
      await loadData();
    } catch (err) {
      console.error('Error resolving intervention:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Tier 3 Escalation Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Intervention & Risk Monitor</h1>
          <p className="text-sm text-slate-500">
            Active high-risk learners requiring direct instructional review, remediation plans, and reassessment
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* High-Risk Students List */}
      <div className="space-y-4">
        {interventions.length > 0 ? (
          interventions.map((it) => (
            <div
              key={it.id}
              className="p-6 rounded-2xl bg-white border-2 border-rose-200 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-base">
                    {it.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{it.student_name}</h2>
                    <span className="text-xs text-slate-500">Student ID #{it.student_id}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                    High Risk &bull; {it.before_risk || 87}%
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">
                    {it.tier}
                  </span>
                </div>
              </div>

              {/* Diagnostic Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 font-semibold">Baseline Mastery</div>
                  <div className="text-xl font-black text-rose-600 mt-1">{it.before_mastery || 32}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 font-semibold">Target Deficit Topic</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{it.topic || 'Data Structures'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 font-semibold">Intervention Escalation</div>
                  <div className="text-xs font-bold text-indigo-700 mt-1">Tier 1 &rarr; Tier 2 &rarr; Tier 3 Faculty</div>
                </div>
              </div>

              {/* Trigger Reason */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
                <strong>Escalation Trigger:</strong> {it.trigger_reason}
              </div>

              {/* Notes & Actions */}
              {it.faculty_notes && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                  <strong>Faculty Notes on File:</strong> {it.faculty_notes}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleInspectStudent(it.student_id)}
                  className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Inspect Diagnostic Profile</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveIntervention(it);
                      setFacultyNote(it.faculty_notes || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition"
                  >
                    Add / Edit Faculty Note
                  </button>
                  <button
                    onClick={() => handleResolveIntervention(it.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">Escalation Queue Clear</h3>
            <p className="text-xs text-slate-400 mt-1">No active Tier 3 high-risk student escalations pending.</p>
          </div>
        )}
      </div>

      {/* Edit Faculty Note Modal */}
      {activeIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Faculty Intervention Notes: {activeIntervention.student_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Topic: {activeIntervention.topic}</p>
              </div>
              <button
                onClick={() => setActiveIntervention(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Instructional Remediation Plan / Notes:
              </label>
              <textarea
                rows={4}
                value={facultyNote}
                onChange={(e) => setFacultyNote(e.target.value)}
                placeholder="Detail 1-on-1 tutoring instructions, targeted review topics, and conditions for diagnostic reassessment..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveIntervention(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSaveFacultyNote(activeIntervention.id)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                {isUpdating ? 'Saving...' : 'Save Faculty Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Profile Inspector Modal */}
      {inspectingStudent && inspectingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600">Student Knowledge Diagnostic</span>
                <h3 className="text-lg font-bold text-slate-900">{inspectingStudent.full_name}</h3>
                <p className="text-xs text-slate-500">{inspectingStudent.email} &bull; {inspectingStudent.grade_level}</p>
              </div>
              <button
                onClick={() => {
                  setInspectingStudent(null);
                  setInspectingProfile(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-semibold">Calculated Risk Score</div>
                <div className="text-xl font-black text-rose-600 mt-1">{inspectingProfile.risk_score}% ({inspectingProfile.risk_level})</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-semibold">Overall Mastery</div>
                <div className="text-xl font-black text-slate-900 mt-1">{inspectingProfile.overall_mastery}%</div>
              </div>
            </div>

            {/* Risk Reasons */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-900">Predictive Risk Reasons:</div>
              {inspectingProfile.risk_reasons?.map((r: string, idx: number) => (
                <div key={idx} className="text-rose-800 leading-relaxed">&bull; {r}</div>
              ))}
            </div>

            {/* Topic Mastery */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Topic Mastery:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(inspectingProfile.topic_mastery || {}).map(([topic, score]: [string, any]) => (
                  <div key={topic} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-700">{topic}</span>
                    <span className={`font-bold ${score < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>{score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setInspectingStudent(null);
                  setInspectingProfile(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
