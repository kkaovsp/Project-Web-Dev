// Extracts the account ID from the URL query parameters or localStorage
// Returns the ID value or null if not found
function getAccountIdFromURL() {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    let accountId = urlParams.get('id');
    
    // If not in URL, try localStorage
    if (!accountId) {
        accountId = localStorage.getItem('adminAccountId');
    }
    
    // If found in either place, ensure URL is updated
    if (accountId && !urlParams.has('id')) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', accountId);
        window.history.replaceState({}, '', newUrl);
    }
    
    console.log("Retrieved account ID:", accountId);
    return accountId;
}

// Fetches admin profile data from the backend API
// Makes a GET request with the account ID and handles the response
async function fetchAdminData() {
    try {
        const accountId = getAccountIdFromURL();
        if (!accountId) {
            console.error("No account ID found");
            window.location.href = '/admin/login'; // Redirect to login if no ID found
            return;
        }

        const url = `http://localhost:5000/api/admin/profile?id=${accountId}`;
        console.log("Fetching from URL:", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(errorData.error || 'Failed to fetch admin data');
        }

        const adminData = await response.json();
        console.log("Received admin data:", adminData);
        displayAdminData(adminData);
    } catch (error) {
        console.error('Error fetching admin data:', error);
        alert(error.message || 'Failed to load admin data. Please try again later.');
    }
}

// Updates the UI with admin profile information
// Takes the admin data object and populates various HTML elements
function displayAdminData(data) {
    document.querySelector('.admin-title').textContent = data.role;
    // Update full name
    document.getElementById('fullname').textContent = data.fullName;

    // Update phone number
    const phoneNumberElement = document.querySelector('.phone-number');
    if (phoneNumberElement) {
        phoneNumberElement.textContent = data.phoneNumber;
    }

    // Update email
    document.getElementById('email').textContent = data.email;

    // Update IDs
    document.getElementById('adminId').textContent = data.adminId;
    document.getElementById('accountId').textContent = data.accountId;
}

// Initialize the page when the DOM content is loaded
function initializePage() {
    fetchAdminData();
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', initializePage);

// Helper function to navigate to other admin pages while maintaining accountId
function navigateToAdminPage(path) {
    const accountId = getAccountIdFromURL();
    if (accountId) {
        window.location.href = `${path}?id=${accountId}`;
    } else {
        window.location.href = path;
    }
}
