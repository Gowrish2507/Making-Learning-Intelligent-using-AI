import React, { useState, useEffect } from 'react';
import { assessmentApi, studentApi } from '../../api/client';
import { FileCheck, Search, Trash2, Edit, Check, X, RefreshCw } from 'lucide-react';

export const TeacherAssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Feedback editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, sRes] = await Promise.all([
        assessmentApi.getAssessments({ limit: 100 }),
        studentApi.getStudents(0, 100),
      ]);
      setAssessments(aRes.data);
      const sMap: Record<number, string> = {};
      sRes.data.forEach((s: any) => {
        sMap[s.id] = s.full_name;
      });
      setStudents(sMap);
    } catch (err) {
      console.error('Error fetching teacher assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateFeedback = async (id: number) => {
    try {
      await assessmentApi.updateAssessment(id, { feedback: feedbackText });
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this assessment submission?')) return;
    try {
      await assessmentApi.deleteAssessment(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting assessment:', err);
    }
  };

  const filtered = assessments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.topic && a.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (students[a.student_id] && students[a.student_id].toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-slate-900">Student Assessment Grading & Feedback</h1>
          <p className="text-sm text-slate-500">
            Review student submissions, deliver clinical feedback, and monitor score distributions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assessment or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Assessment Title</th>
                <th className="px-5 py-3">Topic</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Feedback</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {students[a.student_id] || `Student #${a.student_id}`}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800">{a.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {a.topic || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                      a.assessment_type === 'reassessment' ? 'bg-purple-100 text-purple-800' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {a.assessment_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-black text-sm ${
                      a.score < 50 ? 'text-rose-600' : (a.score < 75 ? 'text-amber-600' : 'text-emerald-600')
                    }`}>
                      {a.score}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    {editingId === a.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full p-1 border border-indigo-300 rounded text-xs"
                        />
                        <button
                          onClick={() => handleUpdateFeedback(a.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 line-clamp-1">{a.feedback || 'None'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => {
                        setEditingId(a.id);
                        setFeedbackText(a.feedback || '');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      title="Edit feedback"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
