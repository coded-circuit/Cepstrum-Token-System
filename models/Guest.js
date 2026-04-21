import mongoose from 'mongoose';

const GuestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  dateOfBirth: { type: Date, required: true },
  secretKey: { type: String, required: true }, // Used for generating dynamic QR
  isDined: { type: Boolean, default: false, index: true },
  foodPreference: { type: String, enum: ['veg', 'non-veg', null], default: null },
  scannedAt: { type: Date }
});

export default mongoose.models.Guest || mongoose.model('Guest', GuestSchema);