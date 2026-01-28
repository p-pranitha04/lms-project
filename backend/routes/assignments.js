const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get assignments for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check if user has access to this course
    if (req.user.role === 'student') {
      const enrollment = await query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [req.user.id, courseId]
      );
      if (enrollment.rows.length === 0) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    }

    const assignments = await query(`
      SELECT a.*, 
             u.first_name, u.last_name,
             EXISTS(SELECT 1 FROM submissions WHERE assignment_id = a.id AND student_id = $1) as submitted
      FROM assignments a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.course_id = $2
      ORDER BY a.due_date ASC, a.created_at DESC
    `, [req.user.id, courseId]);

    res.json({ assignments: assignments.rows });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get single assignment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const result = await query(`
      SELECT a.*, c.code as course_code, c.name as course_name,
             u.first_name, u.last_name
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `, [assignmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = result.rows[0];

    // Check access
    if (req.user.role === 'student') {
      const enrollment = await query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [req.user.id, assignment.course_id]
      );
      if (enrollment.rows.length === 0) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Create assignment
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('courseId').isInt(),
  body('title').trim().notEmpty(),
  body('description').optional(),
  body('dueDate').optional().isISO8601(),
  body('points').optional().isInt({ min: 0 }),
  body('assignmentType').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, title, description, dueDate, points, assignmentType } = req.body;

    // Check if course exists and user has access
    const course = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to create assignments for this course' });
    }

    const result = await query(
      `INSERT INTO assignments (course_id, title, description, due_date, points, assignment_type, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [courseId, title, description || null, dueDate || null, points || 100, assignmentType || 'assignment', req.user.id]
    );

    res.status(201).json({ assignment: result.rows[0] });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { title, description, dueDate, points } = req.body;

    // Check ownership
    const assignment = await query(
      `SELECT a.*, c.instructor_id 
       FROM assignments a 
       JOIN courses c ON a.course_id = c.id 
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }

    const result = await query(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           points = COALESCE($4, points),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, dueDate, points, assignmentId]
    );

    res.json({ assignment: result.rows[0] });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment
router.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const assignmentId = req.params.id;

    // Check ownership
    const assignment = await query(
      `SELECT a.*, c.instructor_id 
       FROM assignments a 
       JOIN courses c ON a.course_id = c.id 
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this assignment' });
    }

    await query('DELETE FROM assignments WHERE id = $1', [assignmentId]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
