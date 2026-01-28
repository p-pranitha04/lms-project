const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create courses table
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        semester VARCHAR(50),
        year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create enrollments table
    await query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `);

    // Create assignments table
    await query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        points INTEGER DEFAULT 100,
        assignment_type VARCHAR(50) DEFAULT 'assignment',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create submissions table
    await query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        file_path VARCHAR(500),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(assignment_id, student_id)
      )
    `);

    // Create grades table
    await query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        points_earned DECIMAL(10, 2),
        feedback TEXT,
        graded_by INTEGER REFERENCES users(id),
        graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(submission_id)
      )
    `);

    // Create announcements table
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully');

    // Create default admin user
    const adminEmail = 'admin@lms.com';
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      await query(
        `INSERT INTO users (email, password, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [adminEmail, adminPassword, 'Admin', 'User', 'admin']
      );
      console.log('✅ Default admin user created (admin@lms.com / admin123)');
    }

    // Create default instructor
    const instructorEmail = 'instructor@lms.com';
    const instructorPassword = await bcrypt.hash('instructor123', 10);
    
    const existingInstructor = await query('SELECT id FROM users WHERE email = $1', [instructorEmail]);
    
    if (existingInstructor.rows.length === 0) {
      await query(
        `INSERT INTO users (email, password, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [instructorEmail, instructorPassword, 'John', 'Instructor', 'instructor']
      );
      console.log('✅ Default instructor created (instructor@lms.com / instructor123)');
    }

    // Create default student
    const studentEmail = 'student@lms.com';
    const studentPassword = await bcrypt.hash('student123', 10);
    
    const existingStudent = await query('SELECT id FROM users WHERE email = $1', [studentEmail]);
    
    if (existingStudent.rows.length === 0) {
      await query(
        `INSERT INTO users (email, password, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [studentEmail, studentPassword, 'Jane', 'Student', 'student']
      );
      console.log('✅ Default student created (student@lms.com / student123)');
    }

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
