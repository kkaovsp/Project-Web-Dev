// ===== UPDATED FRONTEND SERVER CODE FOR JAJONGTEE DATABASE =====

const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// Home route
app.get("/", (req, res) => {
  fetch("http://localhost:5000", options)
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

// Admin login page
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "login.html"));
});

// Admin home page
app.get("/admin-home", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "admin-home.html"));
});

// Login log page
app.get("/login-log", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "login-log.html"));
});

// API test page
app.get("/api-test", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "api-test.html"));
});

// Service management page
app.get("/service-management", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "service-management.html"));
});

// API proxy endpoints
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
      options,
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

app.get("/api/total-logins-today", async (req, res) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/total-logins-today",
      options,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching total logins today:", error);
    res.status(500).json({ error: "Failed to fetch total logins today" });
  }
});

// Admin login API
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
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login process failed" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Frontend server is running at http://localhost:${port}`);
});
