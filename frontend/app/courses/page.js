'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser, hasRole } from '../../utils/auth';
import Link from 'next/link';
import { FiPlus, FiBookOpen, FiUsers } from 'react-icons/fi';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = getUser();
  const isInstructor = hasRole('instructor') || hasRole('admin');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      fetchCourses(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll');
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}/enroll`);
      fetchCourses(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to unenroll');
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-2">Browse and manage your courses</p>
          </div>
          {isInstructor && (
            <Link
              href="/courses/create"
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus />
              <span>Create Course</span>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiBookOpen className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500 mt-4">No courses available</p>
            {isInstructor && (
              <Link
                href="/courses/create"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first course →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                      <p className="text-gray-600 mt-1">{course.name}</p>
                    </div>
                    {course.enrolled && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Enrolled
                      </span>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    {course.first_name && (
                      <span className="flex items-center">
                        <FiUsers className="mr-1" />
                        {course.first_name} {course.last_name}
                      </span>
                    )}
                    {course.enrollment_count !== undefined && (
                      <span className="ml-4">
                        {course.enrollment_count} students
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View Course
                    </Link>
                    {user.role === 'student' && (
                      <>
                        {course.enrolled ? (
                          <button
                            onClick={() => handleUnenroll(course.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Unenroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Enroll
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
