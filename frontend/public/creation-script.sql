CREATE USER 'ubeers'@'localhost' IDENTIFIED BY 'ubeers';

CREATE DATABASE ubeers;

GRANT ALL PRIVILEGES ON ubeers.* TO 'ubeers'@'localhost';

USE ubeers;

CREATE TABLE `user` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(512) NOT NULL,
  `role` tinyint NOT NULL
);

CREATE TABLE `beer` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `price` float NOT NULL,
  `brewery_id` int NOT NULL
);

CREATE TABLE `beer_picture` (
  `beer_id` int NOT NULL,
  `picture_id` int NOT NULL,
  PRIMARY KEY (`beer_id`, `picture_id`)
);

CREATE TABLE `picture` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `url` varchar(150) NOT NULL
);

CREATE TABLE `brewery` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `address` varchar(200) NOT NULL,
  `profile_picture_id` int NOT NULL,
  `banner_picture_id` int NOT NULL
);

CREATE TABLE `cart_item` (
  `user_id` int NOT NULL,
  `beer_id` int NOT NULL,
  `counter` int DEFAULT 0,
  PRIMARY KEY (`user_id`, `beer_id`)
);

ALTER TABLE `beer` ADD FOREIGN KEY (`brewery_id`) REFERENCES `brewery` (`id`);

ALTER TABLE `beer_picture` ADD FOREIGN KEY (`picture_id`) REFERENCES `picture` (`id`);

ALTER TABLE `beer_picture` ADD FOREIGN KEY (`beer_id`) REFERENCES `beer` (`id`);

ALTER TABLE `cart_item` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `cart_item` ADD FOREIGN KEY (`beer_id`) REFERENCES `beer` (`id`);

ALTER TABLE `brewery` ADD FOREIGN KEY (`profile_picture_id`) REFERENCES `picture` (`id`);

ALTER TABLE `brewery` ADD FOREIGN KEY (`banner_picture_id`) REFERENCES `picture` (`id`);

