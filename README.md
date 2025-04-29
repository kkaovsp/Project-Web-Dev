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
- Open your browser and go to `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Important Remarks

### Known Issues
1. Admin Navigation:
   - After logging in, the admin ID must be present in the URL for admin pages to work
   - If you lose the ID parameter in the URL, you'll need to log in again

2. Image Upload:
   - Maximum 4 images per cafe
   - Supported formats: JPG, PNG
   - Maximum file size: 5MB per image

3. Browser Compatibility:
   - Best viewed in Chrome or Firefox
   - Some features may not work properly in Internet Explorer

### Security Notes
- Do not expose the backend port (5000) to public access
- Admin credentials should be changed from default on first use
- Keep your MySQL credentials secure

### Maintenance
- The login log table may grow large over time - consider periodic cleanup
- Regular database backups are recommended

## Troubleshooting

### Common Issues and Solutions

1. "Cannot connect to database":
   - Check if MySQL is running
   - Verify database credentials
   - Ensure database `jajongtee` exists

2. "Images not loading":
   - Check if the `Image` folder has correct permissions
   - Verify image paths are correct
   - Clear browser cache

3. "Admin access denied":
   - Check if you're logged in
   - Verify URL contains admin ID parameter
   - Try clearing browser cookies and logging in again

4. "Server won't start":
   - Check if ports 3000 and 5000 are available
   - Ensure all dependencies are installed
   - Look for error messages in the terminal

For any other issues, please contact the development team. 