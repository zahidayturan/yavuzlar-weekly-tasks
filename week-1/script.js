const themeIcons = document.querySelectorAll(".icon");
const currentTheme = localStorage.getItem("theme");

document.addEventListener('DOMContentLoaded', function () {

    const btn = document.getElementById("modeToggle");

    if (currentTheme === "light") {
        setLightMode();
    }


    btn.addEventListener("click", function () {
        btn.classList.toggle("active");
        setTheme();
    });

    function setTheme() {
        const currentTheme = document.body.getAttribute("theme");

        if (currentTheme === "light") {
            setDarkMode();
        } else {
            setLightMode();
        }
    }

    function setDarkMode() {
        document.body.removeAttribute("theme");
        localStorage.setItem("theme", "dark");

        document.querySelector('meta[name="theme-color"]').setAttribute("content", "#00140F");
        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-dark");
        });
    }

    function setLightMode() {
        document.body.setAttribute("theme", "light");
        localStorage.setItem("theme", "light");

        document.querySelector('meta[name="theme-color"]').setAttribute("content", "#F0F1F2");
        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-light");
        });
    }
});