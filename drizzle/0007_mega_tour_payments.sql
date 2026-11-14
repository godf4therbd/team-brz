CREATE TABLE `mega_tour_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`phone_digits` text NOT NULL,
	`role` text NOT NULL,
	`bike_model` text,
	`reg_number` text,
	`blood_group` text,
	`emergency_contact` text NOT NULL,
	`reference` text,
	`method` text NOT NULL,
	`sender_number` text,
	`sender_digits` text,
	`tx_id` text NOT NULL,
	`confirmed` integer DEFAULT false NOT NULL,
	`confirmed_at` text,
	`confirmed_by_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`confirmed_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `mega_tour_payments_phone_idx` ON `mega_tour_payments` (`phone_digits`);--> statement-breakpoint
CREATE INDEX `mega_tour_payments_sender_idx` ON `mega_tour_payments` (`sender_digits`);