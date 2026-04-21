import dbConnect from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const { isDined } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const guest = await Guest.findById(id);
    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }

    // Toggle or set isDined status
    guest.isDined = isDined !== undefined ? isDined : !guest.isDined;
    await guest.save();

    return NextResponse.json({
      success: true,
      message: `Guest status updated to ${guest.isDined ? 'dined' : 'not dined'}`,
      guest: {
        _id: guest._id,
        name: guest.name,
        isDined: guest.isDined
      }
    });

  } catch (error) {
    console.error('Guest update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const guest = await Guest.findByIdAndDelete(id);
    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully'
    });

  } catch (error) {
    console.error('Guest deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
