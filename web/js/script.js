// script.js

// ✅ Animate on Scroll Init
AOS.init();

// —————————————————————————————————————————————————————
// 1️⃣ Chat UI
// —————————————————————————————————————————————————————
const form = document.getElementById("ask-form");
const userInput = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");

if (form && userInput && chatLog) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("You", message);
    userInput.value = "";

    try {
      const response = await fetch("/.netlify/functions/chat-ada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (response.ok) {
        appendMessage("Ada", data.reply);
      } else {
        appendMessage(
          "Ada",
          `⚠️ Error: ${data.error?.message || "Something went wrong."}`
        );
      }
    } catch (err) {
      appendMessage("Ada", "❌ Network error. Please try again later.");
    }
  });
}

function appendMessage(sender, message) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("mb-2");
  messageEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatLog.appendChild(messageEl);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// —————————————————————————————————————————————————————
// 2️⃣ Carousel controls
// —————————————————————————————————————————————————————
const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".carousel-track > div");
let currentIndex = 0;

function updateCarousel() {
  if (!slides.length || !track) return;
  const slideWidth = slides[0].offsetWidth;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

document.getElementById("prevBtn")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateCarousel();
});

document.getElementById("nextBtn")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateCarousel();
});

// —————————————————————————————————————————————————————
// 3️⃣ Mobile menu toggle
// —————————————————————————————————————————————————————
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("mobile-menu-button")
    ?.addEventListener("click", () => {
      document.getElementById("mobile-menu")?.classList.toggle("hidden");
    });
});

// —————————————————————————————————————————————————————
// 4️⃣ Internationalization (i18n)
// —————————————————————————————————————————————————————
const translations = {
  en: {
    existingUser: "👤 Existing User",
    username: "Username",
    password: "Password",
    loginBtn: "Log In →",
    newUser: "✨ New to Ada's Kids?",
    createProf: "Create Profile →",
    preferredLang: "Preferred Language",
  },
  es: {
    existingUser: "👤 Usuario existente",
    username: "Nombre de usuario",
    password: "Contraseña",
    loginBtn: "Iniciar sesión →",
    newUser: "✨ ¿Nuevo en Ada's Kids?",
    createProf: "Crear perfil →",
    preferredLang: "Idioma preferido",
  },
  fr: {
    existingUser: "👤 Utilisateur existant",
    username: "Nom d’utilisateur",
    password: "Mot de passe",
    loginBtn: "Se connecter →",
    newUser: "✨ Nouveau sur Ada’s Kids ?",
    createProf: "Créer un profil →",
    preferredLang: "Langue préférée",
  },
  de: {
    existingUser: "👤 Bestehender Benutzer",
    username: "Benutzername",
    password: "Passwort",
    loginBtn: "Anmelden →",
    newUser: "✨ Neu bei Ada’s Kids?",
    createProf: "Profil erstellen →",
    preferredLang: "Bevorzugte Sprache",
  },
  zh: {
    existingUser: "👤 现有用户",
    username: "用户名",
    password: "密码",
    loginBtn: "登录 →",
    newUser: "✨ 新用户？",
    createProf: "创建个人资料 →",
    preferredLang: "首选语言",
  },
  it: {
    existingUser: "👤 Utente esistente",
    username: "Nome utente",
    password: "Password",
    loginBtn: "Accedi →",
    newUser: "✨ Nuovo in Ada’s Kids?",
    createProf: "Crea profilo →",
    preferredLang: "Lingua preferita",
  },
  ar: {
    existingUser: "👤 مستخدم حالي",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول →",
    newUser: "✨ جديد في أطفال آدا؟",
    createProf: "إنشاء ملف التعريف →",
    preferredLang: "اللغة المفضلة",
  },
};

// 2) translation helper
function translatePage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const txt = translations[lang]?.[key];
    if (txt) el.innerText = txt;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // grab our query params
  const params = new URLSearchParams(location.search);
  const lang = params.get("language") || "en";

  // 3) sync the select dropdown
  const select = document.getElementById("language-select");
  if (select) {
    select.value = lang;
    select.addEventListener("change", () => {
      const newLang = select.value;
      params.set("language", newLang);

      // update URL without reload
      history.replaceState(null, "", "?" + params.toString());

      // re-translate everything
      translatePage(newLang);

      // sync hidden field for your form
      const hidden = document.getElementById("language-choice");
      if (hidden) hidden.value = newLang;

      // rewrite all nav links to preserve ?language=…
      document.querySelectorAll("nav a[href]").forEach((a) => {
        const url = new URL(a.href, location.origin);
        url.searchParams.set("language", newLang);
        a.href = url.toString();
      });
    });
  }

  // 4) initial translation pass
  translatePage(lang);

  // 5) sync hidden input on initial load
  const hidden = document.getElementById("language-choice");
  if (hidden) hidden.value = lang;

  // 6) also rewrite nav links right away
  document.querySelectorAll("nav a[href]").forEach((a) => {
    const url = new URL(a.href, location.origin);
    url.searchParams.set("language", lang);
    a.href = url.toString();
  });
});
