import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorApi, knowledgeApi } from '../../api/client';
import { Users, Award, AlertTriangle, ArrowRight, BookOpen, Clock } from 'lucide-react';

export const MentorStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const mentorId = user?.id || 1;

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const res = await mentorApi.getMentorAssignments(mentorId);
        setAssignments(res.data);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
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
        <h1 className="text-2xl font-bold text-slate-900">Assigned Student Roster</h1>
        <p className="text-sm text-slate-500">Supervise students under your direct Tier 2 peer tutoring guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((asgn) => (
          <div key={asgn.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {asgn.student_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{asgn.student_name}</h3>
                  <p className="text-xs text-slate-500">Student ID #{asgn.student_id}</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700">
                {asgn.match_score}% Match
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="text-slate-500 font-semibold">Remediation Objective:</div>
              <div className="font-bold text-slate-800 text-sm">{asgn.topic}</div>
              <div className="text-[11px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                {asgn.match_reasons}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Status: <strong className="text-emerald-600 capitalize">{asgn.status}</strong></span>
              <span>Paired on {new Date(asgn.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
