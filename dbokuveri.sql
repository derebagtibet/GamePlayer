-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Anamakine: localhost:3306
-- Üretim Zamanı: 11 Şub 2026, 14:13:55
-- Sunucu sürümü: 10.11.16-MariaDB
-- PHP Sürümü: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `trf1d1com_alsan`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `type` varchar(20) DEFAULT 'direct',
  `name` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `conversations`
--

INSERT INTO `conversations` (`id`, `type`, `name`, `image_url`, `last_message`, `last_message_time`, `created_at`) VALUES
(1, 'group', 'Hal? Saha Ekibi ??', 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'Mehmet: Kaleci gelmiyor mu?', '2026-02-11 10:22:27', '2026-02-11 10:22:27');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `conversation_participants`
--

INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
(1, 1, '2026-02-11 10:22:27'),
(1, 2, '2026-02-11 10:22:27'),
(1, 3, '2026-02-11 10:22:27'),
(1, 4, '2026-02-11 10:22:27');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `organizer_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `subtitle` varchar(150) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `max_participants` int(11) DEFAULT 14,
  `current_participants` int(11) DEFAULT 0,
  `price` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'TL',
  `status` varchar(20) DEFAULT 'upcoming',
  `type` varchar(20) DEFAULT 'friendly',
  `image_url` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'sports-soccer',
  `badge_text` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `events`
--

INSERT INTO `events` (`id`, `organizer_id`, `title`, `subtitle`, `category`, `description`, `event_date`, `location`, `max_participants`, `current_participants`, `price`, `currency`, `status`, `type`, `image_url`, `icon`, `badge_text`, `created_at`) VALUES
(1, 1, 'Pazar Ligi', NULL, 'Futbol', NULL, '2026-02-06 13:05:21', 'Maltepe Sahil', 14, 0, 0.00, 'TL', 'past', 'friendly', NULL, 'sports-soccer', NULL, '2026-02-11 10:05:21'),
(2, 1, 'Ak?am Maç?', NULL, 'Futbol', NULL, '2026-02-01 13:05:21', 'Ata?ehir Arena', 14, 0, 0.00, 'TL', 'past', 'friendly', NULL, 'sports-soccer', NULL, '2026-02-11 10:05:21'),
(3, 1, 'Hal? Saha Maç?', 'Orta Seviye • Rekabetçi', 'Futbol', NULL, '2026-02-12 13:22:27', 'Göztepe Park?, Kad?köy', 14, 13, 65.00, 'TL', 'upcoming', 'competitive', 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b', 'sports-soccer', 'Son 1 Ki?i!', '2026-02-11 10:22:27'),
(4, 2, 'Basketbol Maç?', 'E?lence', 'Basketbol', NULL, '2026-02-14 13:22:27', 'Caddebostan Sahil', 6, 4, 0.00, 'TL', 'upcoming', 'friendly', 'https://images.unsplash.com/photo-1546519638-68e109498ee2', 'sports-basketball', NULL, '2026-02-11 10:22:27'),
(5, 1, 'Geçen Haftaki Maç', NULL, 'Futbol', NULL, '2026-02-04 13:27:07', '?zmir Arena', 14, 0, 0.00, 'TL', 'past', 'competitive', NULL, 'sports-soccer', NULL, '2026-02-11 10:27:07');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `event_participants`
--

CREATE TABLE `event_participants` (
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'joined',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `event_participants`
--

INSERT INTO `event_participants` (`event_id`, `user_id`, `status`, `joined_at`) VALUES
(1, 1, 'joined', '2026-02-11 10:27:07'),
(1, 2, 'joined', '2026-02-11 10:27:07'),
(1, 3, 'joined', '2026-02-11 10:27:07'),
(1, 4, 'invited', '2026-02-11 10:27:07'),
(2, 1, 'joined', '2026-02-11 10:27:07'),
(2, 2, 'joined', '2026-02-11 10:27:07'),
(3, 1, 'joined', '2026-02-11 11:10:41'),
(3, 2, 'joined', '2026-02-11 11:11:32'),
(4, 1, 'joined', '2026-02-11 11:10:58');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `match_results`
--

CREATE TABLE `match_results` (
  `event_id` int(11) NOT NULL,
  `score` varchar(20) DEFAULT NULL,
  `result` varchar(10) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `match_results`
--

INSERT INTO `match_results` (`event_id`, `score`, `result`, `details`) VALUES
(5, '5-4', 'WON', 'Çeki?meli bir maçt?, son dakikada gol att?k.');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `is_read`, `created_at`) VALUES
(1, 1, 2, 'Beyler bu hafta maç var m??', 1, '2026-02-10 10:22:27'),
(2, 1, 1, 'Evet, Cuma 20:00 ayarlad?m.', 1, '2026-02-10 14:22:27'),
(3, 1, 3, 'Ben geliyorum +1', 1, '2026-02-10 16:22:27'),
(4, 1, 3, 'Mehmet: Kaleci gelmiyor mu?', 0, '2026-02-11 10:22:27');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `related_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `related_id`, `created_at`) VALUES
(1, 1, 'invite', 'Maç Daveti', 'Ahmet Y?lmaz seni Kad?köy maç? için davet etti', 0, NULL, '2026-02-11 10:22:27'),
(2, 1, 'system', 'Eksik Oyuncu', 'Yar?nki maç için kaleci eksik.', 0, NULL, '2026-02-11 09:22:27'),
(3, 1, 'alert', 'Maç Hat?rlatmas?', 'Maç?n ba?lamas?na 2 saat kald?.', 0, NULL, '2026-02-11 08:22:27');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `captain_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `teams`
--

INSERT INTO `teams` (`id`, `name`, `logo_url`, `captain_id`, `description`, `created_at`) VALUES
(1, 'Alsancak Gücü', 'https://ui-avatars.com/api/?name=Alsancak+Gucu&background=random', 1, 'Haftal?k hal? saha ekibi.', '2026-02-11 10:27:07'),
(2, 'Kordon Spor', 'https://ui-avatars.com/api/?name=Kordon+Spor&background=random', 2, 'Basketbol ve voleybol sevenler.', '2026-02-11 10:27:07');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `team_members`
--

CREATE TABLE `team_members` (
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(20) DEFAULT 'Member',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `team_members`
--

INSERT INTO `team_members` (`team_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 'Captain', '2026-02-11 10:27:07'),
(1, 2, 'Member', '2026-02-11 10:27:07'),
(1, 3, 'Member', '2026-02-11 10:27:07'),
(2, 2, 'Captain', '2026-02-11 10:27:07'),
(2, 4, 'Member', '2026-02-11 10:27:07');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `position` varchar(50) DEFAULT 'Oyuncu',
  `level` varchar(50) DEFAULT 'Baslangic',
  `status` varchar(20) DEFAULT 'Onayli',
  `bio` text DEFAULT NULL,
  `matches_played` int(11) DEFAULT 0,
  `goals` int(11) DEFAULT 0,
  `assists` int(11) DEFAULT 0,
  `fairplay_score` decimal(3,1) DEFAULT 5.0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Tablo döküm verisi `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `avatar_url`, `position`, `level`, `status`, `bio`, `matches_played`, `goals`, `assists`, `fairplay_score`, `created_at`, `updated_at`) VALUES
(1, 'x', 'admin@alsancak.com', '$2y$12$3JGsw.U4pffVT/AzBnL/w.Ck2JELYJ9/vGK6lnrINYHDYSO8to05G', 'Abra Admin', 'https://ui-avatars.com/api/?name=Abra+Admin', 'Orta Saha', 'Pro', 'Onayli', NULL, 45, 12, 20, 5.0, '2026-02-11 10:03:18', '2026-02-11 10:59:30'),
(2, 'y', 'ahmet@test.com', '$2y$12$3JGsw.U4pffVT/AzBnL/w.Ck2JELYJ9/vGK6lnrINYHDYSO8to05G', 'Ahmet Y?lmaz', 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz', 'Forvet', 'Amatör', 'Onayli', NULL, 12, 8, 2, 5.0, '2026-02-11 10:03:18', '2026-02-11 11:11:10'),
(3, 'mehmet_demir', 'mehmet@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mehmet Demir', 'https://ui-avatars.com/api/?name=Mehmet+Demir', 'Kaleci', 'Yar? Pro', 'Onayli', NULL, 28, 0, 5, 5.0, '2026-02-11 10:03:18', '2026-02-11 10:03:18'),
(4, 'zeynep_kaya', 'zeynep@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zeynep Kaya', 'https://ui-avatars.com/api/?name=Zeynep+Kaya', 'Defans', 'Amatör', 'Onayli', NULL, 5, 1, 0, 5.0, '2026-02-11 10:03:18', '2026-02-11 10:03:18');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Tablo için indeksler `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizer_id` (`organizer_id`);

--
-- Tablo için indeksler `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`event_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Tablo için indeksler `match_results`
--
ALTER TABLE `match_results`
  ADD PRIMARY KEY (`event_id`);

--
-- Tablo için indeksler `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Tablo için indeksler `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Tablo için indeksler `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `captain_id` (`captain_id`);

--
-- Tablo için indeksler `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`team_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Tablo için AUTO_INCREMENT değeri `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Tablo için AUTO_INCREMENT değeri `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tablo için AUTO_INCREMENT değeri `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Tablo için AUTO_INCREMENT değeri `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `match_results`
--
ALTER TABLE `match_results`
  ADD CONSTRAINT `match_results_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
