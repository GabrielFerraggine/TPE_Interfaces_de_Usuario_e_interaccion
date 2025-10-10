// Alternar formularios
const formRegistro = document.getElementById("formRegistro");
const formLogin = document.getElementById("formLogin");

const formContent = document.querySelector(".form-box");
const checkmark = document.getElementById('checkmark');
const formLoginBox = document.getElementById('formLogin');
const formLoginCampos = document.getElementById('formLoginCampos');
const formRegistroBox = document.getElementById('formRegistro');
const formRegistroCampos = document.getElementById('formRegistroCampos');

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

//Lleva a la pagina principal al presionar el boton de Google
document.querySelectorAll(".google").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.classList.add("success");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 700);
  });
});

//Lleva a la pagina principal al presionar el boton de Facebook
document.querySelectorAll(".facebook").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.classList.add("success");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 700);
  });
});


//Validacion del form de login y redirige si todo es correcto
formLoginCampos.addEventListener("submit", function (event) {
  event.preventDefault();
  // Limpiar mensajes de error
  document.getElementById("emailLoginError").textContent = "";
  document.getElementById("passwordLoginError").textContent = "";
  let captchaError = document.getElementById("captchaLoginError");
  if (captchaError) captchaError.textContent = "";

  // Campos del formulario
  let email = document.getElementById("emailLogin").value.trim();
  let password = document.getElementById("passwordLogin").value.trim();
  let valido = true;

  // Validaciones y animación de placeholders
  const camposLogin = [
    {
      value: email,
      errorId: "emailLoginError",
      errorMsg: "El email debe ser válido, contener @ y finalizar con '.com'",
      placeholderText: "Email *"
    },
    {
      value: password,
      errorId: "passwordLoginError",
      errorMsg: "La contraseña debe tener al menos 6 caracteres.",
      placeholderText: "Contraseña *"
    }
  ];

  camposLogin.forEach((campo, idx) => {
    let error = false;
    let errorText = "";
    if (idx === 0 && (campo.value === "" || !campo.value.includes("@") || !campo.value.endsWith(".com"))) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 1 && (campo.value === "" || campo.value.length < 6)) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (error) {
      // Solo mostrar el error en el placeholder
      let inputBox = document.getElementById(campo.errorId).parentElement;
      let placeholder = inputBox.querySelector('.placeholder');
      if (placeholder) {
        let originalText = placeholder.textContent;
        placeholder.textContent = errorText;
        placeholder.style.color = 'red';
        setTimeout(() => {
          placeholder.textContent = originalText;
          placeholder.style.color = '';
        }, 10000);
      }
      document.getElementById(campo.errorId).textContent = "";
      valido = false;
    }
  });

  // Validación del captcha
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
    //Oculta el formulario y muestra el check animado
    formLoginBox.classList.add('hidden');
    checkmark.classList.add('show');
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1200);
  }
});

//Validaciones del form de registro y redirige a la pagina principal si todo es correcto
formRegistroCampos.addEventListener("submit", function (event) {
  event.preventDefault();
  // Limpiar mensajes de error
  document.getElementById("nombreCompletoRegistroError").textContent = "";
  document.getElementById("nicknameRegistroError").textContent = "";
  document.getElementById("edadRegistroError").textContent = "";
  document.getElementById("mailRegistroError").textContent = "";
  document.getElementById("passwordRegistroError").textContent = "";
  document.getElementById("confirmarPasswordRegistroError").textContent = "";
  let captchaError = document.getElementById("captchaRegistroError");
  if (captchaError) captchaError.textContent = "";

  // campos del formulario
  let nombre = document.getElementById("nombreCompletoRegistro").value.trim();
  let nickname = document.getElementById("nicknameRegistro").value.trim();
  let edad = document.getElementById("edadRegistro").value.trim();
  let mail = document.getElementById("mailRegistro").value.trim();
  let password = document.getElementById("passwordRegistro").value.trim();
  let confirmarPassword = document.getElementById("confirmarPasswordRegistro").value.trim();
  let valido = true;

  // Validaciones y animación de placeholders
  const campos = [
    {
      value: nombre,
      errorId: "nombreCompletoRegistroError",
      placeholderClass: "nombreCompletoRegistro",
      errorMsg: "El nombre y apellido es obligatorio.",
      placeholderText: "Email *"
    },
    {
      value: nickname,
      errorId: "nicknameRegistroError",
      placeholderClass: "nicknameRegistro",
      errorMsg: "Debe tener al menos 3 caracteres en el nickname.",
      placeholderText: "Nickname *"
    },
    {
      value: edad,
      errorId: "edadRegistroError",
      placeholderClass: "edadRegistro",
      errorMsg: "La edad debe tener valor y debe estar entre 3 y 100 años.",
      placeholderText: "Edad *"
    },
    {
      value: mail,
      errorId: "mailRegistroError",
      placeholderClass: "mailRegistro",
      errorMsg: "El mail debe ser válido, contener @ y finalizar con '.com'",
      placeholderText: "Mail *"
    },
    {
      value: password,
      errorId: "passwordRegistroError",
      placeholderClass: "passwordRegistro",
      errorMsg: "La contraseña debe tener al menos 6 caracteres.",
      placeholderText: "Contraseña *"
    },
    {
      value: confirmarPassword,
      errorId: "confirmarPasswordRegistroError",
      placeholderClass: "confirmarPasswordRegistro",
      errorMsg: "La contraseña debe tener al menos 6 caracteres y coincidir con la anterior.",
      placeholderText: "Confirmar contraseña *"
    }
  ];

  let animar = false;
  campos.forEach((campo, idx) => {
    let error = false;
    let errorText = "";
    if (idx === 0 && campo.value === "") {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 1 && (campo.value === "" || campo.value.length < 3)) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 2 && (campo.value === "" || isNaN(campo.value) || Number(campo.value) < 3 || Number(campo.value) > 100)) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 3 && (campo.value === "" || !campo.value.includes("@") || !campo.value.endsWith(".com"))) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 4 && (campo.value === "" || campo.value.length < 6)) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (idx === 5 && (campo.value.length < 6 || campo.value !== password)) {
      error = true;
      errorText = campo.errorMsg;
    }
    if (error) {
      // Solo mostrar el error en el placeholder
      let inputBox = document.getElementById(campo.errorId).parentElement;
      let placeholder = inputBox.querySelector('.placeholder');
      if (placeholder) {
        let originalText = placeholder.textContent;
        placeholder.textContent = errorText;
        placeholder.style.color = 'red';
        animar = true;
        setTimeout(() => {
          placeholder.textContent = originalText;
          placeholder.style.color = '';
        }, 10000);
      }
      document.getElementById(campo.errorId).textContent = "";
      valido = false;
    }
  });

  // Validación del captcha
  const captchaCheck = document.querySelector('#formRegistroCampos .captcha-check');
  if (!captchaCheck.checked) {
    if (!captchaError) {
      captchaError = document.createElement('p');
      captchaError.id = 'captchaRegistroError';
      captchaCheck.parentElement.parentElement.appendChild(captchaError);
    }
    captchaError.textContent = 'Debes marcar el captcha para continuar.';
    valido = false;
  }
  //si es valido anima un boton de exito y redirige a la pagina principal
  if (valido) {
    // Oculta el formulario de registro y muestra el check animado
    formRegistroBox.classList.add('hidden');
    checkmark.classList.add('show');
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1200);
  }
});
