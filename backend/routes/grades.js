const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get grades for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    if (req.user.role === 'student') {
      // Get student's grades
      const grades = await query(`
        SELECT g.*, a.title as assignment_title, a.points as max_points,
               s.submitted_at, s.content, s.file_path
        FROM grades g
        JOIN submissions s ON g.submission_id = s.id
        JOIN assignments a ON g.assignment_id = a.id
        WHERE g.student_id = $1 AND a.course_id = $2
        ORDER BY a.due_date DESC
      `, [req.user.id, courseId]);

      res.json({ grades: grades.rows });
    } else {
      // Get all grades for instructors
      const grades = await query(`
        SELECT g.*, a.title as assignment_title, a.points as max_points,
               u.first_name, u.last_name, u.email,
               s.submitted_at
        FROM grades g
        JOIN submissions s ON g.submission_id = s.id
        JOIN assignments a ON g.assignment_id = a.id
        JOIN users u ON g.student_id = u.id
        WHERE a.course_id = $1
        ORDER BY a.due_date DESC, u.last_name ASC
      `, [courseId]);

      res.json({ grades: grades.rows });
    }
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Grade a submission
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('submissionId').isInt(),
  body('pointsEarned').isFloat({ min: 0 }),
  body('feedback').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { submissionId, pointsEarned, feedback } = req.body;

    // Get submission and assignment details
    const submission = await query(`
      SELECT s.*, a.course_id, a.points as max_points, c.instructor_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.id = $1
    `, [submissionId]);

    if (submission.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && submission.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to grade this submission' });
    }

    // Check if points exceed max
    if (pointsEarned > submission.rows[0].max_points) {
      return res.status(400).json({ error: 'Points cannot exceed maximum points' });
    }

    const assignmentId = submission.rows[0].assignment_id;
    const studentId = submission.rows[0].student_id;

    // Check if grade already exists
    const existing = await query('SELECT id FROM grades WHERE submission_id = $1', [submissionId]);

    let result;
    if (existing.rows.length > 0) {
      // Update existing grade
      result = await query(
        `UPDATE grades 
         SET points_earned = $1, 
             feedback = $2,
             graded_by = $3,
             graded_at = CURRENT_TIMESTAMP
         WHERE submission_id = $4
         RETURNING *`,
        [pointsEarned, feedback || null, req.user.id, submissionId]
      );
    } else {
      // Create new grade
      result = await query(
        `INSERT INTO grades (submission_id, assignment_id, student_id, points_earned, feedback, graded_by) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [submissionId, assignmentId, studentId, pointsEarned, feedback || null, req.user.id]
      );
    }

    res.status(201).json({ grade: result.rows[0] });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

module.exports = router;
