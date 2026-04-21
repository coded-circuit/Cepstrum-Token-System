import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await dbConnect();
  try {
    // Get all statistics in parallel
    const [total, dined, pending, vegCount, nonVegCount] = await Promise.all([
      Guest.countDocuments(),
      Guest.countDocuments({ isDined: true }),
      Guest.countDocuments({ isDined: false }),
      Guest.countDocuments({ foodPreference: 'veg' }),
      Guest.countDocuments({ foodPreference: 'non-veg' })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        dined,
        pending,
        vegCount,
        nonVegCount
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
