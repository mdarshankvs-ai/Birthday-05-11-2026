const loginForm = document.getElementById("loginForm");
const loginGate = document.getElementById("loginGate");
const loginFeedback = document.getElementById("loginFeedback");
let loginAttempts = 0;

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document
      .getElementById("loginEmail")
      .value.trim()
      .toLowerCase();
    const password = document
      .getElementById("loginPassword")
      .value.trim()
      .toLowerCase();

    if (email === "dimplevijay7hill@gmail.com" && password === "ananya") {
      loginFeedback.textContent = "";
      loginGate.classList.add("login-gate--success");
      window.setTimeout(() => loginGate.remove(), 650);
      return;
    }

    loginAttempts += 1;
    const clues = {
      1: "Hint: What is your name",
      2: "Hint: The Other name",
      3: "Hint: Who are you to me?",
      4: 'Fine I give up with the hints, the password is "ANANYA"',
    };

    loginFeedback.textContent = clues[Math.min(loginAttempts, 4)];
    loginFeedback.classList.add("login-feedback--visible");
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginPassword").focus();
  });
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const completed = { quiz: false, riddle: false };
document.body.classList.add("gate-locked");
$("#openGateBtn").addEventListener("click", () => {
  $("#privacyGate").classList.add("is-open");
  document.body.classList.remove("gate-locked");
  showToast("Welcome to your little birthday universe, Dimple ♡");
  setTimeout(() => $("#privacyGate").remove(), 750);
});
const questionsAnswered = new Set();
let soundEnabled = false;
let toastTimer;
let secretClicks = 0;
let birthdayLoopEnabled = false;

const messages = {
  firstday: "🥰👀",
  chaos: "Wish this was true, but your wrong!",
  dance: "I am disappointed 😭",
};

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function updateProgress() {
  const count = Number(completed.quiz) + Number(completed.riddle);
  $("#progressText").textContent = `${count} of 2 cleared`;
  $("#progressFill").style.width = `${count * 50}%`;

  // Keep the Next page button locked until BOTH the quiz and riddle are completed.
  const nextButton = document.getElementById("toQuestionsBtn");
  if (nextButton) {
    nextButton.disabled = count !== 2;
    nextButton.setAttribute("aria-disabled", String(count !== 2));
  }

  const nextHint = document.getElementById("nextHint");
  if (nextHint) {
    nextHint.textContent =
      count === 2
        ? "Achievement unlocked: certified fun person."
        : "Complete the mini quiz and riddle to unlock the next page.";
  }
}
const stepIds = [
  "top",
  "intro",
  "photoMarquee",
  "playground",
  "questions",
  "finalQuestion",
  "birthdayReveal",
  "galleryPage",
  "giftPage",
  "appreciationPage",
];
document.getElementById("top").classList.add("is-visible");
function originalShowStep(id) {
  const floatBtn = document.getElementById("gallerySongFloat");
  if (floatBtn) floatBtn.hidden = !birthdayTimerCompleted;
  stepIds.forEach((stepId) => {
    const node = document.getElementById(stepId);
    if (!node) return;
    if (stepId === id) node.classList.add("is-visible");
    else node.classList.remove("is-visible");
  });
  const active = document.getElementById(id);
  if (active) {
    active.classList.add("is-visible");
    // Keep the page transitions lively and bring the newly revealed content into view.
    requestAnimationFrame(() =>
      active.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
}

function showStep(id) {
  originalShowStep(id);
  updatePageExtras(id);
  updateGalleryFinaleVisibility(id);
  if (id === "appreciationPage") {
    startGoodnightReveal();
    window.setTimeout(() => {
      if (
        document
          .getElementById("appreciationPage")
          ?.classList.contains("is-visible")
      ) {
        startAppreciationAutoScroll();
      }
    }, 450);
  } else {
    resetGoodnightReveal();
    stopAppreciationAutoScroll();
  }
  if (id === "birthdayReveal") startBirthdayWaitTimer();
}

// Robust question-page handling: save one choice for each question and always allow progression
// after both have been answered. Event delegation also survives small markup changes.
const questionAnswers = { q1: null, q2: null };
const questionContinueBtn =
  document.getElementById("questionsContinueBtn") ||
  document.getElementById("toFinalBtn");
function refreshQuestionContinue() {
  if (!questionContinueBtn) return;
  const ready = Boolean(questionAnswers.q1 && questionAnswers.q2);
  questionContinueBtn.disabled = !ready;
  questionContinueBtn.classList.toggle("is-ready", ready);
  questionContinueBtn.style.opacity = ready ? "1" : ".55";
  questionContinueBtn.style.cursor = ready ? "pointer" : "not-allowed";
  const hint = document.getElementById("questionsContinueHint");
  if (hint)
    hint.textContent = ready
      ? "Perfect, Madam. One last little mystery… ♡"
      : "Choose one answer for each question to continue.";
}
document.addEventListener("click", (event) => {
  const answer = event.target.closest(
    ".questions .choice-btn, .questions .answer-btn, #questions .choice-btn, #questions .answer-btn",
  );
  if (!answer) return;
  const card = answer.closest(".question-card, .question-block, .question");
  const question = answer.closest("[data-question]") || card;
  if (!question) return;
  const text = (question.innerText || "").toLowerCase();
  let key = question.dataset.question;
  if (!key) {
    if (/question\s*01|ideal birthday plan|ideal plan/.test(text)) key = "q1";
    else if (/question\s*02|one birthday wish|what.s the vibe/.test(text))
      key = "q2";
  }
  if (key === "1") key = "q1";
  if (key === "2") key = "q2";
  if (key !== "q1" && key !== "q2") {
    // Fallback: use the order of question cards within the questions section.
    const cards = Array.from(
      document.querySelectorAll(
        "#questions .question-card, #questions .question-block, #questions .question",
      ),
    );
    const idx = cards.indexOf(question);
    if (idx === 0) key = "q1";
    if (idx === 1) key = "q2";
  }
  if (key !== "q1" && key !== "q2") return;
  questionAnswers[key] = answer.textContent.trim();
  const siblings = question.querySelectorAll(".choice-btn, .answer-btn");
  siblings.forEach((btn) => {
    btn.classList.remove("chosen", "selected", "is-selected");
    btn.setAttribute("aria-pressed", "false");
  });
  answer.classList.add("chosen", "selected", "is-selected");
  answer.setAttribute("aria-pressed", "true");
  refreshQuestionContinue();
});
if (questionContinueBtn) {
  questionContinueBtn.type = "button";
  questionContinueBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (!(questionAnswers.q1 && questionAnswers.q2)) {
      // Recover from older state/markup: infer selections from selected classes.
      const cards = Array.from(
        document.querySelectorAll(
          "#questions .question-card, #questions .question-block, #questions .question",
        ),
      );
      cards.slice(0, 2).forEach((card, i) => {
        const selected = card.querySelector(".chosen, .selected, .is-selected");
        if (selected)
          questionAnswers[i === 0 ? "q1" : "q2"] = selected.textContent.trim();
      });
    }
    if (questionAnswers.q1 && questionAnswers.q2) {
      showStep("finalQuestion");
    } else {
      showToast("Pick one answer for both questions first, Madam ♡");
      refreshQuestionContinue();
    }
  });
}
refreshQuestionContinue();

