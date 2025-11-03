CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donor_name` text NOT NULL,
	`contact_number` text NOT NULL,
	`donation_type` text NOT NULL,
	`item_name` text NOT NULL,
	`category` text NOT NULL,
	`condition` text NOT NULL,
	`description` text NOT NULL,
	`photo_urls` text,
	`location` text NOT NULL,
	`contact_email` text,
	`contact_phone` text,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
