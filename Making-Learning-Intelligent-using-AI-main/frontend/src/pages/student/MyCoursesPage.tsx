import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseApi, enrollmentApi } from '../../api/client';
import { BookOpen, CheckCircle, ArrowRight, PlusCircle, Search, Layers } from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, eRes] = await Promise.all([
        courseApi.getCourses(0, 100),
        enrollmentApi.getStudentEnrollments(studentId),
      ]);
      setAllCourses(cRes.data);
      setEnrollments(eRes.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingId(courseId);
      await enrollmentApi.enroll({ student_id: studentId, course_id: courseId });
      await loadData();
    } catch (err) {
      console.error('Error enrolling:', err);
    } finally {
      setEnrollingId(null);
    }
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const filteredCourses = allCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-slate-900">Course Catalog & Enrolled Curriculum</h1>
          <p className="text-sm text-slate-500">
            Interactive courses with sequential lesson tracking and progress benchmarks
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 text-indigo-600 mr-1.5" /> My Active Enrollments ({enrollments.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((enr) => {
            const course = allCourses.find((c) => c.id === enr.course_id);
            return (
              <div
                key={enr.id}
                onClick={() => navigate(`/student/courses/${enr.course_id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {course?.subject || 'Computer Science'}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600">{enr.progress_percentage}%</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">{enr.course_title || course?.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {enr.course_description || course?.description}
                  </p>
                </div>

                <div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${enr.progress_percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-600">
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore More Courses */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
          <Layers className="w-4 h-4 text-slate-400 mr-1.5" /> Available Course Offerings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses
            .filter((c) => !enrolledCourseIds.has(c.id))
            .map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {course.subject || 'General'}
                    </span>
                    <span className="text-xs text-slate-400">{course.difficulty_level || 'All Levels'}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{enrollingId === course.id ? 'Enrolling...' : 'Enroll in Course'}</span>
                </button>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
