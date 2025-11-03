import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, donations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const result = await db.select({
      id: requests.id,
      donationId: requests.donationId,
      requesterName: requests.requesterName,
      requesterEmail: requests.requesterEmail,
      requesterContact: requests.requesterContact,
      ngoName: requests.ngoName,
      purpose: requests.purpose,
      message: requests.message,
      status: requests.status,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      donation: {
        id: donations.id,
        donorName: donations.donorName,
        contactNumber: donations.contactNumber,
        donationType: donations.donationType,
        itemName: donations.itemName,
        category: donations.category,
        condition: donations.condition,
        description: donations.description,
        photoUrls: donations.photoUrls,
        location: donations.location,
        contactEmail: donations.contactEmail,
        contactPhone: donations.contactPhone,
        status: donations.status,
        createdAt: donations.createdAt,
        updatedAt: donations.updatedAt
      }
    })
    .from(requests)
    .leftJoin(donations, eq(requests.donationId, donations.id))
    .where(eq(requests.id, parseInt(id)))
    .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'Request not found',
        code: "REQUEST_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Validate status if provided
    if (requestBody.status && !['pending', 'approved', 'rejected'].includes(requestBody.status)) {
      return NextResponse.json({ 
        error: "Status must be one of: pending, approved, rejected",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate email format if provided
    if (requestBody.requesterEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(requestBody.requesterEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    // Validate donationId exists if provided
    if (requestBody.donationId) {
      const donationExists = await db.select({ id: donations.id })
        .from(donations)
        .where(eq(donations.id, requestBody.donationId))
        .limit(1);

      if (donationExists.length === 0) {
        return NextResponse.json({ 
          error: "Referenced donation does not exist",
          code: "INVALID_DONATION_ID" 
        }, { status: 400 });
      }
    }

    // Check if request exists
    const existingRequest = await db.select({ id: requests.id })
      .from(requests)
      .where(eq(requests.id, parseInt(id)))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json({ 
        error: 'Request not found',
        code: "REQUEST_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...requestBody,
      updatedAt: new Date().toISOString()
    };

    // Sanitize email to lowercase if provided
    if (updateData.requesterEmail) {
      updateData.requesterEmail = updateData.requesterEmail.toLowerCase().trim();
    }

    // Trim string fields
    if (updateData.requesterName) updateData.requesterName = updateData.requesterName.trim();
    if (updateData.requesterContact) updateData.requesterContact = updateData.requesterContact.trim();
    if (updateData.ngoName) updateData.ngoName = updateData.ngoName.trim();
    if (updateData.purpose) updateData.purpose = updateData.purpose.trim();
    if (updateData.message) updateData.message = updateData.message.trim();

    const updated = await db.update(requests)
      .set(updateData)
      .where(eq(requests.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update request',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH error:', error);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if request exists
    const existingRequest = await db.select()
      .from(requests)
      .where(eq(requests.id, parseInt(id)))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json({ 
        error: 'Request not found',
        code: "REQUEST_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(requests)
      .where(eq(requests.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete request',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Request deleted successfully',
      deletedRequest: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}