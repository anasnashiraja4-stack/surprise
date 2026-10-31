/* =========================
   SURPRISE BEBEB - JAVASCRIPT
========================= */

const $ = (selector) => document.querySelector(selector);

const welcomeSection = $("#welcomeSection");
const letterSection = $("#letterSection");
const plannerSection = $("#plannerSection");
const summarySection = $("#summarySection");

const goToLetter = $("#goToLetter");
const envelopeButton = $("#envelopeButton");
const envelopeImage = $("#envelopeImage");
const letterInstruction = $("#letterInstruction");
const letterContent = $("#letterContent");
const openChoices = $("#openChoices");

const modalOverlay = $("#modalOverlay");
const closeModalButton = $("#closeModal");
const answerForm = $("#answerForm");
const answerInput = $("#answerInput");

const music = $("#backgroundMusic");
const musicButton = $("#musicButton");
const cassette = $("#cassette");

const celebrationLayer = $("#celebrationLayer");
const backgroundHearts = $("#backgroundHearts");

const STORAGE_KEY = "surpriseBebebAnswers_v1";

/* =========================
   DATA
========================= */

const choices = {
    food: {
        emoji: "🍰",
        title: "What do you want to eat?",
        description: "Tell me what you're craving, my bebeb ♡",
        label: "Your favorite food",
        placeholder: "Contoh: sushi, ramen, ice cream..."
    },

    photo: {
        emoji: "📸",
        title: "Our photobooth date!",
        description: "Where should we take cute pictures together?",
        label: "Your dream photobooth location",
        placeholder: "Nama tempat atau lokasi yang kamu mau..."
    },

    message: {
        emoji: "💌",
        title: "A message for me",
        description: "Anything you want to tell me? I'm listening ♡",
        label: "Your little message",
        placeholder: "Tulis pesanmu di sini..."
    }
};

let answers = {
    food: "",
    photo: "",
    message: ""
};

let activeChoice = null;
let lastFocusedElement = null;
let toastTimer = null;

/* =========================
   LOAD SAVED ANSWERS
========================= */

function loadAnswers() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            answers = {
                food: typeof parsed.food === "string" ? parsed.food : "",
                photo: typeof parsed.photo === "string" ? parsed.photo : "",
                message: typeof parsed.message === "string" ? parsed.message : ""
            };
        }
    } catch (error) {
        console.warn("Saved answers could not be loaded.", error);
    }

    updateProgress();
}

function saveAnswers() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        return true;
    } catch (error) {
        console.warn("Answers could not be saved.", error);
        showToast("Browser tidak bisa menyimpan jawaban saat ini.");
        return false;
    }
}

/* =========================
   SECTION NAVIGATION
========================= */

function showSection(section) {
    const sections = [
        welcomeSection,
        letterSection,
        plannerSection,
        summarySection
    ];

    sections.forEach((item) => item.classList.add("hidden"));

    section.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

goToLetter.addEventListener("click", () => {
    showSection(letterSection);
});

/* =========================
   OPEN LOVE LETTER
========================= */

let letterOpened = false;

envelopeButton.addEventListener("click", () => {
    if (letterOpened) {
        return;
    }

    letterOpened = true;

    envelopeImage.src = "assets/suratkebuka.png";
    envelopeImage.alt = "Surat cinta yang sudah terbuka";

    envelopeButton.setAttribute(
        "aria-label",
        "Surat cinta sudah terbuka"
    );

    letterInstruction.textContent =
        "A little letter, written just for you ♡";

    envelopeButton.classList.add("opened");

    createCelebration(45);

    // Show the letter after the envelope animation begins.
    window.setTimeout(() => {
        letterContent.classList.remove("hidden");

        letterContent.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 550);
});

/* =========================
   OPEN DATE PLANNER
========================= */

openChoices.addEventListener("click", () => {
    showSection(plannerSection);
    updateProgress();

    createCelebration(12);
});

/* =========================
   OPEN CHOICE MODAL
========================= */

document.querySelectorAll(".choice-card").forEach((button) => {
    button.addEventListener("click", () => {
        const type = button.dataset.choice;

        openModal(type);
    });
});

function openModal(type) {
    const choice = choices[type];

    if (!choice) {
        return;
    }

    activeChoice = type;
    lastFocusedElement = document.activeElement;

    $("#modalEmoji").textContent = choice.emoji;
    $("#modalTitle").textContent = choice.title;
    $("#modalDescription").textContent = choice.description;
    $("#answerLabel").textContent = choice.label;

    answerInput.placeholder = choice.placeholder;
    answerInput.value = answers[type];

    modalOverlay.classList.remove("hidden");

    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
        answerInput.focus();
    }, 100);
}

