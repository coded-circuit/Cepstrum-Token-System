import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';

export async function POST(req) {
  await dbConnect();
  try {
    // In a real app, verify the admin's session/token here first!
    
    const { guestId, adminPasscode } = await req.json();

    // Simple hardcoded passcode to prevent guests from finding this route
    if (adminPasscode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return NextResponse.json({ success: false, message: 'Guest not found' });
    }

    if (guest.hasDined) {
       return NextResponse.json({ success: false, message: 'Guest already marked present.' });
    }

    // Manually override
    guest.hasDined = true;
    guest.scannedAt = new Date();
    guest.overrideUsed = true; // Optional: Track that this was a manual entry
    await guest.save();

    return NextResponse.json({ success: true, message: `Manual Entry Granted for ${guest.name}` });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}