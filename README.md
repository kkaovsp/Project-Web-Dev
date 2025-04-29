# Jaa Jong Tee Cafe Management System

## How to Run the Application

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- Web browser (Chrome/Firefox recommended)

### 1. Database Setup
1. Open MySQL and create a new database named `jajongtee`
2. Import the database schema:
```bash
mysql -u your_username -p jajongtee < Back-end/jajongtee.sql
```

### 2. Start Backend Server
1. Open terminal in the `Back-end` folder
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```
The backend will run on `http://localhost:5000`

### 3. Start Frontend Server
1. Open a new terminal in the `Front-end` folder
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```
The frontend will run on `http://localhost:3000`

### 4. Access the Application
- Open your browser and go to `http://localhost:3000/`
- It will redirect to `http://localhost:3000/home` which is a homepage for our website


## Important Remarks

### Known Issues
1. Admin Navigation:
   - After logging in, the admin ID must be present in the URL for admin pages to work
   - If you lose the ID parameter in the URL, you'll need to log in again


