import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorApi } from '../../api/client';
import { 
  Users, CheckCircle2, Clock, Award, 
  MessageSquare, BookOpen, Star, AlertCircle, Sparkles, UserPlus 
} from 'lucide-react';

export const MyMentorPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [assignment, setAssignment] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        mentorApi.getStudentAssignments(studentId),
        mentorApi.getMatches(studentId),
      ]);

      if (aRes.data && aRes.data.length > 0) {
        setAssignment(aRes.data[0]);
        const sRes = await mentorApi.getSessions(aRes.data[0].id);
        setSessions(sRes.data);
      } else {
        setAssignment(null);
        setSessions([]);
      }
      setCandidates(cRes.data);
    } catch (err) {
      console.error('Error loading mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleRequestMentor = async (mentorId: number, topic: string) => {
    try {
      setAssigningId(mentorId);
      await mentorApi.assignMentor({
        student_id: studentId,
        mentor_id: mentorId,
        topic: topic || 'Core Data Structures',
      });
      await loadData();
    } catch (err) {
      console.error('Error requesting mentor:', err);
    } finally {
      setAssigningId(null);
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
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
          <Users className="w-4 h-4" />
          <span>Tier 2 Peer Support Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Intelligent Mentorship Matching</h1>
        <p className="text-sm text-slate-500">
          Personalized 1-on-1 peer tutoring paired through algorithmic domain matching
        </p>
      </div>

      {assignment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mentor Profile Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Mentor Assigned
              </span>
              <span className="text-xs font-extrabold text-indigo-600">
                {assignment.match_score}% Match
              </span>
            </div>

            <div className="text-center py-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-indigo-200 mb-3">
                {assignment.mentor_name?.charAt(0) || 'M'}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{assignment.mentor_name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assigned Target Topic: <strong>{assignment.topic}</strong></p>
            </div>

            {/* Why Matched Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> Why Matched with {assignment.mentor_name}:
              </div>
              <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                {assignment.match_reasons || 'Selected for outstanding domain expertise in your gap areas.'}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Assignment Status:</span>
                <span className="font-bold text-emerald-600 capitalize">{assignment.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Assigned Date:</span>
                <span className="font-medium text-slate-800">{new Date(assignment.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Session History & Action Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">1-on-1 Mentorship Logs & Action Items</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">{sessions.length} Completed Session(s)</span>
              </div>

              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-800 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Session Date: {new Date(sess.session_date).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                          {sess.status}
                        </span>
                      </div>

                      {sess.notes && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Mentor Clinical Notes:</span>
                          <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                            {sess.notes}
                          </p>
                        </div>
                      )}

                      {sess.recommended_resources && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Recommended Resources:</span>
                          <p className="text-indigo-800 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                            {sess.recommended_resources}
                          </p>
                        </div>
                      )}

                      {sess.action_items && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Student Action Items:</span>
                          <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            {sess.action_items}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Mentor assigned. Pending initial 1-on-1 tutoring session logging.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Tier 2 Matching Available:</strong> Based on your computed knowledge profile, the following peer mentors have high topic alignment and immediate availability to assist your remediation.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => (
              <div key={cand.mentor_id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {cand.match_score}% Match
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">{cand.effectiveness_score}% Rating</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{cand.mentor_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Available: {cand.availability_hours} hrs/week</p>

                  <div className="space-y-1 mt-3 text-xs text-slate-600">
                    <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Expertise:</div>
                    <div className="flex flex-wrap gap-1">
                      {cand.expertise.map((exp: string) => (
                        <span key={exp} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-700">Why Matched:</div>
                    {cand.match_reasons.map((r: string, i: number) => (
                      <div key={i} className="text-slate-600 flex items-start space-x-1">
                        <span className="text-emerald-500 font-bold">&check;</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRequestMentor(cand.mentor_id, cand.expertise[0] || 'Remediation')}
                  disabled={assigningId === cand.mentor_id}
                  className="w-full mt-4 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{assigningId === cand.mentor_id ? 'Assigning...' : 'Request Mentorship'}</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
