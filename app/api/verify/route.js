import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();
  try {
    const { id, timestamp, signature } = await req.json();

    // 1. Check timestamp to prevent screenshot sharing (30-second window)
    if (Date.now() - timestamp > 30000) {
      return NextResponse.json({ success: false, message: 'QR Code Expired. Ask guest to refresh.' });
    }

    const guest = await Guest.findById(id);
    if (!guest) return NextResponse.json({ success: false, message: 'Invalid Pass.' });

    // 2. Verify Cryptographic Signature
    const expectedSignature = crypto
      .createHmac('sha256', guest.secretKey)
      .update(timestamp.toString())
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, message: 'Tampered Pass Detected.' });
    }

    // 3. Check if already dined
    if (guest.isDined) {
      return NextResponse.json({ 
        success: false, 
        message: 'Guest has already dined',
        alreadyDined: true,
        guest: {
          name: guest.name,
          branch: guest.branch,
          year: guest.year,
          rollNumber: guest.rollNumber,
          scannedAt: guest.scannedAt
        }
      });
    }

    // 4. First time scan - check if food preference is set
    if (!guest.foodPreference) {
      // Return guest info but don't mark as dined yet
      return NextResponse.json({ 
        success: true, 
        message: 'Access Granted',
        requiresFoodSelection: true,
        guest: {
          _id: guest._id,
          name: guest.name,
          branch: guest.branch,
          year: guest.year,
          rollNumber: guest.rollNumber
        }
      });
    }

    // 5. Food preference already set - mark as dined
    guest.isDined = true;
    guest.scannedAt = new Date();
    await guest.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Access Granted',
      guest: {
        _id: guest._id,
        name: guest.name,
        branch: guest.branch,
        year: guest.year,
        rollNumber: guest.rollNumber,
        foodPreference: guest.foodPreference
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}