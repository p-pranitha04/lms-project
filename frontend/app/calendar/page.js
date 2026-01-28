'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function CalendarPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Get all courses first
      const coursesRes = await api.get('/courses');
      const courses = coursesRes.data.courses || [];
      
      // Filter enrolled courses for students
      const enrolledCourses = courses.filter(c => c.enrolled || c.instructor_id);

      // Fetch assignments for all enrolled courses
      let allAssignments = [];
      for (const course of enrolledCourses) {
        try {
          const assignmentsRes = await api.get(`/assignments/course/${course.id}`);
          allAssignments = [...allAssignments, ...(assignmentsRes.data.assignments || [])];
        } catch (err) {
          console.error(`Error fetching assignments for course ${course.id}:`, err);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(a => {
      if (!a.due_date) return false;
      const dueDate = new Date(a.due_date);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });
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

  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    setSelectedDate(new Date(currentYear, currentMonth + direction, 1));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">View upcoming assignments and deadlines</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(currentYear, currentMonth, i + 1);
              const dayAssignments = getAssignmentsForDate(date);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <div
                  key={i}
                  className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                    isToday ? 'bg-primary-50 border-primary-300' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                    {i + 1}
                  </div>
                  {dayAssignments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayAssignments.slice(0, 2).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded truncate"
                          title={assignment.title}
                        >
                          {assignment.title}
                        </div>
                      ))}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAssignments.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Assignments List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
          {assignments.filter(a => a.due_date && new Date(a.due_date) >= today).length === 0 ? (
            <p className="text-gray-500">No upcoming assignments</p>
          ) : (
            <div className="space-y-3">
              {assignments
                .filter(a => a.due_date && new Date(a.due_date) >= today)
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">{assignment.course_code || 'Course'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(assignment.due_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
