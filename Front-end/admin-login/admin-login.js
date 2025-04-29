const loginForm = document.querySelector(".login-form");

// Add event listener for form submission
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission behavior

  // Get form data
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validate input
  if (!username || !password) {
    alert("Please fill in both username and password.");
    return;
  }

  // Prepare data to send to the server
  const loginData = {
    username: username,
    password: password,
    loginTime: new Date().toISOString(), // Add login timestamp
  };

  // Admin login API
  // This endpoint is used to handle admin login requests from the frontend
  // It forwards the request to the backend API and returns the response to the frontend
  try {
    // Send data to the server
    const response = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    // Handle server response
    if (response.ok) {
      const result = await response.json();
      alert("Login successful!");
      console.log("Server response:", result);

      // Redirect to admin dashboard or another page
      window.location.href = `/admin/home?id=${result.accountId}`;
    } else {
      const error = await response.json();
      alert(`Login failed: ${error.message}`);
      console.error("Login error:", error);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred while logging in. Please try again.");
  }
});