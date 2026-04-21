// Script to create an admin user
// Run this once with: node scripts/create-admin.js
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env file');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('cepstrum2026', 10);
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: cepstrum2026');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
