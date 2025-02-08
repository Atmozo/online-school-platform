-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: online_learning_platform
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'JavaScript Basics','Learn the basics of JavaScript',1,'2025-01-27 11:15:04'),(2,'TypeScript Basics','Learn the basics of TS',1,'2025-01-27 11:15:38'),(3,'React Basics','Learn the basics of React',1,'2025-01-27 11:16:03'),(4,'JAVA Basics','Learn the basics of JAVA',1,'2025-01-28 08:11:56'),(12,'Python for Data Science','Explore Python\'s capabilities in data analysis and machine learning.',1,'2025-01-28 08:35:00'),(13,'Intro to JavaScript','Basic JavaScript course.',2,'2025-01-30 09:43:29');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `completed_lessons` int DEFAULT '0',
  `total_lessons` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,1,'Introduction to JavaScript','What is JavaScript and how does it work?','2025-01-28 08:23:48','2025-01-28 08:23:48'),(2,1,'Variables and Data Types','Understanding variables and data types in JavaScript.','2025-01-28 08:23:48','2025-01-28 08:23:48'),(3,2,'Introduction to React','What is React and why is it used?','2025-01-28 08:23:48','2025-01-28 08:23:48'),(4,2,'React Components','Learn about functional and class components in React.','2025-01-28 08:23:48','2025-01-28 08:23:48'),(5,1,'Test Lesson',NULL,'2025-01-28 14:11:12','2025-01-28 14:11:12'),(6,1,'JavaScript Basics','Introduction to JavaScript concepts.','2025-01-30 09:44:56','2025-01-30 09:44:56'),(7,1,'Advanced JavaScript','Deeper look into JavaScript.','2025-01-30 09:44:56','2025-01-30 09:44:56');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `options`
--

