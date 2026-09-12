import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorApi, knowledgeApi, interventionApi } from '../../api/client';
import { 
  Users, Award, Clock, Star, MessageSquare, 
  AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Plus, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const mentorId = user?.id || 1;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Session logger modal
  const [loggingAssignment, setLoggingAssignment] = useState<any>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [resources, setResources] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty escalation modal
  const [escalatingAssignment, setEscalatingAssignment] = useState<any>(null);
  const [escalationReason, setEscalationReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await mentorApi.getMentorAssignments(mentorId);
      setAssignments(res.data);

      // Fetch knowledge profiles for assigned students
      const profilesMap: Record<number, any> = {};
      for (const a of res.data) {
        try {
          const pRes = await knowledgeApi.getProfile(a.student_id);
          profilesMap[a.student_id] = pRes.data;
        } catch (e) {
          console.warn(`Could not load profile for student ${a.student_id}`);
        }
      }
      setStudentProfiles(profilesMap);
    } catch (err) {
      console.error('Error fetching mentor assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mentorId]);

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingAssignment) return;
    try {
      setIsSubmitting(true);
      await mentorApi.createSession({
        assignment_id: loggingAssignment.id,
        notes: sessionNotes,
        recommended_resources: resources,
        action_items: actionItems,
      });
      setLoggingAssignment(null);
      setSessionNotes('');
      setResources('');
      setActionItems('');
      await loadData();
    } catch (err) {
      console.error('Error creating session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalateToFaculty = async () => {
    if (!escalatingAssignment) return;
    try {
      setIsSubmitting(true);
      await interventionApi.createIntervention({
        student_id: escalatingAssignment.student_id,
        course_id: escalatingAssignment.course_id,
        topic: escalatingAssignment.topic || 'Remediation',
        tier: 'TIER_3_FACULTY',
        trigger_reason: `Peer Mentor Escalation by ${user?.full_name}: ${escalationReason || 'Repeated concept deficit despite 1-on-1 tutoring.'}`,
        faculty_notes: `Escalated from Peer Mentor ${user?.full_name}. Reason: ${escalationReason}`,
      });
      await mentorApi.updateAssignmentStatus(escalatingAssignment.id, 'escalated');
      setEscalatingAssignment(null);
      setEscalationReason('');
      await loadData();
    } catch (err) {
      console.error('Error escalating to faculty:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">
              <Users className="w-4 h-4" />
              <span>Peer Mentorship Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Caseload: <strong className="text-white">{assignments.length} Assigned Student(s)</strong> &bull; Effectiveness Rating: <strong className="text-emerald-300">94%</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tier 2 Remediation Active
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Students Caseload */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Student Caseload</h2>
            <p className="text-xs text-slate-500">Review AI diagnostic briefings, log sessions, and trigger escalation</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{assignments.length} Active Pairings</span>
        </div>

        {assignments.map((asgn) => {
          const profile = studentProfiles[asgn.student_id];
          return (
            <div
              key={asgn.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                    {asgn.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{asgn.student_name}</h3>
                    <p className="text-xs text-slate-500">Target Deficit: <strong>{asgn.topic}</strong></p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {asgn.match_score}% Match
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    profile?.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {profile?.risk_level || 'MED'} Risk ({profile?.risk_score || 58}%)
                  </span>
                </div>
              </div>

              {/* AI Generated Student Briefing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-700 flex items-center space-x-1.5 uppercase text-[10px] tracking-wider">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Knowledge Engine Student Briefing:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Overall student mastery is currently at <strong>{profile?.overall_mastery || 45}%</strong> with a <strong>{profile?.performance_trend || 'DECLINING'}</strong> trajectory. Identified learning deficits:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile?.weak_topics?.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why Paired Accordion / Notice */}
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                <span className="font-bold">Pairing Rationale: </span>
                {asgn.match_reasons || 'Matched on topic mastery alignment.'}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Assigned: {new Date(asgn.created_at).toLocaleDateString()}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setLoggingAssignment(asgn)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Log 1-on-1 Session</span>
                  </button>

                  <button
                    onClick={() => setEscalatingAssignment(asgn)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition border border-rose-200 flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate to Faculty</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active student caseload currently assigned.
          </div>
        )}
      </div>

      {/* Log Session Modal */}
      {loggingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Log Mentorship Session: {loggingAssignment.student_name}
                </h3>
                <p className="text-xs text-slate-500">Topic: {loggingAssignment.topic}</p>
              </div>
              <button onClick={() => setLoggingAssignment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Diagnostic Notes</label>
                <textarea
                  rows={3}
                  required
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Summarize concepts reviewed, student sticking points, and progress made..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Learning Resources</label>
                <input
                  type="text"
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="e.g. Visualization Guide: Array Memory Layout; LeetCode 3 exercises"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Action Items</label>
                <input
                  type="text"
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  placeholder="e.g. Complete 5 pointer exercises before Thursday diagnostic quiz"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLoggingAssignment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Session Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalate to Faculty Modal */}
      {escalatingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-rose-600 flex items-center space-x-1.5">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Escalate to Tier 3 Faculty</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transfer {escalatingAssignment.student_name} to direct faculty instruction queue.
                </p>
              </div>
              <button onClick={() => setEscalatingAssignment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-2">
              <label className="block font-semibold">Escalation Rationale for Faculty:</label>
              <textarea
                rows={3}
                required
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Explain why peer mentorship was insufficient (e.g., student lacks core prerequisite logic)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setEscalatingAssignment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleEscalateToFaculty}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
              >
                {isSubmitting ? 'Escalating...' : 'Confirm Faculty Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
