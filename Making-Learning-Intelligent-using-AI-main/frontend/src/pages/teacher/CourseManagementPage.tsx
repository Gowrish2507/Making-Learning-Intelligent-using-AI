import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseApi, lessonApi } from '../../api/client';
import { 
  BookOpen, Plus, Edit2, Trash2, Layers, 
  Clock, PlusCircle, X, CheckCircle2, ChevronDown, ChevronRight 
} from 'lucide-react';

export const CourseManagementPage: React.FC = () => {
  const { user } = useAuth();
  const teacherId = user?.id || 1;

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isSaving, setIsSaving] = useState(false);

  // Lessons management under expanded course
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [duration, setDuration] = useState(20);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await courseApi.getCourses(0, 100);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setSubject('Computer Science');
    setDifficulty('Intermediate');
    setIsCourseModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description || '');
    setSubject(c.subject || 'Computer Science');
    setDifficulty(c.difficulty_level || 'Intermediate');
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, {
          title,
          description,
          subject,
          difficulty_level: difficulty,
        });
      } else {
        await courseApi.createCourse({
          teacher_id: teacherId,
          title,
          description,
          subject,
          difficulty_level: difficulty,
        });
      }
      setIsCourseModalOpen(false);
      await loadCourses();
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this course?')) return;
    try {
      await courseApi.deleteCourse(id);
      await loadCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const toggleExpandCourse = async (courseId: number) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      setCourseLessons([]);
    } else {
      setExpandedCourseId(courseId);
      try {
        const res = await lessonApi.getCourseLessons(courseId);
        setCourseLessons(res.data);
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedCourseId) return;
    try {
      await lessonApi.createLesson({
        course_id: expandedCourseId,
        title: lessonTitle,
        topic: lessonTopic,
        content: lessonContent,
        duration_minutes: duration,
        order: courseLessons.length + 1,
      });
      setIsLessonModalOpen(false);
      setLessonTitle('');
      setLessonTopic('');
      setLessonContent('');
      const res = await lessonApi.getCourseLessons(expandedCourseId);
      setCourseLessons(res.data);
    } catch (err) {
      console.error('Error creating lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Delete this lesson module?')) return;
    try {
      await lessonApi.deleteLesson(lessonId);
      if (expandedCourseId) {
        const res = await lessonApi.getCourseLessons(expandedCourseId);
        setCourseLessons(res.data);
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
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
          <h1 className="text-2xl font-bold text-slate-900">Course & Curriculum Management</h1>
          <p className="text-sm text-slate-500">
            Author courses, manage learning units, and organize pedagogical topic trees
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
            >
              <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">
                      {course.subject || 'CS'}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs text-slate-500">{course.difficulty_level || 'All Levels'}</span>
                    {!course.is_active && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{course.description}</p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => toggleExpandCourse(course.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center space-x-1"
                  >
                    <span>{isExpanded ? 'Hide Lessons' : 'Manage Lessons'}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Edit course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    title="Deactivate course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Lessons Subsection */}
              {isExpanded && (
                <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Syllabus Units ({courseLessons.length})
                    </h4>
                    <button
                      onClick={() => setIsLessonModalOpen(true)}
                      className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Lesson Module</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {courseLessons.map((l, lIdx) => (
                      <div
                        key={l.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[11px]">
                            {lIdx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{l.title}</span>
                            <span className="text-slate-400 ml-2">({l.topic || 'General'})</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-slate-500">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {l.duration_minutes}m</span>
                          <button
                            onClick={() => handleDeleteLesson(l.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {courseLessons.length === 0 && (
                      <p className="text-xs text-slate-400 italic py-2">No lessons created yet for this course.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Create / Edit Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Advanced Machine Learning"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Area</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Course summary and learning objectives..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Lesson Unit</h3>
              <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="e.g. Graph Traversal: BFS & DFS"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Concept Key</label>
                <input
                  type="text"
                  required
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="e.g. Graphs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content / Reading Materials</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  placeholder="Lesson instructions and technical concept explanation..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