// A little birthday cake lighting ritual, followed by a celebratory burst into the wish.
function launchCakeSequence() {
  const reveal = document.getElementById("birthdayReveal");
  if (!reveal || reveal.dataset.cakeSequenceStarted === "yes") return;
  reveal.dataset.cakeSequenceStarted = "yes";
  const cake = document.getElementById("birthdayCake");
  if (!cake) return;
  cake.classList.remove("cake-burst", "cake-vibrate");
  reveal.classList.add("cake-sequence-active");
  cake.classList.add("cake-lighting");
  const label = document.getElementById("cakeMessage");
  if (label) label.textContent = "Make a wish… ✨";
  setTimeout(() => {
    cake.classList.add("cake-vibrate");
    reveal.classList.add("birthday-bursting");
    launchConfetti(320);
    if (label) label.textContent = "HAPPY BIRTHDAY, DIMPLE! 🎂💗";
    reveal.classList.remove("cake-sequence-active");
    reveal.classList.add("wish-content-burst");
    setTimeout(
      () => reveal.classList.remove("birthday-bursting", "wish-content-burst"),
      1400,
    );
  }, 2400);
}

// Mystery question: reveal the birthday page, then start the tune from this user click.
const mysteryRevealButton = document.getElementById("revealBtn");
if (mysteryRevealButton) {
  mysteryRevealButton.type = "button";
  mysteryRevealButton.addEventListener("click", async (event) => {
    event.preventDefault();
    stopGalleryAutoScroll();
    showStep("birthdayReveal");
    startWishAutoScroll();
    launchCakeSequence();
    launchConfetti(260);
    showToast("SURPRISE, DIMPLE! Happy birthday! 🎂");
    // Audio must be started in response to the click on many browsers.
    try {
      if (!birthdayLoopEnabled) await playBirthdayTune();
    } catch (error) {
      const status = document.getElementById("songStatus");
      if (status)
        status.textContent =
          "Use the pause/resume button if you want to control the music. ♫";
    }
  });
}

function scrollToSection(id) {
  showStep(id);
}
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.classList.contains("step-page") &&
        entry.target.id !== "photoMarquee"
      ) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
$$(".hidden-section").forEach((section) => observer.observe(section));

