CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` integer,
	`requester_name` text NOT NULL,
	`requester_email` text NOT NULL,
	`requester_contact` text NOT NULL,
	`ngo_name` text NOT NULL,
	`purpose` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON UPDATE no action ON DELETE no action
);
