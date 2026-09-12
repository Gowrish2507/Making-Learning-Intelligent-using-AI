import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assessmentApi, courseApi, knowledgeApi } from '../../api/client';
import { 
  FileCheck, Plus, Award, AlertCircle, 
  CheckCircle2, Clock, Trash2, Sparkles, X, ChevronRight 
} from 'lucide-react';

interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correct: number;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'Arrays',
    question: 'What is the time complexity of accessing an element in an array by its index in memory?',
    options: ['O(1) - Constant time', 'O(n) - Linear time', 'O(log n) - Logarithmic', 'O(n^2) - Quadratic'],
    correct: 0,
  },
  {
    id: 2,
    topic: 'Arrays',
    question: 'When resizing a dynamic array that exceeds capacity, what is the amortized cost per append operation?',
    options: ['O(n)', 'O(1) amortized', 'O(log n)', 'O(n log n)'],
    correct: 1,
  },
  {
    id: 3,
    topic: 'Recursion',
    question: 'What runtime error occurs if a recursive function does not define a correct base case?',
    options: ['SyntaxError', 'RecursionError: maximum recursion depth exceeded', 'TypeError', 'MemoryLeakException'],
    correct: 1,
  },
  {
    id: 4,
    topic: 'Functions',
    question: 'In Python, default parameter values are evaluated when:',
    options: ['Every time the function is called', 'At the point of function definition', 'Only when None is passed', 'During garbage collection'],
    correct: 1,
  },
  {
    id: 5,
    topic: 'Loops',
    question: 'Which statement terminates the current loop immediately and transfers execution to the statement following the loop?',
    options: ['continue', 'break', 'pass', 'return'],
    correct: 1,
  },
];

export const AssessmentsPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [assessments, setAssessments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Take Assessment Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState('Arrays');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultBanner, setResultBanner] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        assessmentApi.getAssessments({ student_id: studentId }),
        courseApi.getCourses(0, 100),
      ]);
      setAssessments(aRes.data);
      setCourses(cRes.data);
      if (cRes.data.length > 0) setSelectedCourseId(cRes.data[0].id);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const activeQuestions = SAMPLE_QUESTIONS.filter((q) => q.topic === selectedTopic);

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      // Calculate score based on answers
      let correctCount = 0;
      activeQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correct) {
          correctCount++;
        }
      });

      const total = activeQuestions.length || 1;
      const computedScore = Math.round((correctCount / total) * 100);

      const feedback =
        computedScore >= 80
          ? `Outstanding performance in ${selectedTopic}! Solid conceptual clarity.`
          : computedScore >= 60
          ? `Satisfactory effort in ${selectedTopic}. Review prerequisite materials to shore up gaps.`
          : `Deficit detected in ${selectedTopic}. Targeted AI practice and mentoring recommended.`;

      const res = await assessmentApi.createAssessment({
        student_id: studentId,
        course_id: selectedCourseId,
        title: `${selectedTopic} Diagnostic Evaluation`,
        assessment_type: 'quiz',
        topic: selectedTopic,
        score: computedScore,
        max_score: 100.0,
        feedback,
      });

      setResultBanner({
        score: computedScore,
        topic: selectedTopic,
        feedback,
      });

      setIsModalOpen(false);
      setSelectedAnswers({});
      await loadData();
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this assessment record?')) return;
    try {
      await assessmentApi.deleteAssessment(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting assessment:', err);
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
          <h1 className="text-2xl font-bold text-slate-900">Assessments & Diagnostics</h1>
          <p className="text-sm text-slate-500">
            Real-time performance tracking with instant Knowledge Engine profiling
          </p>
        </div>

        <button
          onClick={() => {
            setResultBanner(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Take Diagnostic Quiz</span>
        </button>
      </div>

      {/* Result feedback banner after submission */}
      {resultBanner && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 shadow-sm flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              {resultBanner.score}%
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900">Assessment Submitted: {resultBanner.topic}</h3>
                <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  AI Knowledge Updated
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{resultBanner.feedback}</p>
            </div>
          </div>
          <button
            onClick={() => setResultBanner(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Historical Submissions ({assessments.length})</h2>
          </div>
          <span className="text-xs text-slate-400">All submissions dynamically feed the risk predictor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Assessment Title</th>
                <th className="px-5 py-3">Topic</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Feedback & AI Evaluation</th>
                <th className="px-5 py-3">Completed Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3 font-bold text-slate-900">{a.title}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {a.topic || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                      a.assessment_type === 'reassessment'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {a.assessment_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-black text-sm ${
                      a.score < 50 ? 'text-rose-600' : (a.score < 75 ? 'text-amber-600' : 'text-emerald-600')
                    }`}>
                      {a.score}%
                    </span>
                  </td>
                  <td className="px-5 py-3 max-w-xs text-slate-500 line-clamp-1">{a.feedback || 'Evaluated'}</td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Take Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Diagnostic Knowledge Assessment</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Select your target topic. Results will instantly recalculate your knowledge profile and risk score.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Topic & Course selectors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setSelectedAnswers({});
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Arrays">Arrays</option>
                  <option value="Recursion">Recursion</option>
                  <option value="Functions">Functions</option>
                  <option value="Loops">Loops</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Course</label>
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Questions */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Questions ({activeQuestions.length}):
              </div>

              {activeQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800">
                    {qIndex + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5 pl-2">
                    {q.options.map((opt, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition ${
                          selectedAnswers[q.id] === optIndex
                            ? 'bg-indigo-100 text-indigo-900 font-semibold border border-indigo-300'
                            : 'hover:bg-white text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={selectedAnswers[q.id] === optIndex}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIndex })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
              >
                {submitting ? 'Grading & Recalculating AI Engine...' : 'Submit & Recalculate AI Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
