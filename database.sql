CREATE DATABASE IF NOT EXISTS plsp_one
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plsp_one;

CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(8) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  course VARCHAR(120) NOT NULL,
  year_level ENUM('1st Year','2nd Year','3rd Year','4th Year') NOT NULL,
  section VARCHAR(3) NOT NULL DEFAULT 'A',
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_student_id_format CHECK (student_id REGEXP '^[0-9]{2}-[0-9]{5}$')
);

CREATE INDEX idx_students_course_year ON students(course, year_level);
