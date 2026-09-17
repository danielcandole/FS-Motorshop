async function handleLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) { logoutBtn.disabled = true; }

  try {
    const response = await fetch("/api/auth/logout", {method: "POST"});

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Logout failed.");
    }
    console.log("Logout successful: ", result);
    window.location.hash = "/login";
  }
  catch {
    console.error("Logout request failed: ", error);

    if (logoutBtn) {
      logoutBtn.disabled = false;
    }
  }
}

export function initLogoutBtn() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) {
    console.error("Logout: #logoutBtn was not found");
    return;
  }
  logoutBtn.addEventListener("click", handleLogout);
}

