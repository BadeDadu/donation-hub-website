import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donations } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = ["Clothing", "Furniture", "Electronics", "Books", "Kitchen", "Sports", "Toys & Other"];
const VALID_CONDITIONS = ["New", "Like New", "Good", "Fair"];
const VALID_DONATION_TYPES = ["Goods/Items", "Monetary", "Volunteer Time"];
const VALID_STATUSES = ["available", "claimed", "completed"];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const donation = await db.select()
      .from(donations)
      .where(eq(donations.id, parseInt(id)))
      .limit(1);

    if (donation.length === 0) {
      return NextResponse.json({ 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    return NextResponse.json(donation[0]);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Validate donation type if provided
    if (requestBody.donationType && !VALID_DONATION_TYPES.includes(requestBody.donationType)) {
      return NextResponse.json({ 
        error: `Invalid donation type. Must be one of: ${VALID_DONATION_TYPES.join(', ')}`,
        code: "INVALID_DONATION_TYPE" 
      }, { status: 400 });
    }

    // Validate category if provided
    if (requestBody.category && !VALID_CATEGORIES.includes(requestBody.category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    // Validate condition if provided
    if (requestBody.condition && !VALID_CONDITIONS.includes(requestBody.condition)) {
      return NextResponse.json({ 
        error: `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`,
        code: "INVALID_CONDITION" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (requestBody.status && !VALID_STATUSES.includes(requestBody.status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate email format if provided
    if (requestBody.contactEmail && !validateEmail(requestBody.contactEmail)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Check if donation exists
    const existingDonation = await db.select()
      .from(donations)
      .where(eq(donations.id, parseInt(id)))
      .limit(1);

    if (existingDonation.length === 0) {
      return NextResponse.json({ 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Add provided fields to update data
    if (requestBody.donorName !== undefined) {
      updateData.donorName = requestBody.donorName.toString().trim();
    }
    if (requestBody.contactNumber !== undefined) {
      updateData.contactNumber = requestBody.contactNumber.toString().trim();
    }
    if (requestBody.donationType !== undefined) {
      updateData.donationType = requestBody.donationType;
    }
    if (requestBody.itemName !== undefined) {
      updateData.itemName = requestBody.itemName.toString().trim();
    }
    if (requestBody.category !== undefined) {
      updateData.category = requestBody.category;
    }
    if (requestBody.condition !== undefined) {
      updateData.condition = requestBody.condition;
    }
    if (requestBody.description !== undefined) {
      updateData.description = requestBody.description.toString().trim();
    }
    if (requestBody.photoUrls !== undefined) {
      updateData.photoUrls = requestBody.photoUrls;
    }
    if (requestBody.location !== undefined) {
      updateData.location = requestBody.location.toString().trim();
    }
    if (requestBody.contactEmail !== undefined) {
      updateData.contactEmail = requestBody.contactEmail.toString().toLowerCase().trim();
    }
    if (requestBody.contactPhone !== undefined) {
      updateData.contactPhone = requestBody.contactPhone.toString().trim();
    }
    if (requestBody.status !== undefined) {
      updateData.status = requestBody.status;
    }

    const updatedDonation = await db.update(donations)
      .set(updateData)
      .where(eq(donations.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedDonation[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if donation exists
    const existingDonation = await db.select()
      .from(donations)
      .where(eq(donations.id, parseInt(id)))
      .limit(1);

    if (existingDonation.length === 0) {
      return NextResponse.json({ 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    const deletedDonation = await db.delete(donations)
      .where(eq(donations.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Donation deleted successfully',
      donation: deletedDonation[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}