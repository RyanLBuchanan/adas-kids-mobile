// play.js — Ada’s Chat UI + Avatar Initialization + Quick Helpers

// ----- API base (works on Android WebView + browser) -----
const SITE_URL = "https://adaskids.ai"; // <-- paste YOUR domain here exactly
const IS_CAPACITOR =
  location.protocol === "capacitor:" || location.origin.startsWith("file:");
const IS_LOCALHOST =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

// In Android (file://), call your real domain. In local dev, call netlify dev (8888).
// On the deployed website, leave it empty so relative paths work.
const AK_API_BASE = IS_CAPACITOR
  ? SITE_URL
  : IS_LOCALHOST
  ? "http://localhost:8888"
  : "";

// ===== 0) Small i18n helper (EN/ES) =====
function getLang() {
  const lang = new URLSearchParams(window.location.search).get("language");
  return (lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
}
const L = {
  en: {
    hi: "Hi",
    you: "You",
    ttsNotSupported: "Text-to-Speech not supported",
    errorPrefix: "⚠️ Error",
    netErr: "❌ Network error. Please try again later.",
    // quick actions
    qaExplainSent: (subject) =>
      `Explain ${subject} like I'm 10. Use simple words and a friendly tone.`,
    qaQuizSent: (subject) =>
      `Make a quick 4-question multiple-choice quiz about ${subject}. Provide choices A–D and give the answer key at the end.`,
    qaDiagramSent: (subject) =>
      `Draw a simple text (ASCII) diagram to show how ${subject} works. Keep it easy to read for kids.`,
    qaFunFactSent: (subject) =>
      `Tell me one fun, surprising fact about ${subject} in 1–2 sentences.`,
    subjectFallback: "today's topic",
    explainBubble: "Explain like I'm 10",
  },
  es: {
    hi: "Hola",
    you: "Tú",
    ttsNotSupported: "La lectura en voz alta no está disponible",
    errorPrefix: "⚠️ Error",
    netErr: "❌ Error de red. Inténtalo de nuevo más tarde.",
    // quick actions
    qaExplainSent: (subject) =>
      `Explica ${subject} como si tuviera 10 años. Usa palabras simples y un tono amistoso.`,
    qaQuizSent: (subject) =>
      `Crea un mini cuestionario de 4 preguntas de opción múltiple sobre ${subject}. Da opciones A–D y agrega la clave de respuestas al final.`,
    qaDiagramSent: (subject) =>
      `Haz un diagrama sencillo en texto (ASCII) para mostrar cómo funciona ${subject}. Que sea fácil de leer para niños.`,
    qaFunFactSent: (subject) =>
      `Cuéntame un dato curioso y sorprendente sobre ${subject} en 1–2 oraciones.`,
    subjectFallback: "el tema de hoy",
    explainBubble: "Explícalo como si tuviera 10",
  },
};
const T = L[getLang()];

// ===== 1) Track last AI + last user for helpers & TTS =====
let lastResponse = "";
let lastUserMessage = "";

// ===== 2) Avatar helpers =====
function formatAvatarName(avatar) {
  // New kid buddies + legacy set
  switch ((avatar || "").toLowerCase()) {
    case "dino":
      return "Dino (Roarsome & brave explorer)";
    case "unicorn":
    case "sparkle-unicorn":
      return "Sparkle Unicorn (Imagination power!)";
    case "honey-teddy":
    case "teddy":
      return "Honey Teddy (Cozy, kind, and calm)";
    case "astro":
    case "astronaut":
    case "astro-nova":
      return "Astro Nova (Space-smart and curious)";
    case "robot":
    case "pixel-robot":
      return "Pixel Robot (Logic + laughs)";
    case "fox":
    case "rainbow-fox":
      return "Rainbow Fox (Fast thinker, gentle coach)";
    case "panda":
    case "forest-panda":
      return "Forest Panda (Patient, encouraging)";
    case "dolphin":
    case "ocean-dolphin":
      return "Ocean Dolphin (Playful problem-solver)";

    // legacy avatars from earlier builds
    case "saudi-businessman":
      return "SaudiBusinessman (Confident & Professional)";
    case "saudi-doctor":
      return "SaudiDoctor (Smart & Empathetic)";
    case "saudi-warrior":
      return "SaudiWarrior (Disciplined & Tactical)";
    case "code-of-duty":
      return "CodeOfDuty (Tactical & Focused)";
    case "origami":
      return "Origami (Friendly & Curious)";

    case "ada":
    default:
      return "Ada (Empathetic & Inspiring)";
  }
}
function labelFromFormat(str) {
  // "Sparkle Unicorn (Imagination power!)" -> "Sparkle Unicorn"
  return String(str || "").split(" (")[0];
}
function avatarImagePath(avatar) {
  const a = (avatar || "").toLowerCase();
  // try new kids first
  if (a === "dino") return "/assets/avatars/dino.png";
  if (a === "sparkle-unicorn" || a === "unicorn")
    return "/assets/avatars/unicorn.png";
  if (a === "honey-teddy" || a === "teddy") return "/assets/avatars/teddy.png";
  if (a === "astro" || a === "astronaut" || a === "astro-nova")
    return "/assets/avatars/astronaut.png";
  if (a === "robot" || a === "pixel-robot") return "/assets/avatars/robot.png";
  if (a === "fox" || a === "rainbow-fox")
    return "/assets/avatars/rainbow-fox.png";
  if (a === "panda" || a === "forest-panda")
    return "/assets/avatars/forest-panda.png";
  if (a === "dolphin" || a === "ocean-dolphin")
    return "/assets/avatars/ocean-dolphin.png";

  // legacy
  if (a === "saudi-businessman") return "/assets/avatars/saudi-businessman.png";
  if (a === "saudi-doctor") return "/assets/avatars/saudi-doctor.png";
  if (a === "saudi-warrior") return "/assets/avatars/saudi-warrior.png";
  if (a === "code-of-duty") return "/assets/avatars/code-of-duty.png";
  if (a === "origami") return "/assets/avatars/origami.png";

  return "/assets/avatars/ada.png";
}
function getSystemMessage(avatar) {
  const a = (avatar || "").toLowerCase();
  // kid-friendly styles (soft guidance)
  if (["dino"].includes(a))
    return "You are Dino, a brave but gentle dino buddy. Explain things simply with playful energy, encourage curiosity, and celebrate small wins.";
  if (["sparkle-unicorn", "unicorn"].includes(a))
    return "You are Sparkle Unicorn, imagination-powered and upbeat. Use kid-friendly language and sprinkle in cheerful encouragement.";
  if (["honey-teddy", "teddy"].includes(a))
    return "You are Honey Teddy, cozy and calm. Be very reassuring and supportive, speaking slowly and kindly.";
  if (["astro", "astronaut", "astro-nova"].includes(a))
    return "You are Astro Nova, a friendly astronaut explorer. Use space-themed analogies and keep explanations clear and curious.";
  if (["robot", "pixel-robot"].includes(a))
    return "You are Pixel Robot, logical but funny. Give clear steps, tiny jokes, and check for understanding.";
  if (["fox", "rainbow-fox"].includes(a))
    return "You are Rainbow Fox, quick-thinking and gentle. Explain succinctly and invite the learner to try small challenges.";
  if (["panda", "forest-panda"].includes(a))
    return "You are Forest Panda, patient and encouraging. Speak calmly, pause to ask how the learner feels, and keep tasks bite-sized.";
  if (["dolphin", "ocean-dolphin"].includes(a))
    return "You are Ocean Dolphin, playful and helpful. Use simple words, little analogies, and keep a friendly pace.";

  // legacy personas
  if (a === "saudi-businessman")
    return "You are a confident and professional Saudi businessman in traditional attire. Polished, diplomatic, and persuasive.";
  if (a === "saudi-doctor")
    return "You are a Saudi female doctor: smart, compassionate, and clear.";
  if (a === "saudi-warrior")
    return "You are a disciplined Saudi warrior who values strength and honor.";
  if (a === "code-of-duty")
    return "You are a tactical, focused mentor with mission-driven guidance.";
  if (a === "origami")
    return "You are Origami, friendly and curious. Explain gently and clearly.";

  // default Ada
  return "You are a helpful and empathetic AI tutor named Ada who helps students learn with encouragement and clarity.";
}

// ===== 3) DOM Ready =====
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name") || "Student";
  const rawAvatar = params.get("avatar") || "ada";
  const avatarFmt = formatAvatarName(rawAvatar);
  const avatarLabel = labelFromFormat(avatarFmt);

  // Greeting + persona
  const greetingEl = document.getElementById("personal-greeting");
  greetingEl && (greetingEl.innerText = `${T.hi} ${name}, I’m ${avatarLabel}.`);

  const personaEl = document.getElementById("avatar-persona");
  personaEl && (personaEl.innerText = `Tutor Style: ${avatarFmt}`);

  // Avatar card
  const imgEl = document.getElementById("avatar-image");
  const labelEl = document.getElementById("avatar-label");
  if (imgEl) {
    imgEl.src = avatarImagePath(rawAvatar);
    imgEl.alt = avatarFmt;
  }
  labelEl && (labelEl.innerText = avatarLabel);

  // Chat elements
  const form = document.getElementById("ask-form");
  const input = document.getElementById("user-input");
  const chatLog = document.getElementById("chat-log");
  const playBtn = document.getElementById("play-btn");

  // Quick helper buttons
  const btnExplain = document.getElementById("btn-explain10");
  const btnQuiz = document.getElementById("btn-quiz");
  const btnDiagram = document.getElementById("btn-diagram");
  const btnFunFact = document.getElementById("btn-funfact");

  // Walkthrough link (keep params)
  const walkthroughBtn = document.getElementById("walkthrough-link");
  if (walkthroughBtn) {
    walkthroughBtn.href = `problem.html?${params.toString()}`;
  }

  // Send message helper
  async function sendToAda(message, systemOverride) {
    if (!message) return;
    appendMessage(T.you, message);
    lastUserMessage = message;

    const systemMessage = systemOverride || getSystemMessage(rawAvatar);
    try {
      const res = await fetch(`${AK_API_BASE}/.netlify/functions/chat-ada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, system: systemMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        appendMessage(avatarLabel, data.reply);
        lastResponse = data.reply;
      } else {
        appendMessage(
          avatarLabel,
          `${T.errorPrefix}: ${data.error?.message || "Unknown"}`
        );
      }
    } catch {
      appendMessage(avatarLabel, T.netErr);
    }
  }

  // Normal chat submit
  if (form && input && chatLog) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      sendToAda(message);
    });
  }

  // TTS button
  if (playBtn) {
    if (!("speechSynthesis" in window)) {
      playBtn.disabled = true;
      playBtn.title = T.ttsNotSupported;
    } else {
      playBtn.addEventListener("click", () => {
        if (!lastResponse) return;
        const utter = new SpeechSynthesisUtterance(lastResponse);
        window.speechSynthesis.speak(utter);
      });
    }
  }

  // ===== 4) Quick helpers =====
  function subjectFromContext() {
    // Prefer user's current text, then last user msg, then a fallback phrase.
    const typed = (input && input.value.trim()) || "";
    if (typed) return typed;
    if (lastUserMessage) return "that topic"; // keeps it generic
    return T.subjectFallback;
  }

  btnExplain?.addEventListener("click", () => {
    const subj = subjectFromContext();
    const prompt = T.qaExplainSent(subj);
    const typed = (input && input.value.trim()) || "";
    if (typed) input.value = "";
    sendToAda(typed ? `${typed}\n\n${prompt}` : prompt);
  });

  btnQuiz?.addEventListener("click", () => {
    const subj = subjectFromContext();
    const typed = (input && input.value.trim()) || "";
    if (typed) input.value = "";
    const prompt = T.qaQuizSent(subj);
    sendToAda(typed ? `${typed}\n\n${prompt}` : prompt);
  });

  btnDiagram?.addEventListener("click", () => {
    const subj = subjectFromContext();
    const typed = (input && input.value.trim()) || "";
    if (typed) input.value = "";
    const prompt = T.qaDiagramSent(subj);
    sendToAda(typed ? `${typed}\n\n${prompt}` : prompt);
  });

  btnFunFact?.addEventListener("click", () => {
    const subj = subjectFromContext();
    const typed = (input && input.value.trim()) || "";
    if (typed) input.value = "";
    const prompt = T.qaFunFactSent(subj);
    sendToAda(typed ? `${typed}\n\n${prompt}` : prompt);
  });
});

// ===== 5) Chat log render =====
function appendMessage(sender, message) {
  const chatLog = document.getElementById("chat-log");
  const wrap = document.createElement("div");
  wrap.className = "mb-2";
  wrap.innerHTML = `<strong>${escapeHtml(sender)}:</strong> ${escapeHtml(
    message
  )}`.replace(/\n/g, "<br/>");
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
