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
// Middleware Configuration
// ==========================
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:5000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Database Connection
// ==========================
const Database = mysql.createConnection({
  host: "localhost",
  user: "jajongtee",
  password: "folkrakj",
  database: "jajongtee",
});

Database.connect(function (err) {
  if (err) {
    console.error("Error connecting to database:", err);
    throw err;
  }
  console.log("Connected to jajongtee database successfully");
});

// ==========================
// Authentication APIs
// ==========================

// Testing Admin Login - Success Case
// method: POST
// URL: http://localhost:5000/api/admin/login
// body: raw JSON
// {
//     "username": "chaowaphat",
//     "password": "password123"
// }
//
// Testing Admin Login - Failed Case
// method: POST
// URL: http://localhost:5000/api/admin/login
// body: raw JSON
// {
//     "username": "wronguser",
//     "password": "wrongpass"
// }
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
        accountId: accountId,
      });
    });
  });
});

// ==========================
// Login Logs API
// ==========================

// Testing Get Login Logs - Default Page
// method: GET
// URL: http://localhost:5000/api/login-logs?page=1&limit=10&search=&sortBy=login_date&sortDirection=desc
//
// Testing Get Login Logs - With Pagination and Search
// method: GET
// URL: http://localhost:5000/api/login-logs?page=1&limit=10&search=chaowaphat&sortBy=login_date&sortDirection=desc
app.get("/api/login-logs", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const sortBy = req.query.sortBy || "login_date";
  const sortDirection = req.query.sortDirection || "desc";

  const offset = (page - 1) * limit;

  console.log(req.url);
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
// Cafe Management APIs
// ==========================

// Testing Get Filter Options
// method: GET
// URL: http://localhost:5000/api/filter-options

// This one just for it to get the data of cafe name, province, and district
// to use as filter options dynamically, so it has only one test case possible
app.get("/api/filter-options", async (req, res) => {
  try {
    const [names] = await Database.promise().query("SELECT DISTINCT Name AS name FROM Restaurant_Cafe");
    const [provinces] = await Database.promise().query("SELECT DISTINCT Province AS province FROM Restaurant_Cafe");
    const [districts] = await Database.promise().query("SELECT DISTINCT District AS district FROM Restaurant_Cafe");

    res.json({
      names: names.map(row => row.name),
      provinces: provinces.map(row => row.province),
      districts: districts.map(row => row.district),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Testing Get All Cafes - No Filter
// method: GET
// URL: http://localhost:5000/api/cafes?search=&cafe=%&province=%&district=%
//
// Testing Get Cafes - With Filters
// method: GET
// URL: http://localhost:5000/api/cafes?cafe=Starbucks&province=Bangkok&district=Khlong Toei
app.get("/api/cafes", (req, res) => {
  const search = req.query.search || "";
  const cafe = req.query.cafe || "";
  const province = req.query.province || "";
  const district = req.query.district || "";
  console.log(req.url);
  queryParams = [`%${search}%`, `${cafe}`, `${district}`, `${province}`];
  
  const query = `
    SELECT 
      Name as name,
      Branch AS branch,
      Restaurant_ID AS id,
      Address AS address
    FROM Restaurant_Cafe
    WHERE
      Branch LIKE ? AND
      Name LIKE ? AND
      District LIKE ? AND
      Province LIKE ? 
  `;

  Database.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error fetching cafe list:", error);
      return res.status(500).json({ error: "Database error" });
    }
    
    results.forEach((cafe) => {
      cafe.imgName = cafe.branch.replace(/\s+/g, "_");
      cafe.imgName = `${cafe.name}_${cafe.imgName}`;
      return cafe;
    });

    res.json(results);
  });
});

// Testing Get Single Cafe - Success
// method: GET
// URL: http://localhost:5000/api/cafes/101
//
// Testing Get Non-existent Cafe
// method: GET
// URL: http://localhost:5000/api/cafes/999
app.get("/api/cafes/:id", (req, res) => {
  const cafeId = req.params.id;

  const query = `
    SELECT 
      Branch AS branch,
      Address AS address,
      Open_hour AS open_hour,
      Close_hour AS close_hour,
      Name AS name,
      Province AS province,
      District AS district,
      pin_code AS pincode,
      Contact_number as contact   
    FROM 
      Restaurant_Cafe
    WHERE
      Restaurant_ID = ?
  `;

  console.log("Getting Details Cafe with ID:", cafeId);
  Database.query(query, [cafeId], (error, results) => {
    if (error) {
      console.error("Error fetching cafe details:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    const cafe = results[0];
    cafe.imgName = cafe.branch.replace(/\s+/g, "_");
    cafe.imgName = `${cafe.name}_${cafe.imgName}`;

    console.log(cafe);
    res.json(cafe);
  });
});

// Testing Delete Cafe - Success
// method: DELETE
// URL: http://localhost:5000/api/cafes/101
//
// Testing Delete Non-existent Cafe
// method: DELETE
// URL: http://localhost:5000/api/cafes/999
app.delete("/api/cafes/:id", (req, res) => {
  const cafeId = req.params.id;

  const getCafeQuery = `
    SELECT 
      Branch as branch,
      Name as name
    FROM 
      Restaurant_Cafe 
    WHERE 
      Restaurant_ID = ?`;

  Database.query(getCafeQuery, [cafeId], (err, results) => {
    if (err) {
      console.error("Error fetching cafe:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    const imageName = `${results[0].name}_${results[0].branch.replace(/\s+/g, "_")}`;
    try {
      for (let i = 1; i <= 4; i++) {
        const imagePath = path.join(__dirname, "../Front-end/Image", `${imageName}${i}.jpg`);
        fs.unlinkSync(imagePath);
        console.log(`Deleted image: ${imageName}${i}.jpg`);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      return res.status(500).json({ error: "Failed to delete images. Cafe not deleted." });
    }
  });

  const deleteQuery = `DELETE FROM Restaurant_Cafe WHERE Restaurant_ID = ?`;
  console.log("Deleting cafe with ID:", cafeId);
  Database.query(deleteQuery, [cafeId], (error, results) => {
    if (error) {
      console.error("Error deleting cafe:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    res.status(200).json({ message: "Cafe deleted successfully" });
  });
});

// ==========================
// File Upload Configuration
// ==========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Front-end/Image"));
  },
  filename: function (req, file, cb) {
    const branch = req.body.branch.replace(/\s+/g, "_");
    const cafe = req.body.name;

    if (!req.fileIndex) {
      req.fileIndex = 1;
    }
    const fileExtension = path.extname(file.originalname);
    const filename = `${cafe}_${branch}${req.fileIndex}${fileExtension}`;
    req.fileIndex++;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Testing Create New Cafe - Success
// method: POST
// URL: http://localhost:5000/api/cafes
// body: form-data
// {
//     "name": "Starbucks",
//     "branch": "Test Branch",
//     "province": "Bangkok",
//     "district": "Sathon",
//     "pin_code": "10120",
//     "address": "123 Test Street",
//     "contact_number": "0123456789",
//     "open_hour": "07:00:00",
//     "close_hour": "22:00:00",
//     "account_id": "1111111",
//     "cafe_pictures": [file1.jpg, file2.jpg, file3.jpg, file4.jpg]
// }
//
// Testing Create Cafe - Missing Required Fields
// method: POST
// URL: http://localhost:5000/api/cafes
// body: form-data
// {
//     "name": "Starbucks",
//     "branch": "Test Branch"
// }
app.post("/api/cafes", upload.array("cafe_pictures", 4), (req, res) => {
  const { name, branch, province, district, pin_code, address, contact_number, open_hour, close_hour, account_id } = req.body;

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

// Testing Update Cafe - Success
// method: PUT
// URL: http://localhost:5000/api/cafes/101
// body: form-data
// {
//     "name": "Starbucks",
//     "branch": "Updated Branch",
//     "province": "Bangkok",
//     "district": "Sathon",
//     "pin_code": "10120",
//     "address": "123 Updated Street",
//     "contact_number": "0123456789",
//     "open_hour": "08:00:00",
//     "close_hour": "23:00:00",
//     "oldBranch": "Previous Branch Name"
// }
//
// Testing Update Non-existent Cafe
// method: PUT
// URL: http://localhost:5000/api/cafes/999
// body: form-data
// {
//     "name": "Starbucks",
//     "branch": "Test Branch"
// }
app.put("/api/cafes/:id", upload.array("cafe_pictures", 4), (req, res) => {
  const cafeId = req.params.id;
  const { name, branch, province, district, pin_code, address, contact_number, open_hour, close_hour } = req.body;
  const oldBranch = req.body.oldBranch;
  const uploadedImages = req.body.files;
  const oldImagename = `${name}_${oldBranch.replace(/\s+/g, "_")}`;
  const newImagename = `${name}_${branch.replace(/\s+/g, "_")}`;
  console.log("Image name:", oldImagename, newImagename)

  if (branch !== oldBranch && (!uploadedImages || uploadedImages.length === 0)) {
    for (let i = 1; i <= 4; i++) {
      const oldFilePath = path.join(__dirname, "../Front-end/Image", `${oldImagename}${i}.jpg`);
      const newFilePath = path.join(__dirname, "../Front-end/Image", `${newImagename}${i}.jpg`);

      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
          return res.status(500).json({ error: "Failed to rename image" });
        }
      });
    }
  }

  const query = `
    UPDATE 
      Restaurant_Cafe
    SET 
      Name = ?,
      Branch = ?,
      Province = ?,
      District = ?,
      pin_code = ?, 
      Address = ?, 
      Contact_number = ?,
      Open_hour = ?, 
      Close_hour = ?
    WHERE 
      Restaurant_ID = ?
  `;

  console.log("Updating Cafe....")
  Database.query(query, [name, branch, province, district, pin_code, address, contact_number, open_hour, close_hour, cafeId], (error, results) => {
    if (error) {
      console.error("Error updating cafe:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    console.log(`Cafe ID ${cafeId} updated successfully.`);
    res.status(200).json({ message: "Cafe updated successfully" });
  });
});

// Testing Get Admin Profile - Success
// method: GET
// URL: http://localhost:5000/api/admin/profile?id=1111111
//
// Testing Get Admin Profile - Not Found
// method: GET
// URL: http://localhost:5000/api/admin/profile?id=9999999
app.get("/api/admin/profile", (req, res) => {
  console.log("Query parameters:", req.query.id);
  console.log("URL:", req.url);
  
  const accountId = req.query.id;
  if (!accountId) {
    console.error("No account ID provided");
    return res.status(400).json({ error: "Account ID is required" });
  }

  console.log("Account ID:", accountId);

  const query = `
    SELECT 
      a.Admin_ID,
      a.Firstname,
      a.Lastname,
      a.Email,
      a.Phone,
      ac.Account_ID,
      ac.Username,
      ac.Role
    FROM 
      Adminn a
    JOIN 
      Admin_Account ac ON a.Admin_ID = ac.Admin_ID
    WHERE
      ac.Account_ID = ?
  `;

  Database.query(query, [accountId], (error, results) => {
    if (error) {
      console.error("Error fetching admin profile:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.error("No admin found with Account_ID:", accountId);
      return res.status(404).json({ error: "Admin profile not found" });
    }

    const admin = results[0];
    const response = {
      fullName: `${admin.Firstname} ${admin.Lastname}`,
      phoneNumber: admin.Phone,
      email: admin.Email,
      adminId: admin.Admin_ID,
      accountId: admin.Account_ID,
      role: admin.Role
    };

    console.log("Sending response:", response);
    res.json(response);
  });
});

// ==========================
// Start Server
// ==========================
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
