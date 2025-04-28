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



// Start the server
app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});
