import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();
  try {
    const { guestId, foodPreference } = await req.json();

    // Validate inputs
    if (!guestId || !foodPreference) {
      return NextResponse.json(
        { success: false, message: 'Guest ID and food preference are required' },
        { status: 400 }
      );
    }

    if (!['veg', 'non-veg'].includes(foodPreference)) {
      return NextResponse.json(
        { success: false, message: 'Invalid food preference. Must be "veg" or "non-veg"' },
        { status: 400 }
      );
    }

    // Find and update guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }

    // Update food preference and mark as dined
    guest.foodPreference = foodPreference;
    guest.isDined = true;
    guest.scannedAt = new Date();
    await guest.save();

    return NextResponse.json({
      success: true,
      message: 'Food preference saved successfully',
      guest: {
        _id: guest._id,
        name: guest.name,
        foodPreference: guest.foodPreference,
        isDined: guest.isDined
      }
    });

  } catch (error) {
    console.error('Food preference update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