function closeModal() {
    modalOverlay.classList.add("hidden");

    document.body.style.overflow = "";

    activeChoice = null;

    if (
        lastFocusedElement &&
        document.contains(lastFocusedElement)
    ) {
        lastFocusedElement.focus();
    }
}

closeModalButton.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
        closeModal();
    }
});

/* =========================
   SAVE ANSWERS
========================= */

answerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!activeChoice) {
        return;
    }

    const value = answerInput.value.trim();

    if (!value) {
        answerInput.focus();
        showToast("Isi jawabanmu dulu yaa ♡");
        return;
    }

    const previousValue = answers[activeChoice];

    answers[activeChoice] = value;

    if (!saveAnswers()) {
        answers[activeChoice] = previousValue;
        return;
    }

    const savedChoice = activeChoice;

    closeModal();

    updateProgress();

    createCelebration(12);

    showToast("Yay! Jawabanmu berhasil disimpan 💗");

    // The planner stays open so the other choices can be filled.
    if (savedChoice === "message") {
        $("#progressText").textContent =
            countCompleted() + " of 3 completed ♡";
    }
});

/* =========================
   PROGRESS BAR
========================= */

function countCompleted() {
    return Object.values(answers).filter(
        (value) => value.trim().length > 0
    ).length;
}

function updateProgress() {
    const completed = countCompleted();
    const percentage = (completed / 3) * 100;

    $("#progressFill").style.width = percentage + "%";

    $("#progressText").textContent =
        `${completed} of 3 completed`;

    document.querySelectorAll(".choice-card").forEach((card) => {
        const type = card.dataset.choice;
        const title = card.querySelector(".choice-title");
        const arrow = card.querySelector(".choice-arrow");

        if (answers[type].trim()) {
            title.textContent = choices[type].title.replace("?", "") + " ✓";
            arrow.textContent = "EDIT ANSWER ♡ →";
        } else {
            title.textContent = {
                food: "Food Date",
                photo: "Photobooth",
                message: "Your Message"
            }[type];

            arrow.textContent = "TELL ME ♡ →";
        }
    });
}

/* =========================
   SHOW DATE SUMMARY
========================= */

$("#showSummary").addEventListener("click", () => {
    if (countCompleted() < 3) {
        showToast("Isi ketiga pilihan dulu yaa! 💗");

        const missing = Object.keys(answers).find(
            (key) => !answers[key].trim()
        );

        if (missing) {
            openModal(missing);
        }

        return;
    }

    renderSummary();

    showSection(summarySection);

    createCelebration(22);
});

function renderSummary() {
    $("#summaryFood").textContent =
        answers.food || "Not decided yet";

    $("#summaryPhoto").textContent =
        answers.photo || "Not decided yet";

    $("#summaryMessage").textContent =
        answers.message || "Not decided yet";
}
/* =========================
   EDIT ANSWERS
========================= */

$("#editPlan").addEventListener("click", () => {
    showSection(plannerSection);
});

/* =========================
   SHARE DATE PLAN
========================= */

