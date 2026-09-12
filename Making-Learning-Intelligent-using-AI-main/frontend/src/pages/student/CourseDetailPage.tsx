import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseApi, lessonApi, enrollmentApi } from '../../api/client';
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle2, 
  PlayCircle, Award, X, Sparkles 
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.id || 1;

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCourseData = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [cRes, lRes, eRes] = await Promise.all([
        courseApi.getCourse(Number(courseId)),
        lessonApi.getCourseLessons(Number(courseId), studentId),
        enrollmentApi.getStudentEnrollments(studentId),
      ]);
      setCourse(cRes.data);
      setLessons(lRes.data);
      const matched = eRes.data.find((e: any) => e.course_id === Number(courseId));
      setEnrollment(matched || null);
    } catch (err) {
      console.error('Error loading course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId, studentId]);

  const handleCompleteLesson = async (lessonId: number) => {
    try {
      setIsCompleting(true);
      await lessonApi.completeLesson(lessonId, studentId);
      await loadCourseData();
      setActiveLesson(null);
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Course not found.</p>
        <button onClick={() => navigate('/student/courses')} className="mt-4 text-xs font-bold text-indigo-600">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back button & Breadcrumb */}
      <button
        onClick={() => navigate('/student/courses')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Courses</span>
      </button>

      {/* Course Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 font-semibold">
                {course.subject || 'Computer Science'}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-300">{course.difficulty_level || 'Intermediate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{course.title}</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">{course.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center min-w-[140px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Course Progress</div>
            <div className="text-3xl font-extrabold text-white mt-1">{enrollment?.progress_percentage || 0}%</div>
            <div className="text-[10px] text-cyan-300 mt-0.5">
              {lessons.filter((l) => l.is_completed_by_current_student).length} of {lessons.length} Completed
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Lessons List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Curriculum Syllabus & Lessons</h2>
            <p className="text-xs text-slate-500">Click any unit to review materials and mark completed</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{lessons.length} Modules</span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isCompleted = lesson.is_completed_by_current_student;
            return (
              <div
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <span>{lesson.title}</span>
                      {lesson.topic && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {lesson.topic}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3 mt-0.5">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {lesson.duration_minutes} mins</span>
                      <span className="text-slate-400">&bull;</span>
                      <span>Order #{lesson.order}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {isCompleted ? 'Completed' : 'Open Lesson'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Topic: {activeLesson.topic || 'General'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{activeLesson.title}</h2>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap">
              {activeLesson.content || 'Content for this learning module is being prepared.'}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Estimated Duration: {activeLesson.duration_minutes} minutes</span>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveLesson(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => handleCompleteLesson(activeLesson.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleting ? 'Updating...' : 'Mark as Completed'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
