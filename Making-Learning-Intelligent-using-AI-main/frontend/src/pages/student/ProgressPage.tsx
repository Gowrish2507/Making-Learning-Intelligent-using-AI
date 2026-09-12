import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { interventionApi, knowledgeApi } from '../../api/client';
import { 
  TrendingUp, CheckCircle2, AlertTriangle, ShieldAlert, 
  ArrowRight, Sparkles, RefreshCw, Layers, Award 
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [interventions, setInterventions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Reassessment modal state
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [reassessmentScore, setReassessmentScore] = useState<number>(85);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reassessmentResult, setReassessmentResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itRes, pRes] = await Promise.all([
        interventionApi.getStudentInterventions(studentId),
        knowledgeApi.getProfile(studentId),
      ]);
      setInterventions(itRes.data);
      setProfile(pRes.data);
    } catch (err) {
      console.error('Error fetching closed loop progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleConductReassessment = async () => {
    if (!selectedIntervention) return;
    try {
      setIsSubmitting(true);
      const res = await interventionApi.reassess(selectedIntervention.id, {
        intervention_id: selectedIntervention.id,
        topic: selectedIntervention.topic || 'Arrays',
        score: reassessmentScore,
        max_score: 100.0,
      });
      setReassessmentResult(res.data);
      setSelectedIntervention(null);
      await loadData();
    } catch (err) {
      console.error('Error submitting reassessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeIntervention = interventions.find((i) => i.status === 'active' || i.status === 'escalated');
  const resolvedInterventions = interventions.filter((i) => i.status === 'resolved' || i.outcome);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>The LearnIQ Feedback Loop</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Closed-Loop Reassessment & Progress</h1>
        <p className="text-sm text-slate-500">
          Verify measurable before/after outcomes following AI, Mentor, or Faculty intervention
        </p>
      </div>

      {/* The 7-Step LearnIQ Feedback Loop Diagram */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-4">
          Continuous Closed-Loop Process
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '1', title: 'OBSERVE', desc: 'Continuous testing' },
            { step: '2', title: 'UNDERSTAND', desc: 'Knowledge tracing' },
            { step: '3', title: 'PREDICT', desc: 'Risk calculation' },
            { step: '4', title: 'RECOMMEND', desc: 'Adaptive action' },
            { step: '5', title: 'INTERVENE', desc: '3-Tier human support' },
            { step: '6', title: 'REASSESS', desc: 'Diagnostic testing' },
            { step: '7', title: 'UPDATE', desc: 'Validated resolution' },
          ].map((item, idx) => (
            <div key={item.step} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="font-extrabold text-indigo-400 text-sm">{item.step}</div>
              <div className="font-bold text-white mt-0.5">{item.title}</div>
              <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reassessment Result Success Banner */}
      {reassessmentResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              {reassessmentResult.outcome}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Closed Loop Verified
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800">{reassessmentResult.message}</p>

          {/* Before vs After Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="text-slate-400 font-semibold">BEFORE Mastery</div>
              <div className="text-xl font-black text-rose-600 mt-1">{reassessmentResult.before_mastery}%</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="text-slate-400 font-semibold">AFTER Mastery</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{reassessmentResult.after_mastery}%</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="text-slate-400 font-semibold">BEFORE Risk</div>
              <div className="text-xl font-black text-rose-600 mt-1">{reassessmentResult.before_risk}%</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="text-slate-400 font-semibold">AFTER Risk</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{reassessmentResult.after_risk}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Escalation Requiring Reassessment */}
      {activeIntervention && (
        <div className="p-6 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {activeIntervention.tier} Active
                </span>
                <span className="text-xs text-slate-500">Target Deficit: <strong>{activeIntervention.topic}</strong></span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Remediation in Progress &bull; Pending Diagnostic Reassessment
              </h3>
              <p className="text-xs text-slate-600 mt-1">{activeIntervention.trigger_reason}</p>
            </div>

            <button
              onClick={() => setSelectedIntervention(activeIntervention)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition shrink-0 flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Take Post-Intervention Reassessment</span>
            </button>
          </div>

          {activeIntervention.faculty_notes && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
              <strong>Faculty Clinical Instructions:</strong> {activeIntervention.faculty_notes}
            </div>
          )}

          {activeIntervention.mentor_notes && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <strong>Mentor Session Instructions:</strong> {activeIntervention.mentor_notes}
            </div>
          )}
        </div>
      )}

      {/* Resolved Interventions / Past Closed-Loop Verifications */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Historical Closed-Loop Track Record</h2>

        <div className="space-y-4">
          {resolvedInterventions.length > 0 ? (
            resolvedInterventions.map((it) => (
              <div key={it.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 uppercase">{it.tier}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-600">{it.topic}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px] uppercase">
                    {it.outcome || 'Intervention Resolved'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400">Before Mastery</div>
                    <div className="font-bold text-rose-600">{it.before_mastery || 42}%</div>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400">After Mastery</div>
                    <div className="font-bold text-emerald-600">{it.after_mastery || 78}%</div>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400">Before Risk</div>
                    <div className="font-bold text-rose-600">{it.before_risk || 87}%</div>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400">After Risk</div>
                    <div className="font-bold text-emerald-600">{it.after_risk || 18}%</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              No historical interventions closed yet. Click 'Take Post-Intervention Reassessment' above to complete the loop!
            </div>
          )}
        </div>
      </div>

      {/* Reassessment Modal */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600">Closed-Loop Validation</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Reassessment on {selectedIntervention.topic || 'Target Deficit'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Demonstrate proficiency following your intervention session. The AI Engine will compare your Before vs After metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <label className="block font-bold text-slate-800">
                Evaluation Test Score: <span className="text-indigo-600 text-sm">{reassessmentScore}%</span>
              </label>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={reassessmentScore}
                onChange={(e) => setReassessmentScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30% (Critical)</span>
                <span>65% (Threshold)</span>
                <span>85% (Proficient)</span>
                <span>100% (Mastered)</span>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedIntervention(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConductReassessment}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center space-x-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{isSubmitting ? 'Evaluating Closed Loop...' : 'Submit Reassessment & Compare'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
