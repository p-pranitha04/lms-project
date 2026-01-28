'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import Link from 'next/link';
import { FiBook, FiFileText, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    upcoming: 0,
    averageGrade: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesRes = await api.get('/courses');
      const courses = coursesRes.data.courses || [];
      
      // Filter enrolled courses for students
      const enrolledCourses = user.role === 'student' 
        ? courses.filter(c => c.enrolled)
        : courses;

      setRecentCourses(enrolledCourses.slice(0, 5));

      // Fetch assignments for enrolled courses
      let allAssignments = [];
      for (const course of enrolledCourses) {
        try {
          const assignmentsRes = await api.get(`/assignments/course/${course.id}`);
          allAssignments = [...allAssignments, ...(assignmentsRes.data.assignments || [])];
        } catch (err) {
          console.error(`Error fetching assignments for course ${course.id}:`, err);
        }
      }

      // Filter upcoming assignments
      const now = new Date();
      const upcoming = allAssignments
        .filter(a => a.due_date && new Date(a.due_date) > now)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

      setUpcomingAssignments(upcoming);

      // Calculate stats
      setStats({
        courses: enrolledCourses.length,
        assignments: allAssignments.length,
        upcoming: upcoming.length,
        averageGrade: 0, // TODO: Calculate from grades
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your courses
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.courses}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiBook className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.assignments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiFileText className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcoming}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiCalendar className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {user.role === 'student' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiTrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            </div>
            <div className="p-6">
              {recentCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No courses yet</p>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.code}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.name}</p>
                          {course.instructor_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              {course.first_name} {course.last_name}
                            </p>
                          )}
                        </div>
                        {course.enrolled && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Enrolled
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/courses"
                className="mt-4 block text-center text-primary-600 hover:text-primary-700 font-medium"
              >
                View all courses →
              </Link>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Assignments</h2>
            </div>
            <div className="p-6">
              {upcomingAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming assignments</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.course_code || 'Course'}
                          </p>
                          {assignment.due_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy h:mm a')}
                            </p>
                          )}
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
      </div>
    </Layout>
  );
}
