'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import { getUser, hasRole } from '../../../utils/auth';
import Link from 'next/link';
import { FiFileText, FiBell, FiCalendar, FiPlus, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isInstructor = hasRole('instructor') || hasRole('admin');

  useEffect(() => {
    if (params.id) {
      fetchCourseData();
    }
  }, [params.id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await api.get(`/courses/${params.id}`);
      setCourse(courseRes.data.course);

      // Fetch assignments
      const assignmentsRes = await api.get(`/assignments/course/${params.id}`);
      setAssignments(assignmentsRes.data.assignments || []);

      // Fetch announcements
      const announcementsRes = await api.get(`/announcements/course/${params.id}`);
      setAnnouncements(announcementsRes.data.announcements || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      if (error.response?.status === 403) {
        router.push('/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Course not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
              <p className="text-xl text-gray-600 mt-1">{course.name}</p>
              {course.description && (
                <p className="text-gray-500 mt-2">{course.description}</p>
              )}
              {course.instructor_email && (
                <p className="text-sm text-gray-500 mt-2">
                  Instructor: {course.first_name} {course.last_name} ({course.instructor_email})
                </p>
              )}
            </div>
            {course.enrollments && (
              <div className="text-right">
                <div className="flex items-center text-gray-600">
                  <FiUsers className="mr-2" />
                  <span>{course.enrollments.length} enrolled</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiBell className="mr-2" />
                  Announcements
                </h2>
                {isInstructor && (
                  <Link
                    href={`/courses/${params.id}/announcements/create`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + New Announcement
                  </Link>
                )}
              </div>
              <div className="p-6">
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No announcements</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {announcement.first_name} {announcement.last_name} •{' '}
                          {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiFileText className="mr-2" />
                  Assignments
                </h2>
                {isInstructor && (
                  <Link
                    href={`/courses/${params.id}/assignments/create`}
                    className="flex items-center space-x-1 text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                  >
                    <FiPlus />
                    <span>Create Assignment</span>
                  </Link>
                )}
              </div>
              <div className="p-6">
                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No assignments yet</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <Link
                        key={assignment.id}
                        href={`/courses/${params.id}/assignments/${assignment.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                            {assignment.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {assignment.due_date && (
                                <span className="flex items-center">
                                  <FiCalendar className="mr-1" />
                                  Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy h:mm a')}
                                </span>
                              )}
                              <span>{assignment.points} points</span>
                            </div>
                          </div>
                          {assignment.submitted && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              Submitted
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-2 text-sm">
                {course.semester && (
                  <div>
                    <span className="text-gray-500">Semester:</span>
                    <span className="ml-2 text-gray-900">{course.semester}</span>
                  </div>
                )}
                {course.year && (
                  <div>
                    <span className="text-gray-500">Year:</span>
                    <span className="ml-2 text-gray-900">{course.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {isInstructor && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href={`/courses/${params.id}/assignments/create`}
                    className="block w-full text-left px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Assignment
                  </Link>
                  <Link
                    href={`/courses/${params.id}/announcements/create`}
                    className="block w-full text-left px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Post Announcement
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
