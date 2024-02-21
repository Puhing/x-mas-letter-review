-- [TABLE CREATE SQL] TB_USER
CREATE TABLE `TB_USER` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- [TABLE CREATE SQL] TB_USER_CHAT
CREATE TABLE `TB_USER_CHAT` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `socketId` varchar(255) DEFAULT NULL,
  `content` text,
  `type` int DEFAULT NULL COMMENT '1:txt, 2:audio, 3:image',
  `addedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `nickname` varchar(255) DEFAULT NULL,
  `roomNow` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

