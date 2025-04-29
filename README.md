# Jaa Jong Tee Cafe Management System

A full-stack web application for managing cafe information and locations.

## Project Structure

```
.
├── Front-end/              # React frontend application
│   ├── admin-home/        # Admin dashboard components
│   ├── admin-login/       # Admin authentication components
│   ├── detail/            # Cafe detail view components
│   ├── home/              # Main homepage components
│   ├── login-log/         # Login history components
│   ├── member/            # Member management components
│   ├── search/            # Search functionality components
│   ├── service-manage/    # Service management components
│   ├── Image/             # Static images
│   ├── server.js          # Frontend server configuration
│   └── package.json       # Frontend dependencies
│
└── Back-end/              # Node.js backend server
    ├── server.js          # Backend server and API endpoints
    ├── jajongtee.sql      # Database schema and sample data
    └── package.json       # Backend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- Web browser (Chrome/Firefox recommended)

## Setup Instructions

### 1. Database Setup
1. Start your MySQL server
2. Create a new database named `jajongtee`:
```bash
mysql -u your_username -p
CREATE DATABASE jajongtee;
```
3. Import the database schema and sample data:
```bash
mysql -u your_username -p jajongtee < Back-end/jajongtee.sql
```

### 2. Backend Server Setup
1. Navigate to the Back-end directory:
```bash
cd Back-end
```
2. Install dependencies:
```bash
npm install
```
3. Start the backend server:
```bash
npm start
```
The backend server will run on `http://localhost:5000`

### 3. Frontend Server Setup
1. Open a new terminal and navigate to the Front-end directory:
```bash
cd Front-end
```
2. Install dependencies:
```bash
npm install
```
3. Start the frontend server:
```bash
npm start
```
The frontend application will run on `http://localhost:3000`

## Accessing the Application

1. Open your web browser and navigate to `http://localhost:3000`
2. The application will automatically redirect to `http://localhost:3000/home`
3. For admin access, use the following credentials:
   - Username: chaowaphat
   - Password: password123

## Important Notes

### Database Configuration
- The application uses MySQL as its database
- The database schema includes tables for:
  - Admin accounts and profiles
  - Login logs
  - Restaurant/Cafe information
  - Sample data is provided for testing

### Security Considerations
- Admin authentication is required for accessing admin features
- The admin ID must be present in the URL for admin pages to function properly
- If the admin ID is lost from the URL, you'll need to log in again

### Dependencies
Frontend:
- Express.js for server
- Leaflet for maps
- Multer for file uploads
- Node-fetch for API calls

Backend:
- Express.js for API server
- Bcrypt for password hashing
- CORS for cross-origin requests
- Multer for file handling

## Troubleshooting

If you encounter any issues:
1. Ensure MySQL server is running
2. Verify database connection credentials
3. Check if both frontend and backend servers are running
4. Clear browser cache if experiencing UI issues
5. Check console logs for error messages

## Support

For additional support or to report issues, please contact the development team.


