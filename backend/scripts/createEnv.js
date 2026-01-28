const fs = require('fs');
const path = require('path');

const envExample = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
# For free PostgreSQL, use: https://neon.tech or https://supabase.com
DATABASE_URL=postgresql://username:password@localhost:5432/lms_db

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Created .env file. Please update with your database credentials.');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
}
