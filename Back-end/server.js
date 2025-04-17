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
  headers: { "Content-Type": "application/json", },
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

// API endpoint for admin login
// This endpoint handles the login process for admin users
// It checks the provided username and password against the database and returns user info if successful
// It also records the login attempt in the Login_log table
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  // Extract username and password from the request body
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // SQL query to check if the username and password match any record in the database
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
              Adminn a ON ac.Admin_ID = a.Admin_ID
          WHERE
              ac.Username = ? AND ac.Password = ?
      `;

  Database.query(query, [username, password], function (error, results) {
    if (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("Invalid username or password");
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const accountId = results[0].Account_ID;
    const accountName = results[0].Username;
    console.log(`Login attempt by ${accountName} (Account ID: ${accountId}) at ${new Date().toISOString()}`);
    console.log("Recording login in Login_log table");

    // Record the login in the Login_log table
    // This is a separate query to log the login attempt
    // It inserts a new record into the Login_log table with the Account_ID of the user who logged in
    const insertQuery = `INSERT INTO Login_log (Account_ID) VALUES (?)`;
    Database.query(insertQuery, [accountId], function (error) {
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


// API endpoint to get login logs with pagination, search, and sorting
// This endpoint retrieves login logs from the database and returns them in a paginated format
// It allows searching by name, email, account ID, and role
app.get("/api/login-logs", (req, res) => {
  console.log("Request at ", req.url);

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
      mobile LIKE ? OR
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
      mobile LIKE ? OR
      email LIKE ? OR
      accountId LIKE ? OR
      role LIKE ?
`;

  // Search parameter with wildcards
  const searchParam = `%${search}%`;

  // Execute the count query first
  Database.query(
    countQuery,
    [searchParam, searchParam, searchParam, searchParam, searchParam],
    function (error, countResults) {
      if (error) {
        console.error("Error executing count query:", error);
        return res.status(500).json({ error: "Database error" });
      }

      const total = countResults[0].total;

      // Execute the main query
      Database.query(
        query,
        [searchParam, searchParam, searchParam, searchParam, searchParam, limit, offset],
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

// Invalid path handler
app.use((req, res, next) => {
  console.log("404: Invalid accessed");
  res.status(404).send("Invalid Path");
});

// Server listening
app.listen(port, function () {
  console.log("Server listening at Port " + port);
});
