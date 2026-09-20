CREATE TABLE `reports` (
	`id` varchar(32) NOT NULL,
	`category` enum('Garbage accumulation','Pothole') NOT NULL,
	`location` varchar(255) NOT NULL,
	`ward` varchar(128) NOT NULL,
	`durationDays` int NOT NULL DEFAULT 1,
	`transcript` text,
	`photoUrl` text,
	`audioUrl` text,
	`status` enum('In review','Assigned','Resolved','Disputed') NOT NULL DEFAULT 'In review',
	`confidence` int NOT NULL DEFAULT 94,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
