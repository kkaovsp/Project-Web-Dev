const port = 5000;
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
var Database = mysql.createConnection({
  host: "localhost",
  user: "jajongtee", // Use your MySQL username
  password: "folkrakj", // Use your MySQL password
  database: "jajongtee", // The new database name
});

Database.connect(function (err) {
  if (err) {
    console.error("Error connecting to database:", err);
    throw err;
  }
  console.log("Connected to jajongtee database successfully");
});

let options = {
    method: "GET", // HTTP method (e.g., GET, POST, PUT, DELETE)
    headers: {"Content-Type": "application/json",},
};

// Home page
app.get("/", (req, res) => {
  console.log("Request at ", req.url);
  let query = `SELECT * FROM Adminn WHERE Admin_ID = 1`;
  Database.query(query, function (error, results) {
    if (error) throw error;
    console.log(`${results.length} rows returned`);
    if (results.length > 0) {
      console.log("Found");
    } else {
      console.log("Not Found");
      return res.sendFile(__dirname + "/html/notfound.html");
    }
    return res.send(results);
  });
});


// app.get("/api/data", async (req, res) => {
//     try {
//         const response = await fetch("http://localhost:5000", options);
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json(); // Parse JSON response
//         res.json(data); // Send the parsed data as JSON
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("Error fetching data");
//     }
// });


// API endpoint to get login logs
app.get("/api/login-logs", (req, res) => {
    console.log("Request for login logs at", req.url);
  
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "login_date";
    const sortDirection = req.query.sortDirection || "desc";
  
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
  
    // Build the SQL query with search and sorting
  let query = `
  SELECT * FROM vw_login_logs
  WHERE
      name LIKE ? OR
      email LIKE ? OR
      accountId LIKE ? OR
      role LIKE ?
  ORDER BY
      ${sortBy} ${sortDirection === "desc" ? "DESC" : "ASC"}
  LIMIT ? OFFSET ?
`;
  
    // Count query to get total number of records
  let countQuery = `
  SELECT
      COUNT(*) AS total
  FROM
      vw_login_logs
  WHERE
      name LIKE ? OR
      email LIKE ? OR
      accountId LIKE ? OR
      role LIKE ?
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
  
  
  // API endpoint to get total logins today
  app.get("/api/total-logins-today", (req, res) => {
    console.log("Request for total logins today");
  
    const query = `
          SELECT
              COUNT(*) AS totalLogins
          FROM
              Login_log
          WHERE
              DATE(Login_log) = CURDATE()
      `;
  
    Database.query(query, function (error, results) {
      if (error) {
        console.error("Error getting total logins today:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      return res.json({ totalLogins: results[0].totalLogins });
    });
  });
  
  // API endpoint to get admin details by ID
  app.get("/api/admin/:id", (req, res) => {
    const adminId = req.params.id;
    console.log(`Request for admin details with ID: ${adminId}`);
  
    const query = `
          SELECT
              a.Admin_ID AS id,
              a.Firstname,
              a.Lastname,
              a.Email AS email,
              a.Phone AS mobile,
              ac.Account_ID AS accountId,
              ac.Role AS role
          FROM
              Admin a
          JOIN
              Admin_Account ac ON ac.Account_ID = (
                  SELECT r.Account_ID
                  FROM Restaurant_Cafe r
                  WHERE r.Account_ID = ac.Account_ID
                  LIMIT 1
              )
          WHERE
              a.Admin_ID = ?
      `;
  
    Database.query(query, [adminId], function (error, results) {
      if (error) {
        console.error("Error getting admin details:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      return res.json(results[0]);
    });
  });
  
  // API endpoint to get login history for a specific admin
  app.get("/api/admin/:id/login-history", (req, res) => {
    const adminId = req.params.id;
    console.log(`Request for login history of admin with ID: ${adminId}`);
  
    const query = `
          SELECT
              Log_ID AS id,
              Login_log AS loginDate
          FROM
              Login_log
          WHERE
              Admin_ID = ?
          ORDER BY
              Login_log DESC
          LIMIT 50
      `;
  
    Database.query(query, [adminId], function (error, results) {
      if (error) {
        console.error("Error getting admin login history:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      return res.json(results);
    });
  });
  
  // API endpoint for admin login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
  
    const query = `
          SELECT
              ac.Account_ID,
              ac.Username,
              ac.Role,
              a.Admin_ID,
              a.Firstname,
              a.Lastname,
              a.Email,
              a.Phone
          FROM
              Admin_Account ac
          JOIN
              Admin a ON ac.Account_ID = (
                  SELECT r.Account_ID
                  FROM Restaurant_Cafe r
                  WHERE r.Account_ID = ac.Account_ID
                  LIMIT 1
              )
          WHERE
              ac.Username = ? AND ac.Password = ?
      `;
  
    Database.query(query, [username, password], function (error, results) {
      if (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Database error" });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
  
      // Record the login in the Login_log table
      const adminId = results[0].Admin_ID;
      const insertQuery = `INSERT INTO Login_log (Admin_ID) VALUES (?)`;
  
      Database.query(insertQuery, [adminId], function (error) {
        if (error) {
          console.error("Error recording login:", error);
          // Continue anyway, this shouldn't block the login process
        }
  
        // Return user info without the password
        const user = results[0];
        delete user.Password;
  
        return res.json({
          success: true,
          message: "Login successful",
          user: user,
        });
      });
    });
  });
  
  // Invalid path handler
  app.use((req, res, next) => {
    console.log("404: Invalid accessed");
    res.status(404).send("Invalid Path");
  });
  
  // Server listening
  app.listen(port, function () {
    console.log("Server listening at Port " + port);
  });
  