$("#beginBtn").addEventListener("click", () => showStep("intro"));
$("#toPlaygroundBtn").addEventListener("click", () => showStep("playground"));
$("#quizAnswers").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-answer]");
  if (!btn) return;
  $$(".answer-btn", $("#quizAnswers")).forEach((b) =>
    b.classList.remove("selected"),
  );
  btn.classList.add("selected");
  const isCorrect = btn.dataset.correct === "true";
  if (!isCorrect) btn.classList.add("wrong");
  $("#quizFeedback").textContent = messages[btn.dataset.answer];
  completed.quiz = isCorrect;
  updateProgress();
});
$$(".riddle-answer").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".riddle-answer").forEach((b) =>
      b.classList.remove("selected", "wrong"),
    );
    if (btn.dataset.correct === "true") {
      btn.classList.add("selected");
      $("#riddleFeedback").textContent =
        "Correct! It was a birthday cake. The dragon is relieved. 🎂";
      completed.riddle = true;
    } else {
      btn.classList.add("wrong");
      $("#riddleFeedback").textContent =
        "A bold guess, but the candles are still waiting on the cake. Try again. 😌";
      completed.riddle = false;
    }
    updateProgress();
  }),
);
const toQuestionsButton = document.getElementById("toQuestionsBtn");
if (toQuestionsButton) {
  // Explicitly lock on startup, even if the HTML's disabled attribute is changed.
  toQuestionsButton.disabled = true;
  toQuestionsButton.setAttribute("aria-disabled", "true");
  toQuestionsButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (!completed.quiz || !completed.riddle) {
      updateProgress();
      showToast("Complete both the mini quiz and riddle first, Madam ♡");
      return;
    }
    showStep("questions");
  });
}
updateProgress();
const birthdayAudio = document.getElementById("birthdayAudio");

async function playBirthdayTune() {
  if (!birthdayAudio) {
    const status = document.getElementById("songStatus");
    if (status)
      status.textContent = "Could not find the birthday MP3 player. ♫";
    return;
  }

  // One audio element + native looping prevents overlapping playback.
  birthdayAudio.loop = true;
  birthdayLoopEnabled = true;
  try {
    await birthdayAudio.play();
    const status = document.getElementById("songStatus");
    if (status) status.textContent = "Your birthday song is playing on loop. ♫";
    syncSongControls(false);
  } catch (error) {
    birthdayLoopEnabled = false;
    const status = document.getElementById("songStatus");
    if (status)
      status.textContent =
        "Could not play selfiepulla.mp3. Make sure it is beside index.html and try again. ♫";
    throw error;
  }
}

async function pauseBirthdayTune() {
  birthdayLoopEnabled = false;
  if (birthdayAudio) birthdayAudio.pause();
  syncSongControls(true);
  const status = document.getElementById("songStatus");
  if (status) status.textContent = "Birthday song paused. ♡";
}

async function resumeBirthdayTune() {
  await playBirthdayTune();
}

const gallerySongFloat = document.getElementById("gallerySongFloat");
function syncSongControls(paused) {
  const main = document.getElementById("gallerySongFloat");
  const floating = document.getElementById("gallerySongFloat");
  if (main)
    main.innerHTML = paused
      ? "▶ Resume song <span>♡</span>"
      : "Ⅱ Pause song <span>♡</span>";
  if (floating) {
    floating.setAttribute("aria-pressed", paused ? "true" : "false");
    const icon = floating.querySelector(".gallery-song-icon");
    const label = floating.querySelector(".gallery-song-label");
    if (icon) icon.textContent = paused ? "▶" : "Ⅱ";
    if (label) label.textContent = paused ? "Resume song" : "Pause song";
  }
}
if (gallerySongFloat) {
  gallerySongFloat.addEventListener("click", async () => {
    if (birthdayLoopEnabled) {
      await pauseBirthdayTune();
      syncSongControls(true);
    } else {
      await resumeBirthdayTune();
      syncSongControls(false);
    }
  });
}

// Gentle auto-scroll on the birthday wishing page, with a smooth bounce at both ends.
let wishAutoScrollFrame = null;
let wishAutoScrollLastTime = 0;
let wishAutoScrollDirection = 1;
let wishAutoScrollPaused = false;

function stopWishAutoScroll() {
  if (wishAutoScrollFrame !== null) cancelAnimationFrame(wishAutoScrollFrame);
  wishAutoScrollFrame = null;
}
function wishAutoScrollTick(now) {
  if (!wishAutoScrollLastTime) wishAutoScrollLastTime = now;
  const dt = Math.min(40, now - wishAutoScrollLastTime);
  wishAutoScrollLastTime = now;
  const wishPage = document.getElementById("birthdayReveal");
  if (
    !wishPage ||
    !wishPage.classList.contains("is-visible") ||
    wishAutoScrollPaused ||
    document.hidden
  ) {
    wishAutoScrollFrame = requestAnimationFrame(wishAutoScrollTick);
    return;
  }
  const rect = wishPage.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  const bottom = Math.max(
    top,
    top + wishPage.offsetHeight - window.innerHeight,
  );
  if (window.scrollY >= bottom - 2) wishAutoScrollDirection = -1;
  if (window.scrollY <= top + 2) wishAutoScrollDirection = 1;
  // Slightly faster than the gallery's previous setting, but still gentle.
  if (bottom > top + 4) {
    window.scrollTo(
      0,
      Math.max(
        top,
        Math.min(
          bottom,
          window.scrollY + wishAutoScrollDirection * (dt * 0.045),
        ),
      ),
    );
  }
  wishAutoScrollFrame = requestAnimationFrame(wishAutoScrollTick);
}
function startWishAutoScroll() {
  stopWishAutoScroll();
  wishAutoScrollPaused = false;
  wishAutoScrollLastTime = 0;
  wishAutoScrollFrame = requestAnimationFrame(wishAutoScrollTick);
}
const wishPageForScroll = document.getElementById("birthdayReveal");
if (wishPageForScroll) {
  ["mouseenter", "touchstart", "focusin"].forEach((type) =>
    wishPageForScroll.addEventListener(type, () => {
      wishAutoScrollPaused = true;
    }),
  );
  ["mouseleave", "touchend", "focusout"].forEach((type) =>
    wishPageForScroll.addEventListener(type, () => {
      wishAutoScrollPaused = false;
    }),
  );
}

