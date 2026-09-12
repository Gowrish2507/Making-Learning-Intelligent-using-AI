import React, { useState, useEffect } from 'react';
import { interventionApi } from '../../api/client';
import { ShieldAlert, Users, Sparkles, CheckCircle2, Clock, Filter } from 'lucide-react';

export const InterventionsOverviewPage: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tierFilter, setTierFilter] = useState('ALL');

  useEffect(() => {
    const loadInterventions = async () => {
      try {
        setLoading(true);
        const res = await interventionApi.getHighRisk();
        setInterventions(res.data);
      } catch (err) {
        console.error('Error loading interventions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInterventions();
  }, []);

  const filtered = interventions.filter(
    (it) => tierFilter === 'ALL' || it.tier === tierFilter
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Interventions & Escalation Matrix</h1>
          <p className="text-sm text-slate-500">
            Lifecycle monitoring of student support across Tier 1 (AI), Tier 2 (Mentor), and Tier 3 (Faculty)
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Support Tiers</option>
            <option value="TIER_1_AI">Tier 1 &bull; AI Support</option>
            <option value="TIER_2_MENTOR">Tier 2 &bull; Peer Mentor</option>
            <option value="TIER_3_FACULTY">Tier 3 &bull; Faculty Lead</option>
          </select>
        </div>
      </div>

      {/* Interventions Grid */}
      <div className="space-y-3">
        {filtered.map((it) => (
          <div
            key={it.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                  it.tier === 'TIER_3_FACULTY'
                    ? 'bg-rose-100 text-rose-800'
                    : (it.tier === 'TIER_2_MENTOR' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')
                }`}>
                  {it.tier}
                </span>
                <span className="font-bold text-sm text-slate-900">{it.student_name}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600 font-medium">Topic: {it.topic}</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded uppercase font-extrabold text-[10px] ${
                it.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {it.status}
              </span>
            </div>

            <div className="text-slate-700 leading-relaxed">
              <strong>Trigger Rationale:</strong> {it.trigger_reason}
            </div>

            {it.faculty_notes && (
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-900">
                <strong>Faculty Clinical Notes:</strong> {it.faculty_notes}
              </div>
            )}

            {it.outcome && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                <span>Outcome: {it.outcome}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400 border-t border-slate-50">
              <span>Initiated: {new Date(it.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(it.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No interventions match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