function createShareText() {
    return [
        "💗 OUR LITTLE DATE PLAN 💗",
        "",
        "🍰 FOOD DATE:",
        answers.food || "Belum dipilih",
        "",
        "📸 PHOTOBOOTH:",
        answers.photo || "Belum dipilih",
        "",
        "💌 YOUR MESSAGE:",
        answers.message || "Belum ada pesan",
        "",
        "Made with love ♡"
    ].join("\n");
}

$("#sharePlan").addEventListener("click", async () => {
    const shareText = createShareText();

    // On supported phones, open the native sharing menu.
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Our Little Date Plan 💗",
                text: shareText
            });

            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.warn("Native sharing is unavailable.", error);
        }
    }

    // Fallback: prepare a WhatsApp message.
    const whatsappURL =
        "https://wa.me/?text=" + encodeURIComponent(shareText);

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

/* =========================
   MUSIC PLAYER
========================= */

musicButton.addEventListener("click", async () => {
    if (music.paused) {
        musicButton.disabled = true;

        try {
            await music.play();

            musicButton.textContent = "Ⅱ";
            musicButton.setAttribute("aria-label", "Pause music");

            cassette.classList.add("playing");
        } catch (error) {
            console.warn("Music playback failed.", error);

            showToast(
                "Musik belum bisa diputar. Cek file SZASaturn.mp3 yaa."
            );
        } finally {
            musicButton.disabled = false;
        }
    } else {
        music.pause();

        musicButton.textContent = "▶";
        musicButton.setAttribute("aria-label", "Play music");

        cassette.classList.remove("playing");
    }
});

music.addEventListener("ended", () => {
    musicButton.textContent = "▶";
    cassette.classList.remove("playing");
});

music.addEventListener("error", () => {
    musicButton.textContent = "▶";
    cassette.classList.remove("playing");
});

/* =========================
   FLOATING BACKGROUND HEARTS
========================= */

function createBackgroundHearts() {
    const heartSymbols = ["♡", "♥", "✧", "✿"];

    for (let i = 0; i < 18; i++) {
        const heart = document.createElement("span");

        heart.className = "background-heart";
        heart.textContent =
            heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

        heart.style.left = Math.random() * 100 + "%";
        heart.style.fontSize = 12 + Math.random() * 20 + "px";
        heart.style.animationDuration = 9 + Math.random() * 12 + "s";
        heart.style.animationDelay = -Math.random() * 15 + "s";

        backgroundHearts.appendChild(heart);
    }
}

/* =========================
   FLOWER + HEART CELEBRATION
========================= */

function createCelebration(amount = 25) {
    const images = [
        "assets/flower.png",
        "assets/love.png"
    ];

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.45;

    for (let i = 0; i < amount; i++) {
        const item = document.createElement("img");

        item.className = "celebration-item";
        item.src = images[Math.floor(Math.random() * images.length)];
        item.alt = "";

        const size = 18 + Math.random() * 30;
        const angle = Math.random() * Math.PI * 2;
        const distance = 90 + Math.random() * Math.min(
            window.innerWidth * 0.45,
            300
        );

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - 80;

        item.style.left = centerX + "px";
        item.style.top = centerY + "px";

        item.style.setProperty("--size", size + "px");
        item.style.setProperty("--dx", dx + "px");
        item.style.setProperty("--dy", dy + "px");
        item.style.setProperty(
            "--rotation",
            (Math.random() * 600 - 300) + "deg"
        );

        item.style.setProperty(
            "--duration",
            (1.6 + Math.random() * 1.8) + "s"
        );

        item.addEventListener("error", () => {
            item.remove();
        });

        celebrationLayer.appendChild(item);

        window.setTimeout(() => {
            item.remove();
        }, 4000);
    }
}

/* =========================
   TOAST NOTIFICATIONS
========================= */

function showToast(message) {
    const toast = $("#toast");

    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
        toast.classList.add("hidden");
    }, 2800);
}

/* =========================
   INITIALIZE
========================= */

loadAnswers();
createBackgroundHearts();