// Gentle automatic bounce-scroll for the birthday wishing page too.
let wishScrollFrame = null;
let wishScrollLastTime = 0;
let wishScrollDirection = 1;
function wishScrollTick(now) {
  if (!wishScrollLastTime) wishScrollLastTime = now;
  const dt = Math.min(40, now - wishScrollLastTime);
  wishScrollLastTime = now;
  const page = document.getElementById("birthdayReveal");
  if (!page || !page.classList.contains("is-visible") || document.hidden) {
    wishScrollFrame = requestAnimationFrame(wishScrollTick);
    return;
  }
  const rect = page.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  const bottom = Math.max(top, top + page.offsetHeight - window.innerHeight);
  if (window.scrollY >= bottom - 2) wishScrollDirection = -1;
  if (window.scrollY <= top + 2) wishScrollDirection = 1;
  if (bottom > top + 4) {
    window.scrollTo(
      0,
      Math.max(
        top,
        Math.min(bottom, window.scrollY + wishScrollDirection * dt * 0.11),
      ),
    );
  }
  wishScrollFrame = requestAnimationFrame(wishScrollTick);
}
function startWishAutoScroll() {
  if (wishScrollFrame !== null) cancelAnimationFrame(wishScrollFrame);
  wishScrollLastTime = 0;
  wishScrollFrame = requestAnimationFrame(wishScrollTick);
}
window.addEventListener(
  "wheel",
  () => {
    const page = document.getElementById("birthdayReveal");
    if (!page || !page.classList.contains("is-visible")) return;
    if (wishScrollFrame !== null) cancelAnimationFrame(wishScrollFrame);
    clearTimeout(window.__wishScrollResumeTimer);
    window.__wishScrollResumeTimer = setTimeout(startWishAutoScroll, 1800);
  },
  { passive: true },
);

// Gentle auto-scroll for the memory gallery: drift down, then back up, in a loop.
let galleryAutoScrollFrame = null;
let galleryAutoScrollPaused = false;
let galleryAutoScrollDirection = 1;
let galleryAutoScrollLastTime = 0;
function stopGalleryAutoScroll() {
  if (galleryAutoScrollFrame !== null)
    cancelAnimationFrame(galleryAutoScrollFrame);
  galleryAutoScrollFrame = null;
}
function galleryAutoScrollTick(now) {
  if (!galleryAutoScrollLastTime) galleryAutoScrollLastTime = now;
  const dt = Math.min(40, now - galleryAutoScrollLastTime);
  galleryAutoScrollLastTime = now;
  const gallery = document.getElementById("photoGallery");
  const section = document.getElementById("galleryPage");
  if (
    !gallery ||
    !section ||
    !section.classList.contains("is-visible") ||
    galleryAutoScrollPaused ||
    document.hidden
  ) {
    galleryAutoScrollFrame = requestAnimationFrame(galleryAutoScrollTick);
    return;
  }
  const galleryRect = section.getBoundingClientRect();
  const galleryTop = window.scrollY + galleryRect.top;
  const galleryBottom = Math.max(
    galleryTop,
    galleryTop + section.offsetHeight - window.innerHeight,
  );
  const atBottom = window.scrollY >= galleryBottom - 2;
  const atTop = window.scrollY <= galleryTop + 2;
  if (atBottom) galleryAutoScrollDirection = -1;
  if (atTop) galleryAutoScrollDirection = 1;
  // A very gentle drift, about 18 pixels per second, bouncing within the gallery page.
  if (galleryBottom > galleryTop + 4) {
    window.scrollTo(
      0,
      Math.max(
        galleryTop,
        Math.min(
          galleryBottom,
          window.scrollY + galleryAutoScrollDirection * (dt * 0.5),
        ),
      ),
    );
  }
  galleryAutoScrollFrame = requestAnimationFrame(galleryAutoScrollTick);
}
function startGalleryAutoScroll() {
  stopGalleryAutoScroll();
  galleryAutoScrollPaused = false;
  galleryAutoScrollLastTime = 0;
  galleryAutoScrollFrame = requestAnimationFrame(galleryAutoScrollTick);
}
const galleryForAutoScroll = document.getElementById("photoGallery");
if (galleryForAutoScroll) {
  // Hovering or moving the cursor over photos must never pause automatic scrolling.
  // Manual wheel scrolling pauses briefly, then the automatic drift resumes.
  window.addEventListener(
    "wheel",
    () => {
      const section = document.getElementById("galleryPage");
      if (!section || !section.classList.contains("is-visible")) return;
      galleryAutoScrollPaused = true;
      clearTimeout(window.__galleryResumeTimer);
      window.__galleryResumeTimer = setTimeout(() => {
        galleryAutoScrollPaused = false;
      }, 1800);
    },
    { passive: true },
  );
}

