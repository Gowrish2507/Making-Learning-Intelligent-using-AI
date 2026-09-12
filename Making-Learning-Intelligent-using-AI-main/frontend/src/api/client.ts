import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learniq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear expired auth session
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname === '/';
      if (!isAuthRoute) {
        localStorage.removeItem('learniq_token');
        localStorage.removeItem('learniq_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// Typed API Endpoints
// ----------------------------------------------------------------------

// 1. Authentication
export const authApi = {
  login: (data: { email: string; password: string; role?: string }) =>
    apiClient.post('/auth/login', data),
  registerStudent: (data: any) =>
    apiClient.post('/auth/register/student', data),
  registerTeacher: (data: any) =>
    apiClient.post('/auth/register/teacher', data),
  registerMentor: (data: any) =>
    apiClient.post('/auth/register/mentor', data),
  getMe: () =>
    apiClient.get('/auth/me'),
};

// 2. AI Knowledge Engine & Risk
export const knowledgeApi = {
  getProfile: (studentId: number) =>
    apiClient.get(`/students/${studentId}/knowledge-profile`),
  getRisk: (studentId: number) =>
    apiClient.get(`/students/${studentId}/risk`),
  getRecommendations: (studentId: number) =>
    apiClient.get(`/students/${studentId}/recommendations`),
  recalculate: (studentId: number) =>
    apiClient.post(`/students/${studentId}/recalculate`),
};

// 3. Students
export const studentApi = {
  getStudents: (skip = 0, limit = 50) =>
    apiClient.get('/students/', { params: { skip, limit } }),
  getStudent: (studentId: number) =>
    apiClient.get(`/students/${studentId}`),
  updateStudent: (studentId: number, data: any) =>
    apiClient.put(`/students/${studentId}`, data),
};

// 4. Courses
export const courseApi = {
  getCourses: (skip = 0, limit = 50) =>
    apiClient.get('/courses/', { params: { skip, limit } }),
  getCourse: (courseId: number) =>
    apiClient.get(`/courses/${courseId}`),
  createCourse: (data: any) =>
    apiClient.post('/courses/', data),
  updateCourse: (courseId: number, data: any) =>
    apiClient.put(`/courses/${courseId}`, data),
  deleteCourse: (courseId: number) =>
    apiClient.delete(`/courses/${courseId}`),
};

// 5. Lessons
export const lessonApi = {
  getCourseLessons: (courseId: number, studentId?: number) =>
    apiClient.get(`/lessons/course/${courseId}`, { params: { student_id: studentId } }),
  getLesson: (lessonId: number) =>
    apiClient.get(`/lessons/${lessonId}`),
  createLesson: (data: any) =>
    apiClient.post('/lessons/', data),
  updateLesson: (lessonId: number, data: any) =>
    apiClient.put(`/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: number) =>
    apiClient.delete(`/lessons/${lessonId}`),
  completeLesson: (lessonId: number, studentId: number) =>
    apiClient.post(`/lessons/${lessonId}/complete`, null, { params: { student_id: studentId } }),
};

// 6. Enrollments
export const enrollmentApi = {
  enroll: (data: { student_id: number; course_id: number }) =>
    apiClient.post('/enrollments/', data),
  getStudentEnrollments: (studentId: number) =>
    apiClient.get(`/enrollments/student/${studentId}`),
  getCourseEnrollments: (courseId: number) =>
    apiClient.get(`/enrollments/course/${courseId}`),
  updateEnrollment: (enrollmentId: number, data: any) =>
    apiClient.put(`/enrollments/${enrollmentId}`, data),
};

// 7. Assessments
export const assessmentApi = {
  getAssessments: (params?: { student_id?: number; course_id?: number; skip?: number; limit?: number }) =>
    apiClient.get('/assessments/', { params }),
  getAssessment: (assessmentId: number) =>
    apiClient.get(`/assessments/${assessmentId}`),
  createAssessment: (data: any) =>
    apiClient.post('/assessments/', data),
  updateAssessment: (assessmentId: number, data: any) =>
    apiClient.put(`/assessments/${assessmentId}`, data),
  deleteAssessment: (assessmentId: number) =>
    apiClient.delete(`/assessments/${assessmentId}`),
};

// 8. Mentors & Matching
export const mentorApi = {
  getMentors: () =>
    apiClient.get('/mentors/'),
  getMentor: (mentorId: number) =>
    apiClient.get(`/mentors/${mentorId}`),
  getMatches: (studentId: number) =>
    apiClient.get(`/mentors/match/${studentId}`),
  assignMentor: (data: { student_id: number; mentor_id: number; course_id?: number; topic?: string }) =>
    apiClient.post('/mentorship/assign', data),
  getMentorAssignments: (mentorId: number) =>
    apiClient.get(`/mentorship/assignments/mentor/${mentorId}`),
  getStudentAssignments: (studentId: number) =>
    apiClient.get(`/mentorship/assignments/student/${studentId}`),
  updateAssignmentStatus: (assignmentId: number, status: string) =>
    apiClient.put(`/mentorship/assignments/${assignmentId}/status`, null, { params: { status } }),
  createSession: (data: { assignment_id: number; notes?: string; recommended_resources?: string; action_items?: string }) =>
    apiClient.post('/mentorship/sessions', data),
  getSessions: (assignmentId: number) =>
    apiClient.get(`/mentorship/sessions/assignment/${assignmentId}`),
};

// 9. Interventions & Faculty
export const interventionApi = {
  getHighRisk: () =>
    apiClient.get('/interventions/high-risk'),
  getStudentInterventions: (studentId: number) =>
    apiClient.get(`/interventions/student/${studentId}`),
  createIntervention: (data: any) =>
    apiClient.post('/interventions/', data),
  updateIntervention: (id: number, data: any) =>
    apiClient.put(`/interventions/${id}`, data),
  escalate: (id: number, notes?: string) =>
    apiClient.post(`/interventions/${id}/escalate`, null, { params: { notes } }),
  reassess: (id: number, data: { intervention_id: number; topic: string; score: number; max_score?: number }) =>
    apiClient.post(`/interventions/${id}/reassess`, data),
};

// 10. Teacher Analytics
export const teacherApi = {
  getDashboard: (teacherId: number) =>
    apiClient.get(`/teacher-analytics/dashboard/${teacherId}`),
};
