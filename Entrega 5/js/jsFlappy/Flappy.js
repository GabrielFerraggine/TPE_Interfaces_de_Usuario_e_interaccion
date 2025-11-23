//boton user
const userAvatar = document.getElementById("userAvatar");
const dropdownMenu = document.getElementById("dropdownMenu");
const closeBtn = document.querySelector(".close-btn");

//Mostrar/ocultar menú al clickear el avatar
userAvatar.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
});

//Boton "Volver" cierra el menu
closeBtn.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
});

//Cierra si se hace clic afuera
document.addEventListener("click", (event) => {
    if (!dropdownMenu.contains(event.target) && !userAvatar.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
    }
});

//Boton menu hamburguesa
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuHamburguesaBtn");
const menuIcon = document.getElementById("menuIcon");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");

    if (sidebar.classList.contains("expanded")) {
        menuIcon.src = "../img/close.png";
    } else {
        menuIcon.src = "../img/Menu Hamburguesa.png";
    }
});

//Lleva al registro al cerrar sesion
document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "../html/registro.html";
    });
});

//Boton compartir
document.addEventListener('DOMContentLoaded', (event) => {
    const toggleButton = document.getElementById('toggleShare');
    const socialIcons = document.getElementById('socialIcons');

    toggleButton.addEventListener('click', () => {
        socialIcons.classList.toggle('visible');
    });
});