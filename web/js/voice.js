// voice.js

// 1) Feature detection
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSTT = !!window.SpeechRecognition;
const hasTTS = "speechSynthesis" in window;

// 2) Optional: list available voices to the console
function listVoices() {
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (!voices.length) {
    synth.onvoiceschanged = () =>
      console.table(
        synth.getVoices().map((v) => ({ name: v.name, lang: v.lang }))
      );
  } else {
    console.table(voices.map((v) => ({ name: v.name, lang: v.lang })));
  }
}
if (hasTTS) listVoices();

// 3) On DOM ready, wire up everything
document.addEventListener("DOMContentLoaded", () => {
  let recognition,
    isListening = false,
    lastResponse = "";

  // 3a) STT setup
  if (hasSTT) {
    recognition = new window.SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add("bg-blue-700");
    };
    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove("bg-blue-700");
    };
    recognition.onerror = (e) => console.error("STT error", e);
    recognition.onresult = (e) => {
      document.getElementById("user-input").value = e.results[0][0].transcript;
    };
  }

  // 3b) TTS helper
  function speak(text) {
    if (!hasTTS || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    // utter.lang = 'en-US'; // tie to a dropdown if you like
    window.speechSynthesis.speak(utter);
  }

  // 3c) Grab buttons & form
  const micBtn = document.getElementById("mic-btn");
  const playBtn = document.getElementById("play-btn");
  const form = document.getElementById("ask-form");

  // 3d) Mic button toggles recognition
  if (hasSTT && micBtn) {
    micBtn.addEventListener("click", () => {
      if (isListening) recognition.stop();
      else {
        recognition.lang = "en-US";
        recognition.start();
      }
    });
  } else if (micBtn) {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported";
  }

  // 3e) Play button speaks lastResponse
  if (playBtn) {
    playBtn.addEventListener("click", () => speak(lastResponse));
  }

  // 3f) Intercept your chat form to capture lastResponse
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("user-input");
    const msg = input.value.trim();
    if (!msg) return;

    // send to your backend...
    try {
      const res = await fetch("/.netlify/functions/chat-ada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        lastResponse = data.reply;
      } else {
        lastResponse = "⚠️ " + (data.error?.message || "Error");
      }
    } catch {
      lastResponse = "❌ Network error.";
    }
  });
});
