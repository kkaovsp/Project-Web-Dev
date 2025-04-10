const port = 5000;
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database
var Database = mysql.createConnection({
    host : 'localhost',
    user : 'itcs223',
    password : 'itCS223**',
    database : 'tinycollege'
    });
Database.connect(function(err){
    if(err) throw err;
    console.log(`Connected DB :)`);
    });

let options = {
    method: "GET", // HTTP method (e.g., GET, POST, PUT, DELETE)
    headers: {"Content-Type": "application/json",},
};

//Homepage
app.get('/', (req, res) => {
    console.log('Request at ', req.url);
    // res.send('Hello World');
    let query = `select * from professor where EMP_NUM = '155' or EMP_FNAME = 'Robert'`;
    Database.query( query, function (error, results) {
        if (error) throw error;
        console.log(`${results.length} rows returned`);
        if(results.length > 0){
            console.log('Found')
        }else{
            console.log('Not Found')
            return res.sendFile(__dirname + '/html/notfound.html')
        }
        return res.send(results);
   });
});

app.get("/api/data", async (req, res) => {
    try {
        const response = await fetch("http://localhost:5000", options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse JSON response
        res.json(data); // Send the parsed data as JSON
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
});

//Invalid
app.use((req, res, next) => {
    console.log("404: Invalid accessed");
    res.status(404).send("Invalid Path");
});

// Server listening
app.listen(port, function () {
    console.log("Server listening at Port "+ port);});
