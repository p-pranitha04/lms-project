'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../../components/Layout';
import api from '../../../../../utils/api';
import { getUser, hasRole } from '../../../../../utils/auth';
import { format } from 'date-fns';
import { FiUpload, FiFile, FiCheck } from 'react-icons/fi';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    file: null,
  });
  const user = getUser();
  const isStudent = hasRole('student');

  useEffect(() => {
    fetchAssignmentData();
  }, [params.assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment
      const assignmentRes = await api.get(`/assignments/${params.assignmentId}`);
      setAssignment(assignmentRes.data.assignment);

      // Fetch submission if student
      if (isStudent) {
        try {
          const submissionRes = await api.get(`/submissions/assignment/${params.assignmentId}/my-submission`);
          if (submissionRes.data.submission) {
            setSubmission(submissionRes.data.submission);
            setFormData({
              content: submissionRes.data.submission.content || '',
              file: null,
            });
          }
        } catch (err) {
          // No submission yet
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('assignmentId', params.assignmentId);
      submitData.append('content', formData.content);
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      await api.post('/submissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Assignment submitted successfully!');
      fetchAssignmentData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
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

  if (!assignment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Assignment not found</p>
        </div>
      </Layout>
    );
  }

  const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assignment Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600 mt-1">{assignment.course_code} - {assignment.course_name}</p>
            </div>
            {isStudent && submission && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                <FiCheck className="mr-1" />
                Submitted
              </span>
            )}
          </div>

          {assignment.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {assignment.due_date && (
              <div>
                <span className="text-gray-500">Due:</span>
                <span className={`ml-2 font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900'}`}>
                  {format(new Date(assignment.due_date), 'MMM dd, yyyy h:mm a')}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Points:</span>
              <span className="ml-2 font-medium text-gray-900">{assignment.points}</span>
            </div>
          </div>
        </div>

        {/* Submission Form (Students) */}
        {isStudent && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {submission ? 'Update Submission' : 'Submit Assignment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Content
                </label>
                <textarea
                  id="content"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your submission here..."
                />
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <FiUpload />
                    <span>Choose File</span>
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.file && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <FiFile className="mr-1" />
                      {formData.file.name}
                    </span>
                  )}
                  {submission?.file_path && !formData.file && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <FiFile className="mr-1" />
                      Current file uploaded
                    </span>
                  )}
                </div>
              </div>

              {submission && submission.points_earned !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Grade: {submission.points_earned} / {assignment.points} points
                  </p>
                  {submission.feedback && (
                    <p className="text-sm text-green-700 mt-2">{submission.feedback}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
              </button>
            </form>
          </div>
        )}

        {/* View Submissions (Instructors) */}
        {!isStudent && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submissions</h2>
            <p className="text-gray-500">View and grade submissions from the course page.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
