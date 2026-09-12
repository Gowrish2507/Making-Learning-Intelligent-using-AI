import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { knowledgeApi } from '../../api/client';
import { 
  Sparkles, BookOpen, CheckCircle, ArrowRight, 
  HelpCircle, Lightbulb, Play, Layers 
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePracticeIndex, setActivePracticeIndex] = useState<number | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true);
        const res = await knowledgeApi.getRecommendations(studentId);
        setRec(res.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [studentId]);

  const handleCompletePractice = (index: number) => {
    setPracticeCompleted({ ...practiceCompleted, [index]: true });
    setActivePracticeIndex(null);
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
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Tier 1 Autonomous Remediation</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Personalized AI Learning Recommendations</h1>
        <p className="text-sm text-slate-500">
          Targeted learning paths synthesized from your diagnostic knowledge gaps and prerequisite dependencies
        </p>
      </div>

      {/* Hero Recommendation Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Primary Objective &bull; {rec?.topic}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {rec?.recommended_next}
            </h2>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-xs leading-relaxed text-indigo-100 flex items-start space-x-2.5">
              <Lightbulb className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white">Why Recommended: </strong>
                {rec?.explanation}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center shrink-0 min-w-[180px]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Difficulty Calibration</div>
            <div className="text-xl font-bold text-white mt-1">{rec?.difficulty_adjustment || 'Adaptive Pace'}</div>
            <div className="text-[10px] text-cyan-300 mt-1">Support Tier: {rec?.support_tier}</div>
          </div>
        </div>
      </div>

      {/* Practice Modules */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curated Practice Modules</h3>
            <p className="text-xs text-slate-500">Autonomous remediation modules customized for your learning style</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">3 Interactive Units</span>
        </div>

        <div className="space-y-3">
          {rec?.practice_resources?.map((res: any, idx: number) => {
            const isDone = practiceCompleted[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/50 border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDone ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{res.title}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="text-indigo-600 font-medium">{res.type}</span>
                      <span>&bull;</span>
                      <span>{res.duration}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => (isDone ? null : setActivePracticeIndex(idx))}
                  disabled={isDone}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  <span>{isDone ? 'Completed' : 'Start Practice'}</span>
                  {!isDone && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Practice Modal */}
      {activePracticeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600">Guided Interactive Drill</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {rec?.practice_resources[activePracticeIndex]?.title}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-2">
              <p>
                <strong>Concept Review:</strong> In this interactive practice session, we focus on breaking down {rec?.topic} concepts into digestible components.
              </p>
              <p>
                <em>Rule:</em> Verify boundary conditions, test edge cases with empty or singular elements, and observe how variable scoping maintains state stability across stack frames.
              </p>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePracticeIndex(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompletePractice(activePracticeIndex)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Practice Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
