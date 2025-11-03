import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, donations } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid status values
const validStatuses = ["pending", "approved", "rejected"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select({
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
          itemName: donations.itemName,
          category: donations.category,
          condition: donations.condition,
          description: donations.description,
          location: donations.location,
          status: donations.status
        }
      })
      .from(requests)
      .leftJoin(donations, eq(requests.donationId, donations.id))
      .where(eq(requests.id, parseInt(id)))
      .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const donationId = searchParams.get('donationId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select({
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
        itemName: donations.itemName,
        category: donations.category,
        condition: donations.condition,
        description: donations.description,
        location: donations.location,
        status: donations.status
      }
    })
    .from(requests)
    .leftJoin(donations, eq(requests.donationId, donations.id));

    // Build conditions array
    const conditions = [];

    // Search functionality
    if (search) {
      conditions.push(
        or(
          like(requests.requesterName, `%${search}%`),
          like(requests.ngoName, `%${search}%`),
          like(requests.purpose, `%${search}%`)
        )
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(requests.status, status));
    }

    // DonationId filter
    if (donationId) {
      if (isNaN(parseInt(donationId))) {
        return NextResponse.json({ 
          error: "Valid donation ID is required",
          code: "INVALID_DONATION_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(requests.donationId, parseInt(donationId)));
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'createdAt' ? requests.createdAt : 
                      sort === 'updatedAt' ? requests.updatedAt :
                      sort === 'requesterName' ? requests.requesterName :
                      sort === 'status' ? requests.status :
                      requests.createdAt;

    query = order === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {
      donationId,
      requesterName,
      requesterEmail,
      requesterContact,
      ngoName,
      purpose,
      message,
      status = "pending"
    } = requestBody;

    // Validate required fields
    if (!requesterName) {
      return NextResponse.json({ 
        error: "Requester name is required",
        code: "MISSING_REQUESTER_NAME" 
      }, { status: 400 });
    }

    if (!requesterEmail) {
      return NextResponse.json({ 
        error: "Requester email is required",
        code: "MISSING_REQUESTER_EMAIL" 
      }, { status: 400 });
    }

    if (!requesterContact) {
      return NextResponse.json({ 
        error: "Requester contact is required",
        code: "MISSING_REQUESTER_CONTACT" 
      }, { status: 400 });
    }

    if (!ngoName) {
      return NextResponse.json({ 
        error: "NGO name is required",
        code: "MISSING_NGO_NAME" 
      }, { status: 400 });
    }

    if (!purpose) {
      return NextResponse.json({ 
        error: "Purpose is required",
        code: "MISSING_PURPOSE" 
      }, { status: 400 });
    }

    if (!donationId) {
      return NextResponse.json({ 
        error: "Donation ID is required",
        code: "MISSING_DONATION_ID" 
      }, { status: 400 });
    }

    // Validate donation ID is a number
    if (isNaN(parseInt(donationId))) {
      return NextResponse.json({ 
        error: "Valid donation ID is required",
        code: "INVALID_DONATION_ID" 
      }, { status: 400 });
    }

    // Validate email format
    if (!emailRegex.test(requesterEmail)) {
      return NextResponse.json({ 
        error: "Valid email format is required",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Validate status
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${validStatuses.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Verify donation exists
    const existingDonation = await db.select()
      .from(donations)
      .where(eq(donations.id, parseInt(donationId)))
      .limit(1);

    if (existingDonation.length === 0) {
      return NextResponse.json({ 
        error: "Donation not found",
        code: "DONATION_NOT_FOUND" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      donationId: parseInt(donationId),
      requesterName: requesterName.trim(),
      requesterEmail: requesterEmail.toLowerCase().trim(),
      requesterContact: requesterContact.trim(),
      ngoName: ngoName.trim(),
      purpose: purpose.trim(),
      message: message ? message.trim() : null,
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(requests)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const {
      donationId,
      requesterName,
      requesterEmail,
      requesterContact,
      ngoName,
      purpose,
      message,
      status
    } = requestBody;

    // Check if record exists
    const existingRecord = await db.select()
      .from(requests)
      .where(eq(requests.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Validate email format if provided
    if (requesterEmail && !emailRegex.test(requesterEmail)) {
      return NextResponse.json({ 
        error: "Valid email format is required",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${validStatuses.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Verify donation exists if donationId is being updated
    if (donationId) {
      if (isNaN(parseInt(donationId))) {
        return NextResponse.json({ 
          error: "Valid donation ID is required",
          code: "INVALID_DONATION_ID" 
        }, { status: 400 });
      }

      const existingDonation = await db.select()
        .from(donations)
        .where(eq(donations.id, parseInt(donationId)))
        .limit(1);

      if (existingDonation.length === 0) {
        return NextResponse.json({ 
          error: "Donation not found",
          code: "DONATION_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (donationId !== undefined) updateData.donationId = parseInt(donationId);
    if (requesterName !== undefined) updateData.requesterName = requesterName.trim();
    if (requesterEmail !== undefined) updateData.requesterEmail = requesterEmail.toLowerCase().trim();
    if (requesterContact !== undefined) updateData.requesterContact = requesterContact.trim();
    if (ngoName !== undefined) updateData.ngoName = ngoName.trim();
    if (purpose !== undefined) updateData.purpose = purpose.trim();
    if (message !== undefined) updateData.message = message ? message.trim() : null;
    if (status !== undefined) updateData.status = status;

    const updated = await db.update(requests)
      .set(updateData)
      .where(eq(requests.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(requests)
      .where(eq(requests.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const deleted = await db.delete(requests)
      .where(eq(requests.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Request deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}