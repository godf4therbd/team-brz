ALTER TABLE `users` ADD `email_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verify_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verify_expires` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_expires` text;