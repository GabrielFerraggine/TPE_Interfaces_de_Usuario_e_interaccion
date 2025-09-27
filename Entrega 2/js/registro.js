// Alternar formularios
const formRegistro = document.getElementById("formRegistro");
const formLogin = document.getElementById("formLogin");

//Muestra el form del login y oculta el de registro
document.getElementById("btnLogin").addEventListener("click", (e) => {
  e.preventDefault();
  formRegistro.classList.add("hidden");
  formLogin.classList.remove("hidden");
});

//Muestra el form del registro y oculta el de login
document.getElementById("btnRegistro").addEventListener("click", (e) => {
  e.preventDefault();
  formLogin.classList.add("hidden");
  formRegistro.classList.remove("hidden");
});

//Lleva a la pagina principal al presionar la X
document.querySelectorAll(".close-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
});

//Validacion del form de login y redirige si todo es correcto
document.getElementById("formLoginCampos").addEventListener("submit", function(event) {
  event.preventDefault();
  //Limpia mensajes de error
  document.getElementById("emailLoginError").textContent = "";
  document.getElementById("passwordLoginError").textContent = "";
  let captchaError = document.getElementById("captchaLoginError");
  if (captchaError) captchaError.textContent = "";
  // Campos del formulario
  let email = document.getElementById("emailLogin").value.trim();
  let password = document.getElementById("passwordLogin").value.trim();
  let valido = true;
  //Validaciones
  if (email === "" || !email.includes("@") || !email.endsWith(".com")) {
    document.getElementById("emailLoginError").textContent = "El email debe ser válido, contener @ y finalizar con '.com'";
    valido = false;
  }
  if (password === "" || password.length < 6) {
    document.getElementById("passwordLoginError").textContent = "La contraseña debe tener al menos 6 caracteres.";
    valido = false;
  }
  //Validación del captcha
  const captchaCheck = document.querySelector('#formLoginCampos .captcha-check');
  if (!captchaCheck.checked) {
    if (!captchaError) {
      captchaError = document.createElement('p');
      captchaError.id = 'captchaLoginError';
      captchaCheck.parentElement.parentElement.appendChild(captchaError);
    }
    captchaError.textContent = 'Debes marcar el captcha para continuar.';
    valido = false;
  }
  if (valido) {
    window.location.href = "../index.html";
  }
});

//Validaciones del form de registro y redirige a la pagina principal si todo es correcto
document.getElementById("formRegistroCampos").addEventListener("submit", function(event) {
  event.preventDefault();
  //Limpiar mensajes de error
  document.getElementById("nombreCompletoRegistroError").textContent = "";
  document.getElementById("nicknameRegistroError").textContent = "";
  document.getElementById("edadRegistroError").textContent = "";
  document.getElementById("mailRegistroError").textContent = "";
  document.getElementById("passwordRegistroError").textContent = "";
  document.getElementById("confirmarPasswordRegistroError").textContent = "";
  let captchaError = document.getElementById("captchaRegistroError");
  if (captchaError) captchaError.textContent = "";

  //campos del formulario
  let nombre = document.getElementById("nombreCompletoRegistro").value.trim();
  let nickname = document.getElementById("nicknameRegistro").value.trim();
  let edad = document.getElementById("edadRegistro").value.trim();
  let mail = document.getElementById("mailRegistro").value.trim();
  let password = document.getElementById("passwordRegistro").value.trim();
  let confirmarPassword = document.getElementById("confirmarPasswordRegistro").value.trim();
  let valido = true;

  //Validaciones
  if (nombre === "") {
    document.getElementById("nombreCompletoRegistroError").textContent = "El nombre y apellido es obligatorio.";
    valido = false;
  }
  if (nickname === "" || nickname.length < 3) {
    document.getElementById("nicknameRegistroError").textContent = "Debe tener al menos 3 caracteres en el nickname.";
    valido = false;
  }
  if (edad === "" || isNaN(edad) || Number(edad) < 3 || Number(edad) > 100) {
    document.getElementById("edadRegistroError").textContent = "La edad debe tener valor y debe estar entre 3 y 100 años.";
    valido = false;
  }
  if (mail === "" || !mail.includes("@") || !mail.endsWith(".com")) {
    document.getElementById("mailRegistroError").textContent = "El mail debe ser válido, contener @ y finalizar con '.com'";
    valido = false;
  }
  if (password === "" || password.length < 6) {
    document.getElementById("passwordRegistroError").textContent = "La contraseña debe tener al menos 6 caracteres.";
    valido = false;
  }
  if (confirmarPassword.length < 6 || confirmarPassword !== password) {
    document.getElementById("confirmarPasswordRegistroError").textContent = "La contraseña debe tener al menos 6 caracteres y coincidir con la anterior.";
    valido = false;
  }

  // Validación del captcha
  const captchaCheck = document.querySelector('#formRegistroCampos .captcha-check');
  if (!captchaCheck.checked) {
    if (!captchaError) {
      // Si no existe el <p>, lo crea y lo pone después del captcha
      captchaError = document.createElement('p');
      captchaError.id = 'captchaRegistroError';
      captchaCheck.parentElement.parentElement.appendChild(captchaError);
    }
    captchaError.textContent = 'Debes marcar el captcha para continuar.';
    valido = false;
  }

  if (valido) {
    window.location.href = "../index.html";
  }
});