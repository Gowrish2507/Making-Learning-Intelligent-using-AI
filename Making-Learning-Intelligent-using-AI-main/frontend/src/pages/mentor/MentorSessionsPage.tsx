import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorApi } from '../../api/client';
import { ClipboardList, Clock, CheckCircle2, MessageSquare, BookOpen, Layers } from 'lucide-react';

export const MentorSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const mentorId = user?.id || 1;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const aRes = await mentorApi.getMentorAssignments(mentorId);
        setAssignments(aRes.data);

        const sessionPromises = aRes.data.map(async (a: any) => {
          try {
            const sRes = await mentorApi.getSessions(a.id);
            return sRes.data.map((s: any) => ({ ...s, student_name: a.student_name, topic: a.topic }));
          } catch {
            return [];
          }
        });

        const nested = await Promise.all(sessionPromises);
        setAllSessions(nested.flat());
      } catch (err) {
        console.error('Error loading mentor sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Mentorship Session Logs</h1>
        <p className="text-sm text-slate-500">Historical records of completed 1-on-1 tutoring sessions and student homework</p>
      </div>

      <div className="space-y-4">
        {allSessions.length > 0 ? (
          allSessions.map((s) => (
            <div key={s.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">{s.student_name}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600 font-medium">Topic: {s.topic}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded uppercase font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                  {s.status}
                </span>
              </div>

              {s.notes && (
                <div className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong>Notes:</strong> {s.notes}
                </div>
              )}

              {s.recommended_resources && (
                <div className="text-indigo-900 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                  <strong>Recommended Resources:</strong> {s.recommended_resources}
                </div>
              )}

              {s.action_items && (
                <div className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <strong>Action Items:</strong> {s.action_items}
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-1">
                Recorded on: {new Date(s.session_date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No session logs recorded yet. Use the Mentor Dashboard to log your first 1-on-1 session!
          </div>
        )}
      </div>
    </div>
  );
};
