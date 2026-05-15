import { startDashboardTutorial } from "../tutorials/Student/dashboardTutorial";

function tryStartTutorial() {
    const path = window.location.pathname;
    if (path === "/dashboard") {
        const seen = localStorage.getItem("dashboard-tour");
        if (!seen) {
            setTimeout(() => {
                startDashboardTutorial();
                localStorage.setItem("dashboard-tour", "true");
            }, 500);
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryStartTutorial);
} else {
    tryStartTutorial();
}

document.addEventListener("astro:page-load", tryStartTutorial);