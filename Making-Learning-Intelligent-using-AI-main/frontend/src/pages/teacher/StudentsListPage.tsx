import React, { useState, useEffect } from 'react';
import { studentApi, knowledgeApi } from '../../api/client';
import { 
  Users, Search, ShieldAlert, Award, 
  ArrowRight, User, RefreshCw, X 
} from 'lucide-react';

export const StudentsListPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getStudents(0, 100);
      setStudents(res.data);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleInspect = async (student: any) => {
    setSelectedStudent(student);
    try {
      const pRes = await knowledgeApi.getProfile(student.id);
      setProfileData(pRes.data);
    } catch (err) {
      console.error('Error fetching knowledge profile:', err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900">Student Directory & Profiles</h1>
          <p className="text-sm text-slate-500">
            Inspect individual student knowledge trajectories, learning preferences, and current tiers
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Grade Level</th>
                <th className="px-5 py-3">Learning Style</th>
                <th className="px-5 py-3">Registered Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {s.full_name.charAt(0)}
                    </div>
                    <span>{s.full_name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3.5">{s.grade_level || 'General'}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {s.learning_style || 'Visual'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleInspect(s)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition inline-flex items-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Inspect Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Inspector Modal */}
      {selectedStudent && profileData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedStudent.full_name}</h2>
                <p className="text-xs text-slate-500">{selectedStudent.email} &bull; {selectedStudent.grade_level}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setProfileData(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-semibold">Overall Mastery</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{profileData.overall_mastery}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-semibold">Predicted Risk Level</div>
                <div className={`text-xl font-bold mt-1 ${profileData.risk_level === 'HIGH' ? 'text-rose-600' : (profileData.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600')}`}>
                  {profileData.risk_level} ({profileData.risk_score}%)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Topic Knowledge:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(profileData.topic_mastery || {}).map(([topic, score]: [string, any]) => (
                  <div key={topic} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span>{topic}</span>
                    <strong className={score < 60 ? 'text-rose-600' : 'text-emerald-600'}>{score}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setProfileData(null);
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
