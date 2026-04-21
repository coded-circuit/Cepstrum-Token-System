import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const guest = await Guest.findById(id).lean();

    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }

    // Return guest details including secretKey (needed for QR generation)
    return NextResponse.json({
      success: true,
      guest: {
        _id: guest._id,
        name: guest.name,
        branch: guest.branch,
        year: guest.year,
        rollNumber: guest.rollNumber,
        secretKey: guest.secretKey,
        isDined: guest.isDined,
        foodPreference: guest.foodPreference,
        scannedAt: guest.scannedAt
      }
    });

  } catch (error) {
    console.error('Guest details error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
