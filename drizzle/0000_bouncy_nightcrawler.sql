CREATE TABLE `event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'CONFIRMED' NOT NULL,
	`registered_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_registrations_event_user_uniq` ON `event_registrations` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'TOUR' NOT NULL,
	`location` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`cover_image` text,
	`capacity` integer,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`created_by_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`condition` text DEFAULT 'GOOD' NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`location` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text DEFAULT '🏅' NOT NULL,
	`color` text DEFAULT '#f97316' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medals_name_unique` ON `medals` (`name`);--> statement-breakpoint
CREATE TABLE `user_medals` (
	`user_id` text NOT NULL,
	`medal_id` text NOT NULL,
	`awarded_at` text DEFAULT (current_timestamp) NOT NULL,
	`awarded_by_id` text,
	`note` text,
	PRIMARY KEY(`user_id`, `medal_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medal_id`) REFERENCES `medals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`awarded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`bike_model` text,
	`bio` text,
	`avatar_url` text,
	`city` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`approved` integer DEFAULT false NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`joined_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);