// ==========================
// Import Dependencies
// ==========================
const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");

// ==========================
// Initialize App
// ==========================
const app = express();
const port = 5000;

// ==========================
// Frontend Server
// ==========================
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Database Connection
// ==========================
const Database = mysql.createConnection({
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

// ==========================
// Admin Login API
// ==========================
/**
 * POST /api/admin/login
 * Handles admin login by verifying username and password.
 * Logs the login attempt in the Login_log table.
 */
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
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
    const dateTime = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    console.log(`Login attempt by ${accountName} (Account ID: ${accountId}) at ${dateTime}`);
    console.log("Recording login in Login_log table");

    const insertQuery = `INSERT INTO Login_log (Account_ID) VALUES (?)`;
    Database.query(insertQuery, [accountId], function (error) {
      if (error) {
        console.error("Error recording login:", error);
      }

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

// ==========================
// Cafe Upload API
// ==========================
/**
 * POST /api/upload
 * Handles uploading cafe details and images.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Front-end/Image"));
  },
  filename: function (req, file, cb) {
    const branch = req.body.branch.replace(/\s+/g, "_");
    if (!req.fileIndex) {
      req.fileIndex = 1;
    }
    const fileExtension = path.extname(file.originalname);
    const filename = `${branch}${req.fileIndex}${fileExtension}`;
    req.fileIndex++;
    cb(null, filename);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.array("cafe_pictures", 4), (req, res) => {
  const { name, branch, province, district, pin_code, address, contact_number, open_hour, close_hour, account_id } =
    req.body;

  if (!name || !branch || !province || !district || !pin_code || !address || !contact_number || !open_hour || !close_hour || !account_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const resID = {
    Starbucks: "101",
    Amazon: "201",
    Punthai: "301",
  };

  const getLastIdQuery = `
    SELECT Restaurant_ID
    FROM Restaurant_Cafe
    WHERE Name LIKE '${name}'
    ORDER BY Restaurant_ID DESC
    LIMIT 1
  `;

  let restaurantId;
  Database.query(getLastIdQuery, (error, results) => {
    if (error) {
      console.error("Error fetching last Restaurant_ID:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0 && results[0].Restaurant_ID) {
      restaurantId = parseInt(results[0].Restaurant_ID) + 1;
    } else {
      restaurantId = resID[name];
    }

    const query = `
      INSERT INTO Restaurant_Cafe (Restaurant_ID, Name, Branch, Province, District, pin_code, Address, Contact_number, Open_hour, Close_hour, Account_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    Database.query(
      query,
      [restaurantId, name, branch, province, district, pin_code, address, contact_number, open_hour, close_hour, account_id],
      (error) => {
        if (error) {
          console.error("Error adding cafe:", error);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json({ message: "Cafe added successfully" });
      }
    );
  });
});

// ==========================
// 7. Login Logs API
// ==========================
/**
 * GET /api/login-logs
 * Retrieves login logs with pagination, search, and sorting.
 */
app.get("/api/login-logs", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const sortBy = req.query.sortBy || "login_date";
  const sortDirection = req.query.sortDirection || "desc";

  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_login_logs
    WHERE
      name LIKE ? OR
      mobile LIKE ? OR
      email LIKE ? OR
      accountId LIKE ? OR
      role LIKE ?
    ORDER BY ${sortBy} ${sortDirection === "desc" ? "DESC" : "ASC"}
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM vw_login_logs
    WHERE
      name LIKE ? OR
      mobile LIKE ? OR
      email LIKE ? OR
      accountId LIKE ? OR
      role LIKE ?
  `;

  const searchParam = `%${search}%`;

  Database.query(countQuery, [searchParam, searchParam, searchParam, searchParam, searchParam], (error, countResults) => {
    if (error) {
      console.error("Error executing count query:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const total = countResults[0].total;

    Database.query(
      query,
      [searchParam, searchParam, searchParam, searchParam, searchParam, limit, offset],
      (error, results) => {
        if (error) {
          console.error("Error executing main query:", error);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          users: results,
          total: total,
          page: page,
          limit: limit,
        });
      }
    );
  });
});

// ==========================
// Filter Option API
// ==========================
app.get("/api/filter-options", (req, res) => {
  const query = `
  SELECT
    GROUP_CONCAT(DISTINCT Name) AS names,
    GROUP_CONCAT(DISTINCT Province) AS provinces,
    GROUP_CONCAT(DISTINCT District) AS districts
  FROM 
    Restaurant_Cafe;
  `;

  Database.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching filter options:", error);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Filter options fetched successfully");
    res.json(results);
    console.log(results);
  });
})

// ==========================
// Cafe List API
// ==========================
/**
 * GET /api/cafe-list
 * Fetches a list of cafes based on search and filter criteria.
 */
app.get("/api/cafe-list", (req, res) => {
  const search = req.query.search || ""; // Search term
  const cafe = req.query.cafe || ""; // Cafe filter
  const province = req.query.province || ""; // Location filter
  const district = req.query.district || ""; // District filter

  queryParams = [`%${search}%`, `${cafe}`, `${district}`, `${province}`];
  // Base SQL query
  let query = `
    SELECT 
      Branch AS branch,
      Restaurant_ID AS id
    FROM Restaurant_Cafe
    WHERE
      Branch LIKE ? AND
      Name LIKE ? AND
      District LIKE ? AND
      Province LIKE ? 
  `;

  // // Query parameters
  // const queryParams = [];

  // // Add search filter
  // if (search) {
  //   query += ` AND (Name LIKE ? OR Branch LIKE ?)`;
  //   queryParams.push(`%${search}%`, `%${search}%`);
  // }

  // // Add cafe name filter
  // if (cafe) {
  //   query += ` AND Name = ?`;
  //   queryParams.push(cafe);
  // }

  // // Add opening hours filter
  // if (openingHours) {
  //   query += ` AND Open_hour <= ? AND Close_hour >= ?`;
  //   queryParams.push(openingHours, openingHours);
  // }

  // // Add location filter
  // if (location) {
  //   query += ` AND Province LIKE ?`;
  //   queryParams.push(`%${location}%`);
  // }

  // Execute the query
  Database.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error fetching cafe list:", error);
      return res.status(500).json({ error: "Database error" });
    }
    results.forEach((cafe) => {
      cafe.imgName = cafe.branch.replace(/\s+/g, "_"); // Replace spaces with underscores
      return cafe;
    });

    res.json(results);
  });
});

// ==========================
// 9. Start Server
// ==========================
app.listen(port, () => {
  console.log(`Server listening at Port ${port}`);
});
