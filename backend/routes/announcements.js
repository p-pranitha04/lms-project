const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get announcements for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check access
    if (req.user.role === 'student') {
      const enrollment = await query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [req.user.id, courseId]
      );
      if (enrollment.rows.length === 0) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    }

    const announcements = await query(`
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.course_id = $1
      ORDER BY a.created_at DESC
    `, [courseId]);

    res.json({ announcements: announcements.rows });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('courseId').isInt(),
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, title, content } = req.body;

    // Check authorization
    const course = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to create announcements for this course' });
    }

    const result = await query(
      `INSERT INTO announcements (course_id, title, content, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [courseId, title, content, req.user.id]
    );

    res.status(201).json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement
router.put('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { title, content } = req.body;

    // Check ownership
    const announcement = await query(
      `SELECT a.*, c.instructor_id 
       FROM announcements a 
       JOIN courses c ON a.course_id = c.id 
       WHERE a.id = $1`,
      [announcementId]
    );

    if (announcement.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (req.user.role !== 'admin' && announcement.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this announcement' });
    }

    const result = await query(
      `UPDATE announcements 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title, content, announcementId]
    );

    res.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const announcementId = req.params.id;

    // Check ownership
    const announcement = await query(
      `SELECT a.*, c.instructor_id 
       FROM announcements a 
       JOIN courses c ON a.course_id = c.id 
       WHERE a.id = $1`,
      [announcementId]
    );

    if (announcement.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (req.user.role !== 'admin' && announcement.rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this announcement' });
    }

    await query('DELETE FROM announcements WHERE id = $1', [announcementId]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