DROP TABLE IF EXISTS `options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` VALUES (1,1,'Declares a variable'),(2,1,'Declares a function'),(3,1,'Creates a constant'),(4,1,'None of the above'),(5,2,'Netscape'),(6,2,'Microsoft'),(7,2,'Google'),(8,2,'Apple'),(9,3,'Declares a variable'),(10,3,'Declares a function'),(11,3,'Creates a constant'),(12,3,'None of the above'),(13,4,'var'),(14,4,'let'),(15,4,'const'),(16,4,'define'),(17,5,'shift()'),(18,5,'pop()'),(19,5,'splice()'),(20,5,'removeLast()'),(21,6,'Netscape'),(22,6,'Microsoft'),(23,6,'Google'),(24,6,'Apple'),(25,7,'Number'),(26,7,'Float'),(27,7,'Character'),(28,7,'Word'),(29,8,'\'array\''),(30,8,'\'object\''),(31,8,'\'list\''),(32,8,'\'undefined\''),(33,9,'//'),(34,9,'/* */'),(35,9,'#'),(36,9,'--'),(37,10,'4'),(38,10,'22'),(39,10,'NaN'),(40,10,'Error'),(41,11,'parseInt()'),(42,11,'parseFloat()'),(43,11,'toInteger()'),(44,11,'Number()'),(45,12,'break'),(46,12,'stop'),(47,12,'exit'),(48,12,'return'),(49,13,'() => {}'),(50,13,'function => {}'),(51,13,'function() => {}'),(52,13,'function() {}'),(53,14,'=='),(54,14,'!='),(55,14,'==='),(56,14,'!=='),(57,15,'Refers to the global object'),(58,15,'Refers to the current object'),(59,15,'Creates a new object'),(60,15,'None of the above'),(61,16,'push()'),(62,16,'unshift()'),(63,16,'shift()'),(64,16,'concat()'),(65,17,'null'),(66,17,'0'),(67,17,'undefined'),(68,17,'NaN'),(69,18,'for'),(70,18,'while'),(71,18,'do...while'),(72,18,'foreach'),(73,19,'JSON.parse()'),(74,19,'JSON.stringify()'),(75,19,'JSON.toObject()'),(76,19,'JSON.convert()'),(77,20,'JSON.parse()'),(78,20,'JSON.stringify()'),(79,20,'JSON.toString()'),(80,20,'JSON.convert()'),(81,21,'\'NaN\''),(82,21,'\'undefined\''),(83,21,'\'number\''),(84,21,'\'string\''),(85,22,'order()'),(86,22,'sort()'),(87,22,'arrange()'),(88,22,'sorted()'),(89,23,'Declares a variable'),(90,23,'Declares a constant'),(91,23,'Declares a function'),(92,23,'None of the above'),(93,24,'var'),(94,24,'let'),(95,24,'const'),(96,24,'block'),(97,25,'parseInt()'),(98,25,'parseFloat()'),(99,25,'toInt()'),(100,25,'Number()'),(101,26,'=='),(102,26,'==='),(103,26,'='),(104,26,'!='),(105,27,'Converts an object to a JSON string'),(106,27,'Parses a JSON string into an object'),(107,27,'Converts a number to a string'),(108,27,'None of the above'),(109,28,'4'),(110,28,'22'),(111,28,'NaN'),(112,28,'Error'),(113,29,'shift()'),(114,29,'pop()'),(115,29,'slice()'),(116,29,'delete()'),(117,30,'size()'),(118,30,'length()'),(119,30,'len()'),(120,30,'count()'),(121,31,'It refers to the current object'),(122,31,'It creates a new object'),(123,31,'It refers to the global object'),(124,31,'None of the above'),(125,32,'push()'),(126,32,'pop()'),(127,32,'shift()'),(128,32,'unshift()'),(129,33,'A function with its lexical scope'),(130,33,'A new kind of variable'),(131,33,'An object'),(132,33,'None of the above'),(133,34,'Variable declarations are moved to the top'),(134,34,'Function definitions are moved to the top'),(135,34,'Both variable declarations and function definitions are moved to the top'),(136,34,'None of the above'),(137,35,'It enables more errors to be thrown'),(138,35,'It prevents certain actions and throws more exceptions'),(139,35,'It helps in debugging'),(140,35,'All of the above'),(141,36,'Array.isArray()'),(142,36,'typeof'),(143,36,'instanceof'),(144,36,'isArray()'),(145,37,'The global object'),(146,37,'undefined'),(147,37,'The function itself'),(148,37,'The object that called the function'),(149,38,'true'),(150,38,'false'),(151,38,'undefined'),(152,38,'NaN'),(153,39,'String'),(154,39,'Number'),(155,39,'Boolean'),(156,39,'Object'),(157,40,'+'),(158,40,'&&'),(159,40,'||'),(160,40,'concat()'),(161,41,'\'null\''),(162,41,'\'object\''),(163,41,'\'undefined\''),(164,41,'\'number\''),(165,42,'toLowerCase()'),(166,42,'toUpperCase()'),(167,42,'toString()'),(168,42,'convert()');
/*!40000 ALTER TABLE `options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question` text NOT NULL,
  `correct_answer` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'What does var do in JavaScript?','Declares a variable'),(2,1,'Which company developed JavaScript?','Netscape'),(3,2,'What does \'let\' do in JavaScript?','Declares a variable'),(4,2,'What keyword is used to define a constant variable in JavaScript?','const'),(5,2,'Which method is used to remove the last element from an array?','pop()'),(6,2,'Which company developed JavaScript?','Netscape'),(7,2,'Which of the following is a JavaScript data type?','Number'),(8,2,'What does the \'typeof\' operator return for an array?','\'object\''),(9,2,'Which symbol is used for comments in JavaScript?','//'),(10,2,'What is the result of \'2\' + 2 in JavaScript?','22'),(11,2,'Which function is used to parse a string to an integer?','parseInt()'),(12,2,'Which statement is used to stop a loop?','break'),(13,2,'What is the correct way to declare an arrow function?','() => {}'),(14,2,'Which operator is used for strict comparison?','==='),(15,2,'What is the purpose of the \'this\' keyword?','Refers to the current object'),(16,2,'Which method adds one or more elements to the beginning of an array?','unshift()'),(17,2,'What is the default value of an uninitialized variable in JavaScript?','undefined'),(18,2,'Which loop is guaranteed to execute at least once?','do...while'),(19,2,'Which method is used to convert JSON to a JavaScript object?','JSON.parse()'),(20,2,'Which method converts a JavaScript object to a JSON string?','JSON.stringify()'),(21,2,'What will `console.log(typeof NaN)` return?','\'number\''),(22,2,'Which built-in method sorts the elements of an array?','sort()'),(23,3,'What does the \'var\' keyword do in JavaScript?','Declares a variable'),(24,3,'Which keyword is used to declare a block-scoped variable?','let'),(25,3,'What is the correct way to convert a string to an integer in JavaScript?','parseInt()'),(26,3,'Which operator is used for strict equality in JavaScript?','==='),(27,3,'What does JSON.stringify() do?','Converts an object to a JSON string'),(28,3,'What will \'2\' + 2 evaluate to in JavaScript?','22'),(29,3,'Which method removes the last element from an array?','pop()'),(30,3,'Which built-in method returns the length of a string?','length()'),(31,3,'What is the purpose of the \'this\' keyword in JavaScript?','It refers to the current object'),(32,3,'Which method is used to add an element to the end of an array?','push()'),(33,1,'What is a closure in JavaScript?','A function with its lexical scope'),(34,1,'What is hoisting in JavaScript?','Both variable declarations and function definitions are moved to the top'),(35,1,'What is the purpose of the \'strict mode\' in JavaScript?','It prevents certain actions and throws more exceptions'),(36,1,'Which method is used to check if a variable is an array?','Array.isArray()'),(37,1,'What does the \'this\' keyword refer to in a regular function (not an arrow function) in strict mode?','undefined'),(38,1,'What is the output of \'console.log(0.1 + 0.2 === 0.3)\' in JavaScript?','false'),(39,1,'Which of the following is not a primitive data type in JavaScript?','Object'),(40,1,'Which operator is used to concatenate strings in JavaScript?','+'),(41,1,'What is the output of \'typeof null\'?','\'object\''),(42,1,'Which method converts a string to lowercase in JavaScript?','toLowerCase()');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,'JavaScript Basics Quiz',1,'2025-02-03 20:37:07'),(2,'Advanced JavaScript Quiz',1,'2025-02-04 08:39:35'),(3,'JavaScript Beginners Quiz ',1,'2025-02-04 12:34:12');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `type` enum('video','pdf','link') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,1,'JavaScript Basics','https://youtu.be/xwKbtUP87Dk?si=OsyleAy8Ikag9NGY','video','2025-01-30 09:05:59','2025-02-07 08:33:47'),(2,1,'JS Documentation','https://developer.mozilla.org','link','2025-01-30 09:05:59','2025-01-30 09:05:59'),(3,2,'React Tutorial','https://reactjs.org/tutorial','pdf','2025-01-30 09:05:59','2025-01-30 09:05:59'),(4,2,'JavaScript Advanced Video','https://youtu.be/R9I85RhI7Cg?si=0LhqUediGqaJJAyR','video','2025-01-30 09:49:15','2025-02-07 08:33:48'),(5,2,'JavaScript Advanced Video','https://example.com/js-advanced.mp4','video','2025-01-30 09:51:04','2025-01-30 09:51:04');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,2,'Submit Assignment','Submit the final project assignment.','pending','2025-01-30 09:38:22'),(2,2,'Complete First Course','Finish the first course and mark it as done.','pending','2025-01-30 09:42:11');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) NOT NULL,
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testuser','$2a$10$1K3fkbM.FWqFb7H1cmRyOeYgsLG5O.y96FM.kv9BL0.3hebQmA5xW','2025-01-27 11:12:54','',NULL,NULL),(2,'Test User','$2a$10$A81AKYTLI.k2/YMcFAU3v.ty755yXNn90SMu8BH9Tnke.WN96qspu','2025-01-30 09:20:09','test@example.com',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-07 14:53:41
