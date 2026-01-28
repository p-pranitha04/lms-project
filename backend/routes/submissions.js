const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Get submissions for an assignment
router.get('/assignment/:assignmentId', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const submissions = await query(`
      SELECT s.*, 
             u.first_name, u.last_name, u.email,
             g.points_earned, g.feedback, g.graded_at
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN grades g ON s.id = g.submission_id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);

    res.json({ submissions: submissions.rows });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get student's submission for an assignment
router.get('/assignment/:assignmentId/my-submission', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const result = await query(`
      SELECT s.*, g.points_earned, g.feedback, g.graded_at
      FROM submissions s
      LEFT JOIN grades g ON s.id = g.submission_id
      WHERE s.assignment_id = $1 AND s.student_id = $2
    `, [assignmentId, req.user.id]);

    if (result.rows.length === 0) {
      return res.json({ submission: null });
    }

    res.json({ submission: result.rows[0] });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Submit assignment
router.post('/', authenticateToken, authorizeRoles('student'), upload.single('file'), [
  body('assignmentId').isInt(),
  body('content').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId, content } = req.body;
    const filePath = req.file ? req.file.path : null;

    // Check if assignment exists and student is enrolled
    const assignment = await query(`
      SELECT a.*, c.id as course_id
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = $1
    `, [assignmentId]);

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const enrollment = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, assignment.rows[0].course_id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existing = await query(
      'SELECT id FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, req.user.id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing submission
      result = await query(
        `UPDATE submissions 
         SET content = COALESCE($1, content),
             file_path = COALESCE($2, file_path),
             updated_at = CURRENT_TIMESTAMP
         WHERE assignment_id = $3 AND student_id = $4
         RETURNING *`,
        [content, filePath, assignmentId, req.user.id]
      );
    } else {
      // Create new submission
      result = await query(
        `INSERT INTO submissions (assignment_id, student_id, content, file_path) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [assignmentId, req.user.id, content || null, filePath]
      );
    }

    res.status(201).json({ submission: result.rows[0] });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

module.exports = router;
