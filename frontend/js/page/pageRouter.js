import { initLoginForm } from "../auth/login.js";

const routes = {
  "/login": "/auth/login.html",
  "/dashboard": "/page/dashboard.html",
  "/billing": "/page/billing.html"
};

async function getCurrentEmployee() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) { return null; }

  return await response.json();
}


async function loadComponent(elementId, path) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Page Router: #${elementId} was not found`);
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  element.innerHTML = await response.text();
}

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
  if (route === "/login") { await loadPage(route); return;}
  if(!await getCurrentEmployee()) { window.location.hash = "/login"; return; }

  await loadComponent("header", "/component/header.html");
  await loadComponent("sidebar", "/component/sidebar.html");
  loadPage(route);
}

window.addEventListener("hashchange", navigate);
