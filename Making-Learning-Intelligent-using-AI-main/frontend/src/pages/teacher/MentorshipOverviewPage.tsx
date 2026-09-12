import React, { useState, useEffect } from 'react';
import { mentorApi } from '../../api/client';
import { Users, Award, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export const MentorshipOverviewPage: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await mentorApi.getMentors();
        setMentors(res.data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

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
        <h1 className="text-2xl font-bold text-slate-900">Peer & Expert Mentorship Roster</h1>
        <p className="text-sm text-slate-500">
          Supervise certified peer tutors, domain expertise specialties, weekly bandwidth, and student outcome ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((m) => {
          const skills = (m.expertise || '').split(',').map((s: string) => s.trim());
          return (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Mentor
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 flex items-center">
                    <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                    {m.effectiveness_score}% Rating
                  </span>
                </div>

                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-indigo-200 mb-2">
                    {m.full_name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{m.full_name}</h3>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Weekly Bandwidth:</span>
                    <strong className="text-slate-800">{m.availability_hours} hrs/wk</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Active Caseload:</span>
                    <strong className="text-indigo-600">{m.current_workload} student(s)</strong>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Domain Specialties:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                {m.bio || 'Available for algorithmic support.'}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
