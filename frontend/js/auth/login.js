export function initLoginForm() {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {return;}

  loginForm.addEventListener("submit", handleLogin);
}

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password})
    });

    const result = await response.json();

    if (!response.ok) {
      displayLoginError(result);
      return;
    }

    console.log("Login successful:", result);
    window.location.hash = "/dashboard";
  } catch (error) {
    console.error("Login request failed:", error);
    displayLoginError({message: "Unable to connect to the server."});
  }
}

function displayLoginError(result) {
  const loginError = document.getElementById("loginError");

  if (!loginError) {return;}

  loginError.textContent = result.message || "Unable to log in.";
}