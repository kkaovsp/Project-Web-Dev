const port = 5000;
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database
var Database = mysql.createConnection({
    host : 'localhost',
    user : 'itcs223',
    password : 'itCS223**',
    database : 'tinycollege'
    });
Database.connect(function(err){
    if(err) throw err;
    console.log(`Connected DB :)`);
    });

let options = {
    method: "GET", // HTTP method (e.g., GET, POST, PUT, DELETE)
    headers: {"Content-Type": "application/json",},
};

//Homepage
app.get('/', (req, res) => {
    console.log('Request at ', req.url);
    // res.send('Hello World');
    let query = `select * from professor where EMP_NUM = '155' or EMP_FNAME = 'Robert'`;
    Database.query( query, function (error, results) {
        if (error) throw error;
        console.log(`${results.length} rows returned`);
        if(results.length > 0){
            console.log('Found')
        }else{
            console.log('Not Found')
            return res.sendFile(__dirname + '/html/notfound.html')
        }
        return res.send(results);
   });
});

app.get("/api/data", async (req, res) => {
    try {
        const response = await fetch("http://localhost:5000", options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse JSON response
        res.json(data); // Send the parsed data as JSON
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
});

//Invalid
app.use((req, res, next) => {
    console.log("404: Invalid accessed");
    res.status(404).send("Invalid Path");
});

// ===== INSTRUCTIONS FOR UPDATING BACKEND SERVER.JS =====
// Add the following API endpoint to your backend server.js file:

// API endpoint to get login logs
app.get("/api/login-logs", (req, res) => {
    console.log("Request for login logs at", req.url);
  
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "loginDate";
    const sortDirection = req.query.sortDirection || "desc";
  
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
  
    // Build the SQL query with search and sorting
    let query = `
          SELECT
              u.id,
              u.name,
              u.mobile,
              u.email,
              u.account_id AS accountId,
              u.role,
              l.login_date AS loginDate,
              CASE WHEN l.logout_date IS NULL THEN 'Active' ELSE 'Offline' END AS status
          FROM
              users u
          JOIN
              login_logs l ON u.id = l.user_id
          WHERE
              u.name LIKE ? OR
              u.email LIKE ? OR
              u.account_id LIKE ? OR
              u.role LIKE ?
          ORDER BY
              ${sortBy} ${sortDirection === "desc" ? "DESC" : "ASC"}
          LIMIT ? OFFSET ?
      `;
  
    // Count query to get total number of records
    let countQuery = `
          SELECT
              COUNT(*) AS total
          FROM
              users u
          JOIN
              login_logs l ON u.id = l.user_id
          WHERE
              u.name LIKE ? OR
              u.email LIKE ? OR
              u.account_id LIKE ? OR
              u.role LIKE ?
      `;
  
    // Search parameter with wildcards
    const searchParam = `%${search}%`;
  
    // Execute the count query first
    Database.query(
      countQuery,
      [searchParam, searchParam, searchParam, searchParam],
      function (error, countResults) {
        if (error) {
          console.error("Error executing count query:", error);
          return res.status(500).json({ error: "Database error" });
        }
  
        const total = countResults[0].total;
  
        // Execute the main query
        Database.query(
          query,
          [searchParam, searchParam, searchParam, searchParam, limit, offset],
          function (error, results) {
            if (error) {
              console.error("Error executing main query:", error);
              return res.status(500).json({ error: "Database error" });
            }
  
            // If no results, return empty array
            if (results.length === 0) {
              return res.json({
                users: [],
                total: total,
                page: page,
                limit: limit,
              });
            }
  
            // Return the results
            return res.json({
              users: results,
              total: total,
              page: page,
              limit: limit,
            });
          },
        );
      },
    );
  });
  
  // ===== DATABASE SCHEMA UPDATES =====
  // You'll need to create the following tables in your MySQL database:
  
  /*
  CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      mobile VARCHAR(20),
      email VARCHAR(100) NOT NULL,
      account_id VARCHAR(20) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS login_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      login_date TIMESTAMP NOT NULL,
      logout_date TIMESTAMP NULL,
      ip_address VARCHAR(50),
      device_info TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  -- Sample data for testing
  INSERT INTO users (name, mobile, email, account_id, role) VALUES
  ('Chaowaphat', '0123456789', 'Chaowaphat@gmail.com', '1111111', 'Super Admin'),
  ('Vasuphon', '0123456789', 'Vasuphon@gmail.com', '2222222', 'Manager'),
  ('Nattapat', '0123456789', 'Nattapat@gmail.com', '3333333', 'Moderator'),
  ('Thanakorn', '0123456789', 'Thanakorn@gmail.com', '4444444', 'Operator'),
  ('Kuntapat', '0123456789', 'Kuntapat@gmail.com', '5555555', 'Analyst');
  
  -- Sample login logs
  INSERT INTO login_logs (user_id, login_date, logout_date) VALUES
  (1, '2023-03-01 18:00:00', NULL),
  (2, '2023-03-01 17:00:00', NULL),
  (3, '2023-03-01 17:30:00', NULL),
  (4, '2023-02-28 17:00:00', '2023-02-28 18:00:00'),
  (5, '2023-02-28 17:00:00', '2023-02-28 18:00:00'),
  (4, '2023-02-26 17:00:00', '2023-02-26 18:00:00'),
  (3, '2023-02-26 17:30:00', NULL),
  (5, '2023-02-25 17:00:00', '2023-02-25 18:00:00'),
  (4, '2023-02-23 17:00:00', '2023-02-23 18:00:00'),
  (3, '2023-02-22 17:30:00', NULL),
  (2, '2023-02-22 17:00:00', NULL),
  (1, '2023-02-24 18:00:00', NULL),
  (5, '2023-02-23 17:00:00', '2023-02-23 18:00:00'),
  (2, '2023-02-24 17:00:00', NULL);
  
  -- Create indexes for better query performance
  CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
  CREATE INDEX idx_login_logs_login_date ON login_logs(login_date);
  CREATE INDEX idx_users_role ON users(role);
  CREATE INDEX idx_users_name ON users(name);
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_account_id ON users(account_id);
  */
  
  // API endpoint to get active users count
  app.get("/api/active-users-count", (req, res) => {
    console.log("Request for active users count");
  
    const query = `
          SELECT
              COUNT(*) AS activeUsers
          FROM
              login_logs
          WHERE
              logout_date IS NULL
      `;
  
    Database.query(query, function (error, results) {
      if (error) {
        console.error("Error getting active users count:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      return res.json({ activeUsers: results[0].activeUsers });
    });
  });
  
  // API endpoint to get total logins today
  app.get("/api/total-logins-today", (req, res) => {
    console.log("Request for total logins today");
  
    const query = `
          SELECT
              COUNT(*) AS totalLogins
          FROM
              login_logs
          WHERE
              DATE(login_date) = CURDATE()
      `;
  
    Database.query(query, function (error, results) {
      if (error) {
        console.error("Error getting total logins today:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      return res.json({ totalLogins: results[0].totalLogins });
    });
  });
  
  // API endpoint to get user details by ID
  app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    console.log(`Request for user details with ID: ${userId}`);
  
    const query = `
          SELECT
              id,
              name,
              mobile,
              email,
              account_id AS accountId,
              role,
              created_at AS createdAt
          FROM
              users
          WHERE
              id = ?
      `;
  
    Database.query(query, [userId], function (error, results) {
      if (error) {
        console.error("Error getting user details:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      return res.json(results[0]);
    });
  });
  
  // API endpoint to get login history for a specific user
  app.get("/api/users/:id/login-history", (req, res) => {
    const userId = req.params.id;
    console.log(`Request for login history of user with ID: ${userId}`);
  
    const query = `
          SELECT
              id,
              login_date AS loginDate,
              logout_date AS logoutDate,
              ip_address AS ipAddress,
              device_info AS deviceInfo
          FROM
              login_logs
          WHERE
              user_id = ?
          ORDER BY
              login_date DESC
          LIMIT 50
      `;
  
    Database.query(query, [userId], function (error, results) {
      if (error) {
        console.error("Error getting user login history:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      return res.json(results);
    });
  });
  

// Server listening
app.listen(port, function () {
    console.log("Server listening at Port "+ port);});
