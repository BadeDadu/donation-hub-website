import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const donations = sqliteTable('donations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  donorName: text('donor_name').notNull(),
  contactNumber: text('contact_number').notNull(),
  donationType: text('donation_type').notNull(),
  itemName: text('item_name').notNull(),
  category: text('category').notNull(),
  condition: text('condition').notNull(),
  description: text('description').notNull(),
  photoUrls: text('photo_urls', { mode: 'json' }),
  location: text('location').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  status: text('status').notNull().default('available'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const requests = sqliteTable('requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  donationId: integer('donation_id').references(() => donations.id),
  requesterName: text('requester_name').notNull(),
  requesterEmail: text('requester_email').notNull(),
  requesterContact: text('requester_contact').notNull(),
  ngoName: text('ngo_name').notNull(),
  purpose: text('purpose').notNull(),
  message: text('message'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});