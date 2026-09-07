import { navigate } from "./page/pageRouter.js";


function initApp() {
  navigate();
}

if (document.readyState === "loading") {
 document.addEventListener("DOMContentLoaded", initApp);
}
else {
  initApp();
}

