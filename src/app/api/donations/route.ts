import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donations } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_CATEGORIES = ["Clothing", "Furniture", "Electronics", "Books", "Kitchen", "Sports", "Toys & Other"];
const VALID_CONDITIONS = ["New", "Like New", "Good", "Fair"];
const VALID_DONATION_TYPES = ["Goods/Items", "Monetary", "Volunteer Time"];
const VALID_STATUSES = ["available", "claimed", "completed"];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = db.select().from(donations);
    let conditions = [];

    if (search) {
      const searchCondition = or(
        like(donations.itemName, `%${search}%`),
        like(donations.description, `%${search}%`),
        like(donations.location, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    if (category) {
      conditions.push(eq(donations.category, category));
    }

    if (status) {
      conditions.push(eq(donations.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
      donorName,
      contactNumber,
      donationType,
      itemName,
      category,
      condition,
      description,
      photoUrls,
      location,
      contactEmail,
      contactPhone,
      status
    } = requestBody;

    // Validate required fields
    if (!donorName || donorName.trim() === '') {
      return NextResponse.json({ 
        error: "Donor name is required",
        code: "MISSING_DONOR_NAME" 
      }, { status: 400 });
    }

    if (!contactNumber || contactNumber.trim() === '') {
      return NextResponse.json({ 
        error: "Contact number is required",
        code: "MISSING_CONTACT_NUMBER" 
      }, { status: 400 });
    }

    // donationType is now optional, defaults to "Goods/Items"
    const finalDonationType = donationType || "Goods/Items";

    if (!VALID_DONATION_TYPES.includes(finalDonationType)) {
      return NextResponse.json({ 
        error: `Invalid donation type. Must be one of: ${VALID_DONATION_TYPES.join(', ')}`,
        code: "INVALID_DONATION_TYPE" 
      }, { status: 400 });
    }

    if (!itemName || itemName.trim() === '') {
      return NextResponse.json({ 
        error: "Item name is required",
        code: "MISSING_ITEM_NAME" 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: "Category is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (!condition) {
      return NextResponse.json({ 
        error: "Condition is required",
        code: "MISSING_CONDITION" 
      }, { status: 400 });
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json({ 
        error: `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`,
        code: "INVALID_CONDITION" 
      }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({ 
        error: "Description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!location || location.trim() === '') {
      return NextResponse.json({ 
        error: "Location is required",
        code: "MISSING_LOCATION" 
      }, { status: 400 });
    }

    // Validate optional fields
    if (contactEmail && !validateEmail(contactEmail)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate photoUrls if provided
    if (photoUrls !== null && photoUrls !== undefined) {
      if (!Array.isArray(photoUrls)) {
        return NextResponse.json({ 
          error: "Photo URLs must be an array",
          code: "INVALID_PHOTO_URLS" 
        }, { status: 400 });
      }
    }

    // Prepare insert data
    const insertData = {
      donorName: donorName.trim(),
      contactNumber: contactNumber.trim(),
      donationType: finalDonationType,
      itemName: itemName.trim(),
      category,
      condition,
      description: description.trim(),
      photoUrls: photoUrls || null,
      location: location.trim(),
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      status: status || 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDonation = await db.insert(donations)
      .values(insertData)
      .returning();

    return NextResponse.json(newDonation[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}