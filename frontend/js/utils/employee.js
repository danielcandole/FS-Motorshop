

// LOAD LOGGED-IN EMPLOYEE
export async function loadLoggedEmployee() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "same-origin"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch logged-in employee.");
  }

  return result.employee ?? result;
}