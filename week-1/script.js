document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById("themeButton");
    const themeIcons = document.querySelectorAll(".icon");
    const currentTheme = localStorage.getItem("theme");

    // Sayfa yüklendiğinde hafızadaki temayı uygula
    if (currentTheme === "dark") {
        setDarkMode();
    } else {
        setLightMode();
    }

    btn.addEventListener("click", function () {
        const isDark = document.documentElement.getAttribute("theme") === "dark";
        if (isDark) {
            setLightMode();
        } else {
            setDarkMode();
        }
    });

    function setDarkMode() {
        document.documentElement.setAttribute("theme", "dark");
        localStorage.setItem("theme", "dark");

        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-light");
        });
    }

    function setLightMode() {
        document.documentElement.removeAttribute("theme");
        localStorage.setItem("theme", "light");

        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-dark");
        });
    }
});