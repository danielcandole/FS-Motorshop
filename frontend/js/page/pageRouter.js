import { initLoginForm } from "../auth/login.js";
import { initLogoutBtn } from "../auth/logout.js";
const routes = {
  "/login": "/auth/login.html",
  "/dashboard": "/page/dashboard.html",

  // Service Management
  "/employee": "/page/employee.html",
  "/job-orders": "/page/jobOrder.html",
  "/service-records": "/page/serviceRecord.html",

  // Customer Management
  "/customer-records": "/page/customerRecord.html",
  "/motorcycles": "/page/motorcycleRecord.html",

  // Inventory Management
  "/parts-inventory": "/page/partInventory.html",
  "/stock-card": "/page/stockCard.html",
  "/suppliers": "/page/supplier.html",
  "/supplies": "/page/supplies.html",

  // Financial Management
  "/billing": "/page/billing.html",
  "/payments": "/page/payment.html",

  // Reports
  "/reports": "/page/salesReport.html",
  "/inventory-reports": "/page/inventoryReport.html"
};

async function getCurrentEmployee() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) { return null; }
  const result = await response.json();
  return result.employee;
}


async function loadComponent(elementId, path) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Page Router: #${elementId} was not found`); return;
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
  const sidebar = document.getElementById("sidebar");



  try {
    if (route === "/login") {
        if (sidebar) {
          sidebar.innerHTML = "";
          sidebar.style.display = "none";
        }
    } else {

      if (!await getCurrentEmployee()) { 
        window.location.hash = "/login";
        return;
      }

      if (sidebar) { sidebar.style.display = ""; }

      await loadComponent("sidebar", "/component/sidebar.html");
      initLogoutBtn();
    }

    await loadPage(route);
  } catch (error) {
    console.error("Page Router navigation failed:", error);
  }
}
window.addEventListener("hashchange", navigate);
