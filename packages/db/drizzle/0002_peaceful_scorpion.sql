CREATE TABLE `session_checkpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`trigger` text NOT NULL,
	`l1_snapshot` text NOT NULL,
	`step_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
