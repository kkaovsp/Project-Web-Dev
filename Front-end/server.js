const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

let options = {
    method: "GET", // HTTP method (e.g., GET, POST, PUT, DELETE)
    headers: {
        "Content-Type": "application/json",
    },
};

// response status is 200 : OK
// response status is 400 : Not Found
// response status is 500 : Server Error

// let promise = fetch("http://localhost:5000", options)
//     .then((response) => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json(); // Parse JSON response
//     })
//     .then( function(data) {
//         console.log("Data received:", data);    
//     })
//     .catch((error) => { 
//         console.error("Error fetching data:", error);   
//     });

app.get("/test-fetch", (req, res) => {
    res.sendFile(path.join(__dirname +'/' ,"test.html"));
});

app.get("/", (req, res) => {
    fetch("http://localhost:5000", options)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then( function(data) { // print on web page
        console.log("Data received:", data);
        res.json(data); // Send the parsed data as JSON   
    })
    .catch((error) => { 
        console.error("Error fetching data:", error);   
    });
});

app.get("/admin-login", (req,res) => {
    res.sendFile(path.join(__dirname + '/', "login.html"))
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname +'/' ,"home.html"));
    
});

app.get("/admin-home", (req, res) => {
    res.sendFile(path.join(__dirname +'/' ,"admin-home.html"));
    
});

app.get("/service-management", (req, res) => {
    res.sendFile(path.join(__dirname +'/' ,"service-management.html"));
    
});

// ===== INSTRUCTIONS FOR UPDATING FRONTEND SERVER.JS =====
// Add the following route to your frontend server.js file:

app.get("/login-log", (req, res) => {
    res.sendFile(path.join(__dirname, "/", "login-log.html"));
  });
  
  // This route will serve the login-log.html page when a user navigates to /login-log
  
  // ===== ALSO ADD THIS API ENDPOINT TO PROXY REQUESTS TO THE BACKEND =====
  app.get("/api/login-logs", async (req, res) => {
    try {
      // Get query parameters
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "loginDate";
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
  


// Start the server
app.listen(port, () => {
    console.log(`Server is running at on http://localhost:${port}`);
});