import { initLoginForm } from "../auth/login.js";

const routes = {
  "/login": "/auth/login.html",
  "/billing": "/page/billing.html"
};

function getRoute() {
  const hash = window.location.hash;

  if (!hash || hash === "#") {
    return "/login";
  }

  return hash.slice(1);
}

async function loadPage(route) {
  const pageContent = document.getElementById("pageContent");

  if (!pageContent) {
    console.error("Page Router: #pageContent was not found.");
    return;
  }

  const page = routes[route];

  if (!page) {
    console.error(`Page Router: route "${route}" does not exist.`);
    return;
  }

  try {
    const response = await fetch(page);

    if (!response.ok) {
      throw new Error(
        `Failed to load ${page}: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    pageContent.innerHTML = html;

    if (route === "/login") {initLoginForm();}

    console.log(`Page Router: loaded ${route}`);

  } catch (error) {
    console.error("Page Router:", error);

    pageContent.innerHTML = `
      <section class="errorPage">
        <h1>Unable to load page</h1>
        <p>${error.message}</p>
      </section>
    `;
  }
}

export async function navigate() {
  const route = getRoute();

  console.log("Page Router: navigating to", route);

  await loadPage(route);
}

window.addEventListener("hashchange", navigate);
