-- ===== JAJONGTEE DATABASE SETUP =====
-- Run this script to create the necessary database and tables based on the provided ERD

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS jajongtee;
ALTER DATABASE jajongtee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE jajongtee;

-- Create Admin table
CREATE TABLE IF NOT EXISTS Adminn (
    Admin_ID INT PRIMARY KEY,
    Firstname VARCHAR(20) NOT NULL,
    Lastname VARCHAR(20) NOT NULL,
    Email VARCHAR(20) NOT NULL,
    Phone CHAR(10) NOT NULL
    );

-- Create Admin_Account table
CREATE TABLE IF NOT EXISTS Admin_Account (
    Account_ID INT PRIMARY KEY,
    Username VARCHAR(20) NOT NULL,
    Password VARCHAR(20) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    Admin_ID INT NOT NULL,
    FOREIGN KEY (Admin_ID) REFERENCES Adminn(Admin_ID)
);

-- Create Login_log table
CREATE TABLE IF NOT EXISTS Login_log (
    Login_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Account_ID INT NOT NULL,
    FOREIGN KEY (Account_ID) REFERENCES Admin_Account(Account_ID)
);

-- Create Restaurant_Cafe table
CREATE TABLE IF NOT EXISTS Restaurant_Cafe (
    Restaurant_ID INT PRIMARY KEY,
    Name VARCHAR(20) NOT NULL,
    Branch VARCHAR(20) NOT NULL,
    pin_code INT NOT NULL,
    Province VARCHAR(20) NOT NULL,
    District VARCHAR(20) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Contact_number CHAR(12) NOT NULL,
    Open_hour TIME NOT NULL,
    Close_hour TIME NOT NULL,
    Account_ID INT NOT NULL,
    FOREIGN KEY (Account_ID) REFERENCES Admin_Account(Account_ID)
);

-- Insert sample data for Admin
INSERT INTO Adminn (Admin_ID, Firstname, Lastname, Email, Phone) VALUES
(1, 'Chaowaphat', 'Kanjanatuangsangud', 'chaowaphat@gmail.com', '0123456789'),
(2, 'Vasuphon', 'Lastname2', 'vasuphon@gmail.com', '0123456789'),
(3, 'Nattapat', 'Lastname3', 'nattapat@gmail.com', '0123456789'),
(4, 'Thanakorn', 'Lastname4', 'thanakorn@gmail.com', '0123456789'),
(5, 'Kuntapat', 'Lastname5', 'kuntapat@gmail.com', '0123456789');

-- Insert sample data for Admin_Account
INSERT INTO Admin_Account (Account_ID, Username, Password, Role, Admin_ID) VALUES
(1111111, 'chaowaphat', 'password123', 'Super Admin', 1),
(2222222, 'vasuphon', 'password123', 'Manager', 2),
(3333333, 'nattapat', 'password123', 'Moderator', 3),
(4444444, 'thanakorn', 'password123', 'Operator', 4),
(5555555, 'kuntapat', 'password123', 'Analyst', 5);

-- Insert sample data for Login_log
-- Note: Using current dates but can be adjusted as needed
INSERT INTO Login_log (Login_log, Account_ID) VALUES
(NOW() - INTERVAL 1 HOUR, 1111111),
(NOW() - INTERVAL 2 HOUR, 2222222),
(NOW() - INTERVAL 3 HOUR, 3333333),
(NOW() - INTERVAL 1 DAY, 4444444),
(NOW() - INTERVAL 1 DAY - INTERVAL 1 HOUR, 5555555),
(NOW() - INTERVAL 3 DAY, 4444444),
(NOW() - INTERVAL 3 DAY - INTERVAL 1 HOUR, 3333333),
(NOW() - INTERVAL 4 DAY, 5555555),
(NOW() - INTERVAL 6 DAY, 4444444),
(NOW() - INTERVAL 7 DAY, 3333333),
(NOW() - INTERVAL 7 DAY - INTERVAL 1 HOUR, 2222222),
(NOW() - INTERVAL 5 DAY, 1111111),
(NOW() - INTERVAL 6 DAY - INTERVAL 1 HOUR, 5555555),
(NOW() - INTERVAL 5 DAY - INTERVAL 1 HOUR, 2222222);

-- Insert sample data for Restaurant_Cafe
INSERT INTO Restaurant_Cafe (Restaurant_ID, Name, Branch, Province, District, pin_code, Address, Contact_number, Open_hour, Close_hour, Account_ID) VALUES
(101, 'Starbucks', 'Camp Davis', 'Bangkok', 'Sukhumvit', 10110, '88, Camp Davis, Sukhumvit 24 Khlongtan Khlong Toei Bangkok 10110', '+66844387343', '06:30:00', '21:00:00', 1111111);



-- Display created tables
SHOW TABLES;

-- Display sample data
SELECT 'Admin_Account Table:' AS '';
SELECT * FROM Admin_Account;

SELECT 'Admin Table:' AS '';
SELECT * FROM Adminn;

SELECT 'Login_log Table:' AS '';
SELECT * FROM Login_log;

SELECT 'Restaurant_Cafe Table:' AS '';
SELECT * FROM Restaurant_Cafe;

-- Create a view for login log information with admin details
CREATE OR REPLACE VIEW vw_login_logs AS
SELECT
    l.Login_log AS login_date,
    a.Admin_ID AS id,
    CONCAT(a.Firstname, ' ', a.Lastname) AS name,
    a.Phone AS mobile,
    a.Email AS email,
    ac.Account_ID AS accountId,
    ac.Role AS role
FROM
    Login_log l
JOIN
    Admin_Account ac ON l.Account_ID = ac.Account_ID
JOIN
    Adminn a ON a.Admin_ID = ac.Admin_ID
ORDER BY
    l.Login_log DESC;

-- Display the view
SELECT 'Login Logs View:' AS '';
SELECT * FROM vw_login_logs;


SELECT * FROM vw_login_logs
WHERE
    name LIKE '%' OR
    email LIKE '%' OR
    accountId LIKE '%' OR
    role LIKE '%'
ORDER BY login_date DESC
LIMIT 10 OFFSET 0;

SHOW FULL COLUMNS FROM vw_login_logs;