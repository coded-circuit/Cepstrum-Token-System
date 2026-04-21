import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();
  try {
    const { rollNumber, email, dateOfBirth } = await req.json();

    // Validate inputs
    if (!rollNumber || !email || !dateOfBirth) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find guest by roll number and email
    const guest = await Guest.findOne({
      rollNumber: rollNumber.trim(),
      email: email.trim().toLowerCase()
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found. Please check your details.' },
        { status: 404 }
      );
    }

    // Verify date of birth
    const providedDOB = new Date(dateOfBirth);
    const storedDOB = new Date(guest.dateOfBirth);
    
    if (
      providedDOB.getFullYear() !== storedDOB.getFullYear() ||
      providedDOB.getMonth() !== storedDOB.getMonth() ||
      providedDOB.getDate() !== storedDOB.getDate()
    ) {
      return NextResponse.json(
        { success: false, message: 'Date of birth does not match our records.' },
        { status: 401 }
      );
    }

    // Return guest details (excluding secretKey for security)
    return NextResponse.json({
      success: true,
      guestId: guest._id,
      name: guest.name,
      branch: guest.branch,
      year: guest.year,
      isDined: guest.isDined,
      foodPreference: guest.foodPreference
    });

  } catch (error) {
    console.error('Guest verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
