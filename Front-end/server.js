const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

let options = {
    method: "GET", // HTTP method (e.g., GET, POST, PUT, DELETE)
    headers: {
        "Content-Type": "application/json",
    },
};

// response status is 200 : OK
// response status is 400 : Not Found
// response status is 500 : Server Error

let promise = fetch("http://localhost:5000", options)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse JSON response
    })
    .then( function(data) {
        console.log("Data received:", data);    
    })
    .catch((error) => { 
        console.error("Error fetching data:", error);   
    });

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


// Start the server
app.listen(port, () => {
    console.log(`Server is running at on http://localhost:${port}`);
});