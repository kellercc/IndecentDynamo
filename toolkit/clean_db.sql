-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 19, 2010 at 11:04 PM
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `cake`
--
DROP DATABASE `cake`;
CREATE DATABASE `cake` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `cake`;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL,
  `body` text,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `body`, `created`, `modified`) VALUES
(1, 'The title', 'This is the post body.', '2010-10-19 22:51:38', NULL),
(2, 'A title once again', 'And the post body follows.', '2010-10-19 22:51:38', NULL),
(3, 'Title strikes back', 'This is really exciting! Not.', '2010-10-19 22:51:38', NULL);
