# Jaa Jong Tee Cafe Management System

A full-stack web application for managing cafe/restaurant reservation.

## Project Structure

```
.
├── Front-end/              # React frontend application
│   ├── admin-home/        # Admin dashboard folder
│   ├── admin-login/       # Admin authentication folder
│   ├── detail/            # Cafe details folder
│   ├── home/              # Main homepage folder
│   ├── login-log/         # Login history tracking folder
│   ├── member/            # Member management folder
│   ├── search/            # Search functionality folder
│   ├── service-manage/    # Service management folder
│   ├── Image/             # Static assets folder
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
mysql -u jajongtee -p folkrakj < Back-end/jajongtee.sql
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

## API Documentation

### Authentication
- `POST /api/admin/login`
  - Description: Authenticate admin user
  - Request Body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - Response: Admin profile and account information

### Admin Profile
- `GET /api/admin/profile`
  - Description: Get admin profile information
  - Query Parameters:
    - `id`: Account ID
  - Response: Admin profile details including name, contact, and role

### Cafe Management
- `GET /api/filter-options`
  - Description: Get available filter options for cafes
  - Response: List of unique names, provinces, and districts

- `GET /api/cafes`
  - Description: Get list of cafes with filtering
  - Query Parameters:
    - `search`: Search term
    - `cafe`: Cafe name filter
    - `province`: Province filter
    - `district`: District filter
  - Response: List of cafes with basic information

- `GET /api/cafes/:id`
  - Description: Get detailed information about a specific cafe
  - Parameters:
    - `id`: Cafe ID
  - Response: Complete cafe details including hours and location

- `POST /api/cafes`
  - Description: Create a new cafe
  - Request Body:
    ```json
    {
      "name": "string",
      "branch": "string",
      "province": "string",
      "district": "string",
      "pin_code": "string",
      "address": "string",
      "contact_number": "string",
      "open_hour": "HH:MM:SS",
      "close_hour": "HH:MM:SS",
      "account_id": "string"
    }
    ```
  - Files: Up to 4 cafe pictures can be uploaded (.jpg only)
  - Response: Success message. When you add a new cafe using the form, the images you upload will be automatically saved to a configured image folder for later use, and all cafe details will be stored in the database.

- `PUT /api/cafes/:id`
  - Description: Update cafe information
  - Parameters:
    - `id`: Cafe ID
  - Request Body: Same as POST /api/cafes
  - Files: Optional cafe pictures update

- `DELETE /api/cafes/:id`
  - Description: Delete a cafe
  - Parameters:
    - `id`: Cafe ID
  - Response: Success message

### External APIs
#### OpenStreetMap API
- Used for displaying cafe locations on maps
- Endpoint: `https://nominatim.openstreetmap.org/search`

- Search Strategy:
  1. First attempts to find location using cafe name + branch
  2. If not found, tries with branch name only
  3. If still not found, uses full address
  4. Places marker on map when location is found
- Map Features:
  - Interactive map display
  - Custom markers for cafe locations
  - Popup information display
  - Zoom controls
  - Map view centering on search results

  *We use public web service from OpenStreetMap because we can't request for Google Map web service (Google Cloud). This is because in the verify identity process, which using credit card to be payment method don't accept our cards. This map web service is not as good as Google Map but it still find some cafes. Some cafes or locations might not be founded*

### Login History
- `GET /api/login-logs`
  - Description: Get login history with pagination and search
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `search`: Search term
    - `sortBy`: Field to sort by (default: login_date)
    - `sortDirection`: Sort direction (asc/desc)
  - Response: Paginated login history with total count


## Important Notes

### Database Configuration
- The application uses MySQL as its database
- The database schema includes tables for:
  - Admin information
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
- Express.js (^4.18.2) - Web server framework
- Form-data (^4.0.2) - Form data handling
- Leaflet (^1.9.4) - Interactive maps
- Multer (^1.4.5-lts.2) - File upload handling
- Node-fetch (^3.3.2) - HTTP client
- Nodemon (^3.1.9) - Development server with auto-reload

Backend:
- Express.js (^5.1.0) - Web server framework
- CORS (^2.8.5) - Cross-origin resource sharing
- Multer (^1.4.5-lts.2) - File upload handling
- Nodemon (^3.1.9) - Development server with auto-reload
- MySQL2 - MySQL database driver