function pauseGalleryAfterPhotoClick() {
  galleryAutoScrollPaused = true;
  clearTimeout(window.__galleryResumeTimer);
  window.__galleryResumeTimer = setTimeout(() => {
    galleryAutoScrollPaused = false;
  }, 2000);
}

// Open photos in a clean lightbox instead of enlarging the grid item itself.
let photoLightbox = document.getElementById("photoLightbox");
if (!photoLightbox) {
  photoLightbox = document.createElement("div");
  photoLightbox.id = "photoLightbox";
  photoLightbox.className = "photo-lightbox";
  photoLightbox.setAttribute("role", "dialog");
  photoLightbox.setAttribute("aria-modal", "true");
  photoLightbox.setAttribute("aria-label", "Enlarged memory photo");
  photoLightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close enlarged photo">×</button>
    <button class="lightbox-prev" type="button" aria-label="Previous photo">‹</button>
    <img class="lightbox-image" alt="">
    <button class="lightbox-next" type="button" aria-label="Next photo">›</button>
    <p class="lightbox-caption"></p>`;
  document.body.appendChild(photoLightbox);
}
const lightboxImage = photoLightbox.querySelector(".lightbox-image");
const lightboxCaption = photoLightbox.querySelector(".lightbox-caption");
let activePhotoIndex = 0;
const galleryPhotos = () =>
  Array.from(document.querySelectorAll("#photoGallery .memory-photo"));
function showLightboxPhoto(index) {
  const photos = galleryPhotos();
  if (!photos.length) return;
  activePhotoIndex = (index + photos.length) % photos.length;
  const photo = photos[activePhotoIndex];
  const img = photo.querySelector("img");
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt || "Birthday memory";
  lightboxCaption.textContent =
    photo.querySelector("figcaption")?.textContent || "";
}
function closePhotoLightbox() {
  photoLightbox.classList.remove("is-open");
  document.body.style.overflow = "";
}
$("#photoGallery").addEventListener("click", (e) => {
  const photo = e.target.closest(".memory-photo");
  if (!photo) return;
  const photos = galleryPhotos();
  pauseGalleryAfterPhotoClick();
  showLightboxPhoto(photos.indexOf(photo));
  photoLightbox.classList.add("is-open");
  document.body.style.overflow = "hidden";
});
photoLightbox
  .querySelector(".lightbox-close")
  .addEventListener("click", closePhotoLightbox);
photoLightbox
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => showLightboxPhoto(activePhotoIndex - 1));
photoLightbox
  .querySelector(".lightbox-next")
  .addEventListener("click", () => showLightboxPhoto(activePhotoIndex + 1));
photoLightbox.addEventListener("click", (e) => {
  if (e.target === photoLightbox) closePhotoLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!photoLightbox.classList.contains("is-open")) return;
  if (e.key === "Escape") closePhotoLightbox();
  if (e.key === "ArrowLeft") showLightboxPhoto(activePhotoIndex - 1);
  if (e.key === "ArrowRight") showLightboxPhoto(activePhotoIndex + 1);
});

// Small Easter eggs: tap the flower logo, click the footer star, or tap the page background 5 times.
$(".brand-mark").addEventListener("click", (e) => {
  e.preventDefault();
  showToast("A flower for you, because why not? ✿");
  launchConfetti(22);
});
$("#secretButton").addEventListener("click", () => {
  secretClicks++;
  if (secretClicks >= 1) {
    $("#secretMessage").classList.add("show");
    $("#secretMessage").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Secret found. You have excellent curiosity. ✨");
  }
});
let backgroundTaps = 0,
  backgroundTapTimer;
document.addEventListener("click", (e) => {
  if (e.target.closest("button, a, label, input")) return;
  backgroundTaps++;
  clearTimeout(backgroundTapTimer);
  backgroundTapTimer = setTimeout(() => (backgroundTaps = 0), 1300);
  if (backgroundTaps >= 5) {
    backgroundTaps = 0;
    showToast("Five little taps for five little wishes. ♡");
    launchConfetti(45);
  }
});

const canvas = $("#confettiCanvas");
const ctx = canvas.getContext("2d");
let confetti = [],
  animationId = null;
function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
function launchConfetti(amount = 100) {
  const colors = [
    "#738b68",
    "#d7ae68",
    "#f4d9d2",
    "#e9efe2",
    "#d7c5a2",
    "#fffdf9",
  ];
  for (let i = 0; i < amount; i++)
    confetti.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.3,
      size: 3 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 100 + Math.random() * 80,
    });
  if (!animationId) animateConfetti();
}
function launchEdgeConfetti(amount = 64) {
  const colors = [
    "#738b68",
    "#d7ae68",
    "#f4d9d2",
    "#e9efe2",
    "#d7c5a2",
    "#fffdf9",
  ];
  const width = window.innerWidth;
  const height = window.innerHeight;
  const sides = ["top", "bottom", "left", "right"];

  for (let i = 0; i < amount; i++) {
    const side = sides[i % sides.length];
    let x, y, vx, vy;
    const drift = (Math.random() - 0.5) * 2.4;

    if (side === "top") {
      x = Math.random() * width;
      y = -12;
      vx = drift;
      vy = 1.8 + Math.random() * 2.4;
    } else if (side === "bottom") {
      x = Math.random() * width;
      y = height + 12;
      vx = drift;
      vy = -(1.8 + Math.random() * 2.4);
    } else if (side === "left") {
      x = -12;
      y = Math.random() * height;
      vx = 1.8 + Math.random() * 2.4;
      vy = drift;
    } else {
      x = width + 12;
      y = Math.random() * height;
      vx = -(1.8 + Math.random() * 2.4);
      vy = drift;
    }

    confetti.push({
      x,
      y,
      size: 3 + Math.random() * 5,
      vx,
      vy,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.16,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 130 + Math.random() * 70,
      gravity:
        side === "top" || side === "bottom"
          ? (Math.random() - 0.5) * 0.025
          : (Math.random() - 0.5) * 0.018,
    });
  }
  if (!animationId) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confetti = confetti.filter(
    (p) =>
      p.life > 0 &&
      p.x > -35 &&
      p.x < window.innerWidth + 35 &&
      p.y > -35 &&
      p.y < window.innerHeight + 35,
  );
  confetti.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.vy += p.gravity ?? 0.018;
    p.life--;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.45);
    ctx.restore();
  });
  if (confetti.length) animationId = requestAnimationFrame(animateConfetti);
  else {
    cancelAnimationFrame(animationId);
    animationId = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// Back navigation, subtle party decorations, and the 23-second birthday wait.
const pageOrder = [
  "top",
  "intro",
  "playground",
  "questions",
  "finalQuestion",
  "birthdayReveal",
  "galleryPage",
  "giftPage",
  "appreciationPage",
];
let birthdayTimerInterval = null;
let birthdayTimerStarted = false;
let birthdayTimerCompleted = false;
let birthdayTimerDeadline = 0;
let partyPaperInterval = null;
let partyPaperModeActive = false;

function updatePageExtras(id) {
  document.querySelectorAll(".page-back-btn").forEach((button) => {
    const pageId = button.dataset.backFor || button.closest("section")?.id;
    button.hidden = pageId !== id || id === "top";
  });
  const shouldRunPartyPapers = id === "birthdayReveal" || id === "galleryPage";
  document.body.classList.toggle("party-mode", shouldRunPartyPapers);

  // Start immediately on entering either page, then send paper confetti from
  // all four screen edges every four seconds while either page is active.
  if (shouldRunPartyPapers && !partyPaperModeActive) {
    partyPaperModeActive = true;
    launchEdgeConfetti(88);
    if (partyPaperInterval) clearInterval(partyPaperInterval);
    partyPaperInterval = setInterval(() => {
      const activePage = document.getElementById("birthdayReveal");
      const activeGallery = document.getElementById("galleryPage");
      if (
        (activePage && activePage.classList.contains("is-visible")) ||
        (activeGallery && activeGallery.classList.contains("is-visible"))
      ) {
        launchEdgeConfetti(64);
      }
    }, 4000);
  } else if (!shouldRunPartyPapers && partyPaperModeActive) {
    partyPaperModeActive = false;
    if (partyPaperInterval) clearInterval(partyPaperInterval);
    partyPaperInterval = null;
  }

  const cta = document.getElementById("birthdayGalleryCta");
  if (cta) cta.hidden = !(birthdayTimerCompleted && id === "birthdayReveal");
  document.querySelectorAll(".birthday-wait").forEach((el) => {
    el.hidden = birthdayTimerCompleted;
  });
  const songButton = document.getElementById("gallerySongFloat");
  if (songButton) songButton.hidden = !birthdayTimerCompleted;
}
document.querySelectorAll(".page-back-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const currentId = button.dataset.backFor || button.closest("section")?.id;
    const currentIndex = pageOrder.indexOf(currentId);
    if (currentIndex > 0) {
      const previousId = pageOrder[currentIndex - 1];
      if (currentId === "birthdayReveal") {
        if (birthdayTimerInterval) clearInterval(birthdayTimerInterval);
        birthdayTimerInterval = null;
      }
      showStep(previousId);
    }
  });
});

const viewPrettyGalleryBtn = document.getElementById("viewPrettyGalleryBtn");
if (viewPrettyGalleryBtn) {
  viewPrettyGalleryBtn.addEventListener("click", () => {
    showStep("galleryPage");
    startGalleryAutoScroll();
  });
}
// The gallery finale countdown runs once per visit; returning from the final page
// keeps the completed button available instead of restarting the timer.
let galleryFinaleTimer = null;
let galleryFinaleStarted = false;
let galleryFinaleCompleted = false;
let galleryFinaleDeadline = 0;
const galleryFinaleDock = document.getElementById("galleryFinaleDock");
const galleryFinaleButton = document.getElementById("galleryFinaleButton");

function updateGalleryFinaleVisibility(id) {
  if (!galleryFinaleDock) return;
  const onGallery = id === "galleryPage";
  galleryFinaleDock.hidden = !onGallery;
  if (onGallery) startGalleryFinaleTimer();
}
function completeGalleryFinale() {
  if (galleryFinaleCompleted) return;
  galleryFinaleCompleted = true;
  if (galleryFinaleTimer) clearInterval(galleryFinaleTimer);
  galleryFinaleTimer = null;
  const caption = document.getElementById("galleryFinaleCaption");
  const countdown = document.getElementById("galleryFinaleCountdown");
  const fill = document.getElementById("galleryFinaleFill");
  if (caption) caption.textContent = "Your final little note is ready";
  if (countdown) countdown.textContent = "♡";
  if (fill) fill.style.width = "100%";
  galleryFinaleDock.classList.add("is-transforming");
  window.setTimeout(() => {
    galleryFinaleDock.classList.add("is-ready");
    requestAnimationFrame(() => galleryFinaleButton?.classList.add("is-in"));
  }, 320);
}
function startGalleryFinaleTimer() {
  if (!galleryFinaleDock || galleryFinaleStarted) {
    if (galleryFinaleCompleted)
      galleryFinaleDock?.classList.add("is-ready", "is-transforming");
    if (galleryFinaleCompleted) galleryFinaleButton?.classList.add("is-in");
    return;
  }
  galleryFinaleStarted = true;
  galleryFinaleDeadline = Date.now() + 10000;
  const caption = document.getElementById("galleryFinaleCaption");
  const countdown = document.getElementById("galleryFinaleCountdown");
  const fill = document.getElementById("galleryFinaleFill");
  const tick = () => {
    const remainingMs = Math.max(0, galleryFinaleDeadline - Date.now());
    const remaining = Math.ceil(remainingMs / 1000);
    if (countdown) countdown.textContent = `${remaining}s`;
    if (fill) fill.style.width = `${(1 - remainingMs / 10000) * 100}%`;
    if (remainingMs <= 0) completeGalleryFinale();
  };
  if (caption) caption.textContent = "A little more magic in…";
  tick();
  galleryFinaleTimer = window.setInterval(tick, 100);
}
if (galleryFinaleButton) {
  galleryFinaleButton.addEventListener("click", () => {
    if (!galleryFinaleCompleted) return;
    stopGalleryAutoScroll();
    showStep("giftPage");
    launchConfetti(100);
  });
}

// The present reveals its cheeky delivery conditions in two beats.
const openGiftBtn = document.getElementById("openGiftBtn");
const giftMessageFirst = document.getElementById("giftMessageFirst");
const giftMessageSecond = document.getElementById("giftMessageSecond");
const giftFinallyBtn = document.getElementById("giftFinallyBtn");
let giftRevealStarted = false;
if (openGiftBtn) {
  openGiftBtn.addEventListener("click", () => {
    if (giftRevealStarted) return;
    giftRevealStarted = true;
    openGiftBtn.classList.add("gift-opened");
    openGiftBtn.setAttribute("aria-expanded", "true");
    if (giftMessageFirst) {
      giftMessageFirst.textContent = "Be patient madam, your gift will be delivered when we meet next time 😜";
      giftMessageFirst.classList.add("gift-message-visible");
    }
    window.setTimeout(() => {
      if (giftMessageSecond) {
        giftMessageSecond.textContent = "Except during office hours, maybe 😉";
        giftMessageSecond.classList.add("gift-message-visible");
      }
      if (giftFinallyBtn) giftFinallyBtn.hidden = false;
    }, 1000);
  });
}
if (giftFinallyBtn) {
  giftFinallyBtn.addEventListener("click", () => {
    showStep("appreciationPage");
    launchConfetti(140);
  });
}
const backToMemoriesBtn = document.getElementById("backToMemoriesBtn");
if (backToMemoriesBtn) {
  backToMemoriesBtn.addEventListener("click", () => {
    showStep("galleryPage");
    startGalleryAutoScroll();
  });
}

function startBirthdayWaitTimer() {
  const timerCards = [...document.querySelectorAll(".birthday-wait")];
  if (!timerCards.length || birthdayTimerCompleted) {
    timerCards.forEach((el) => {
      el.hidden = true;
    });
    const cta = document.getElementById("birthdayGalleryCta");
    if (cta) cta.hidden = false;
    return;
  }
  if (birthdayTimerStarted) return;
  birthdayTimerStarted = true;
  birthdayTimerDeadline = Date.now() + 23000;
  const tick = () => {
    const remainingMs = Math.max(0, birthdayTimerDeadline - Date.now());
    const remaining = Math.ceil(remainingMs / 1000);
    timerCards.forEach((card) => {
      const timerText = card.querySelector(".birthdayTimerText");
      const timerBar = card.querySelector(".birthdayTimerBar");
      const progress = card.querySelector('[role="progressbar"]');
      if (timerText)
        timerText.textContent = `00:${String(remaining).padStart(2, "0")}`;
      if (timerBar) timerBar.style.width = `${(remainingMs / 23000) * 100}%`;
      if (progress) progress.setAttribute("aria-valuenow", String(remaining));
    });
    if (remainingMs <= 0) {
      clearInterval(birthdayTimerInterval);
      birthdayTimerInterval = null;
      birthdayTimerCompleted = true;
      timerCards.forEach((el) => {
        el.hidden = true;
      });
      const cta = document.getElementById("birthdayGalleryCta");
      if (cta) cta.hidden = true;
      const songButton = document.getElementById("gallerySongFloat");
      if (songButton) songButton.hidden = false;
      stopWishAutoScroll();
      showStep("galleryPage");
      startGalleryAutoScroll();
    }
  };
  tick();
  birthdayTimerInterval = setInterval(tick, 200);
}

/* Gentle bounce auto-scroll for the final appreciation page only. */
let appreciationAutoScrollFrame = null;
let appreciationAutoScrollLastTime = 0;
let appreciationAutoScrollDirection = 1;
let appreciationAutoScrollPaused = false;

function stopAppreciationAutoScroll() {
  if (appreciationAutoScrollFrame !== null) {
    cancelAnimationFrame(appreciationAutoScrollFrame);
  }
  appreciationAutoScrollFrame = null;
  appreciationAutoScrollLastTime = 0;
}

function appreciationAutoScrollTick(now) {
  if (!appreciationAutoScrollLastTime) appreciationAutoScrollLastTime = now;
  const dt = Math.min(40, now - appreciationAutoScrollLastTime);
  appreciationAutoScrollLastTime = now;

  const page = document.getElementById("appreciationPage");
  if (
    !page ||
    !page.classList.contains("is-visible") ||
    appreciationAutoScrollPaused ||
    document.hidden ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    appreciationAutoScrollFrame = requestAnimationFrame(
      appreciationAutoScrollTick,
    );
    return;
  }

  const rect = page.getBoundingClientRect();
  const pageTop = window.scrollY + rect.top;
  const pageBottom = Math.max(
    pageTop,
    pageTop + page.offsetHeight - window.innerHeight,
  );

  if (window.scrollY >= pageBottom - 2) appreciationAutoScrollDirection = -1;
  if (window.scrollY <= pageTop + 2) appreciationAutoScrollDirection = 1;

  // Scroll only when the final page is taller than the visible screen.
  if (pageBottom > pageTop + 4) {
    window.scrollTo(
      0,
      Math.max(
        pageTop,
        Math.min(
          pageBottom,
          window.scrollY + appreciationAutoScrollDirection * dt * 0.32,
        ),
      ),
    );
  }

  appreciationAutoScrollFrame = requestAnimationFrame(
    appreciationAutoScrollTick,
  );
}

function startAppreciationAutoScroll() {
  stopAppreciationAutoScroll();
  appreciationAutoScrollPaused = false;
  appreciationAutoScrollDirection = 1;
  appreciationAutoScrollLastTime = 0;
  appreciationAutoScrollFrame = requestAnimationFrame(
    appreciationAutoScrollTick,
  );
}

let appreciationResumeTimer;
window.addEventListener(
  "wheel",
  () => {
    const page = document.getElementById("appreciationPage");
    if (!page || !page.classList.contains("is-visible")) return;
    appreciationAutoScrollPaused = true;
    clearTimeout(appreciationResumeTimer);
    appreciationResumeTimer = setTimeout(() => {
      appreciationAutoScrollPaused = false;
    }, 1800);
  },
  { passive: true },
);

window.addEventListener(
  "touchstart",
  () => {
    const page = document.getElementById("appreciationPage");
    if (!page || !page.classList.contains("is-visible")) return;
    appreciationAutoScrollPaused = true;
    clearTimeout(appreciationResumeTimer);
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  () => {
    const page = document.getElementById("appreciationPage");
    if (!page || !page.classList.contains("is-visible")) return;
    clearTimeout(appreciationResumeTimer);
    appreciationResumeTimer = setTimeout(() => {
      appreciationAutoScrollPaused = false;
    }, 1400);
  },
  { passive: true },
);

/* The photo and two captions reveal only on the appreciation page. */
let goodnightRevealTimers = [];
function resetGoodnightReveal() {
  goodnightRevealTimers.forEach((timer) => clearTimeout(timer));
  goodnightRevealTimers = [];
  const reveal = document.getElementById("goodnightReveal");
  const caption = document.getElementById("goodnightCaption");
  const secondCaption = document.getElementById("goodnightCaptionSecond");
  if (reveal) reveal.classList.remove("is-visible");
  if (caption) caption.textContent = "";
  if (secondCaption) {
    secondCaption.textContent = "";
    secondCaption.hidden = true;
    secondCaption.classList.remove("is-caption-visible");
  }
}
function startGoodnightReveal() {
  resetGoodnightReveal();
  const reveal = document.getElementById("goodnightReveal");
  const caption = document.getElementById("goodnightCaption");
  const secondCaption = document.getElementById("goodnightCaptionSecond");
  if (!reveal || !caption || !secondCaption) return;

  goodnightRevealTimers.push(
    window.setTimeout(() => {
      reveal.classList.add("is-visible");
      caption.textContent = "Alright I'm sleepy, Goodnight";
      secondCaption.hidden = true;
      secondCaption.textContent = "";
      goodnightRevealTimers.push(
        window.setTimeout(() => {
          secondCaption.textContent =
            "Ohh sorry Good Morning for you, and once again Happy 22nd Birthday🥳";
          secondCaption.hidden = false;
          secondCaption.classList.add("is-caption-visible");
        }, 2000),
      );
    }, 3000),
  );
}
