// ==========================
// Import Dependencies
// ==========================
const express = require("express");
const path = require("path");

// ==========================
// Initialize App
// ==========================
const app = express();
const port = 3000;

// ==========================
// Static File Serving
// ==========================
app.use("/detail", express.static(path.join(__dirname, "detail")));
app.use("/home", express.static(path.join(__dirname, "home")));
app.use("/search", express.static(path.join(__dirname, "search")));
app.use("/admin-login", express.static(path.join(__dirname, "admin-login")));
app.use("/admin-home", express.static(path.join(__dirname, "admin-home")));
app.use("/login-log", express.static(path.join(__dirname, "login-log")));
app.use("/service-manage", express.static(path.join(__dirname, "service-manage")));
app.use("/Image", express.static(path.join(__dirname, "Image")));

// ==========================
// Middleware Configuration
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Route Definitions
// ==========================

/**
 * Root Route
 * Redirects to home page
 */
app.get("/", (req, res) => {
  res.redirect("/home");
});

/**
 * Home Page Route
 * Serves the home page
 */
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "home/home.html"));
  console.log("Home page requested");
});

/**
 * Home Page Route
 * Serves the home page
 */
app.get("/cafes/detail", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "detail/detail.html"));
  console.log("Detail page requested");
});

/**
 * Admin Login Page Route
 * Serves the admin login page
 */
app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "admin-login/admin-login.html"));
  console.log("Admin login page requested");
});

/**
 * Admin Home Page Route
 * Serves the admin home page
 */
app.get("/admin/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "admin-home/admin-home.html"));
  console.log("Admin home page requested");
});


/**
 * Login Log Page Route
 * Serves the login log page
 */
app.get("/admin/login-log", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "login-log/login-log.html"));
  console.log("Login log page requested");
});

/**
 * Service Management Page Route
 * Serves the service management page
 */
app.get("/admin/management", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "service-manage/service-manage.html"));
  console.log("Service management page requested");
});

/**
 * Add New Service Page Route
 * Serves the add new service page
 */
app.get("/admin/management/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "service-manage/add-new.html"));
  console.log("Add-new page requested");
});

/**
 * Edit Cafe Page Route
 * Serves the edit cafe page with cafe ID validation
 */
app.get('/admin/service-management/edit', (req, res) => {
  const cafeId = req.query.id;
  if (!cafeId) {
    return res.status(400).send('Cafe ID is required');
  }
  res.sendFile(path.join(__dirname, "/", "service-manage/edit-cafe.html"));
  console.log(`Edit page requested for cafe ID: ${cafeId}`);
});

/**
 * Cafes Page Route
 * Serves the cafes page
 */
app.get("/cafes", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "search/search.html"));
  console.log("Cafes page requested");
});

// ==========================
// Start Server
// ==========================
app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});
