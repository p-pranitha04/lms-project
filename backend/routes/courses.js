const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    let courses;
    
    if (req.user.role === 'student') {
      // Get enrolled courses for students
      courses = await query(`
        SELECT c.*, u.first_name, u.last_name,
               EXISTS(SELECT 1 FROM enrollments WHERE course_id = c.id AND student_id = $1) as enrolled
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
      `, [req.user.id]);
    } else {
      // Get all courses for instructors/admins
      courses = await query(`
        SELECT c.*, u.first_name, u.last_name,
               (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
      `);
    }

    res.json({ courses: courses.rows });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;

    const courseResult = await query(`
      SELECT c.*, u.first_name, u.last_name, u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `, [courseId]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Get enrollments
    const enrollments = await query(`
      SELECT u.id, u.first_name, u.last_name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = $1
    `, [courseId]);

    course.enrollments = enrollments.rows;

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('code').trim().notEmpty(),
  body('name').trim().notEmpty(),
  body('description').optional(),
  body('semester').optional(),
  body('year').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, name, description, semester, year } = req.body;

    // Check if course code exists
    const existing = await query('SELECT id FROM courses WHERE code = $1', [code]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const result = await query(
      `INSERT INTO courses (code, name, description, instructor_id, semester, year) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [code, name, description || null, req.user.role === 'admin' ? null : req.user.id, semester || null, year || null]
    );

    res.status(201).json({ course: result.rows[0] });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const { name, description, semester, year } = req.body;

    // Check if user owns the course or is admin
    const course = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const result = await query(
      `UPDATE courses 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           semester = COALESCE($3, semester),
           year = COALESCE($4, year),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, semester, year, courseId]
    );

    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if user owns the course or is admin
    const course = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await query('DELETE FROM courses WHERE id = $1', [courseId]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const course = await query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    await query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
      [req.user.id, courseId]
    );

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Unenroll from course
router.delete('/:id/enroll', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const courseId = req.params.id;

    await query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ error: 'Failed to unenroll' });
  }
});

module.exports = router;
