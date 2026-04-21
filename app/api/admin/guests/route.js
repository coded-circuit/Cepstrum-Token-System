import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
      return NextResponse.json({ guests: [] });
    }

    // Search by name, branch, roll number, or email
    const guests = await Guest.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    })
    .select('name branch year rollNumber email isDined foodPreference scannedAt')
    .limit(50)
    .lean();

    return NextResponse.json({ guests });

  } catch (error) {
    console.error('Guest search error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const { name, branch, year, rollNumber, email, dateOfBirth } = await req.json();

    // Validate required fields
    if (!name || !branch || !year || !rollNumber || !email || !dateOfBirth) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if guest already exists
    const existingGuest = await Guest.findOne({
      $or: [
        { rollNumber: rollNumber.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existingGuest) {
      return NextResponse.json(
        { success: false, message: 'Guest with this roll number or email already exists' },
        { status: 409 }
      );
    }

    // Generate secret key
    const secretKey = crypto.randomBytes(16).toString('hex');

    // Create new guest
    const newGuest = await Guest.create({
      name: name.trim(),
      branch: branch.trim(),
      year: year.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim().toLowerCase(),
      dateOfBirth: new Date(dateOfBirth),
      secretKey,
      isDined: false,
      foodPreference: null
    });

    return NextResponse.json({
      success: true,
      message: 'Guest created successfully',
      guest: {
        _id: newGuest._id,
        name: newGuest.name,
        branch: newGuest.branch,
        year: newGuest.year,
        rollNumber: newGuest.rollNumber
      }
    });

  } catch (error) {
    console.error('Guest creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
