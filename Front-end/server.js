const multer = require("multer");
const FormData = require("form-data");
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use("/Location", express.static(path.join(__dirname, "Location")));
app.use("/home", express.static(path.join(__dirname, "home")));
app.use("/search", express.static(path.join(__dirname, "search")));
app.use("/admin-login", express.static(path.join(__dirname, "admin-login")));
app.use("/admin-home", express.static(path.join(__dirname, "admin-home")));
app.use("/login-log", express.static(path.join(__dirname, "login-log")));
app.use("/service-manage", express.static(path.join(__dirname, "service-manage")));
app.use("/Image", express.static(path.join(__dirname, "Image")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let get = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// Home route
app.get("/", (req, res) => {
  fetch("http://localhost:5000", get)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(function (data) {
      console.log("Data received:", data);
      res.json(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.status(500).send("Error fetching data");
    });
});

// Home page
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "home/home.html"));
  console.log("Home page requested");
});

// Admin login page
app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "admin-login/admin-login.html"));
  console.log("Admin login page requested");
});

// Admin home page
app.get("/admin/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "admin-home/admin-home.html"));
  console.log("Admin home page requested");
});

// Login log page
app.get("/admin/login-log", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "login-log/login-log.html"));
  console.log("Login log page requested");
});

// Service management page
app.get("/admin/service-management", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "service-manage/service-manage.html"));
  console.log("Service management page requested");
});

app.get("/admin/service-management/add-new", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "service-manage/add-new.html"));
  console.log("Add-new page requested");
});

app.get('/admin/service-management/edit', (req, res) => {
  const cafeId = req.query.id;
  if (!cafeId) {
    return res.status(400).send('Cafe ID is required');
  }
  // Logic to fetch cafe details using cafeId
  // For now, we'll just render the edit page
  res.sendFile(path.join(__dirname, "/", "service-manage/edit-cafe.html"));
  console.log(`Edit page requested for cafe ID: ${cafeId}`);
});

app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "search/search.html"));
  console.log("Search page requested");
});



// Admin login API
// This endpoint is used to handle admin login requests from the frontend
// It forwards the request to the backend API and returns the response to the frontend
app.post("/api/admin/login", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
    console.log("Admin login successful:", data.user.Username);

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login process failed" });
  }
});


// API proxy endpoints
// This endpoint is used to fetch login logs from the backend API
// It forwards the request to the backend API and returns the login logs data to the frontend
app.get("/api/login-logs", async (req, res) => {
  try {
    // Get query parameters
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "login_date";
    const sortDirection = req.query.sortDirection || "desc";

    // Forward the request to the backend
    const response = await fetch(
      `http://localhost:5000/api/login-logs?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
      get
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Error fetching login logs:", error);
    res.status(500).json({ error: "Failed to fetch login logs" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});
