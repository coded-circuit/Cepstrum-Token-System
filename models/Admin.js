import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will store bcrypt hash
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);   