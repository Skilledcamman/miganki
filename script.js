const SECRET_WORD = "miniganki";

const lockScreen = document.querySelector("#lockScreen");
const loveSite = document.querySelector("#loveSite");
const passForm = document.querySelector("#passForm");
const password = document.querySelector("#password");
const errorMessage = document.querySelector("#errorMessage");
const musicButton = document.querySelector("#musicButton");
const musicLabel = document.querySelector("#musicLabel");
const ourSong = document.querySelector("#ourSong");
const bookPage = document.querySelector("#bookPage");
const bookPageImage = bookPage?.querySelector("img");
const previousBookPage = document.querySelector("#previousBookPage");
const nextBookPage = document.querySelector("#nextBookPage");
const answerButtons = document.querySelector("#answerButtons");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const voiceNotes = document.querySelectorAll("[data-voice-note]");
const bookVoiceNote = document.querySelector(".book-voice-note");
const bookVoiceAudio = bookVoiceNote?.querySelector("audio");
const luvpot = document.querySelector(".voice-note-luvpot");
const luvCursor = document.querySelector(".luv-cursor");
const bookImages = [
  "images/book1.png",
  "images/book2.png",
  "images/book3.png",
  "images/book4.png",
  "images/book5.png",
];
let currentBookPage = 0;

if (luvpot && luvCursor) {
  document.body.append(luvCursor);
  function moveLuvCursor(event) {
    luvCursor.style.left = `${event.clientX}px`;
    luvCursor.style.top = `${event.clientY}px`;
    const bounds = luvpot.getBoundingClientRect();
    const isHoveringLuvpot =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    luvCursor.classList.toggle("is-visible", isHoveringLuvpot);
  }
  window.addEventListener("pointermove", moveLuvCursor);
  window.addEventListener("mousemove", moveLuvCursor);
  luvpot.addEventListener("pointermove", moveLuvCursor);
}

document.addEventListener("dragstart", (event) => {
  if (event.target instanceof HTMLImageElement) {
    event.preventDefault();
  }
});

function updateBookButtons() {
  previousBookPage.hidden = currentBookPage === 0;
  nextBookPage.hidden = currentBookPage === bookImages.length - 1;
  answerButtons.hidden = currentBookPage !== bookImages.length - 1;
  bookVoiceNote.hidden = currentBookPage !== bookImages.length - 1;
}

async function playFinalBookVoiceNote() {
  if (!bookVoiceAudio) return;
  ourSong.pause();
  musicButton.classList.remove("is-playing");
  musicLabel.textContent = "play our song";
  bookVoiceAudio.currentTime = 0;
  try {
    await bookVoiceAudio.play();
  } catch {
    bookVoiceNote.querySelector(".voice-note-time").textContent = "unavailable";
  }
}

function unlock() {
  lockScreen.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(1.04)" },
    ],
    { duration: 600, easing: "ease-in", fill: "forwards" },
  ).finished.then(() => {
    lockScreen.style.display = "none";
    loveSite.classList.add("is-visible");
    loveSite.setAttribute("aria-hidden", "false");
  });
}

passForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (password.value.trim().toLowerCase() === SECRET_WORD) {
    errorMessage.textContent = "";
    unlock();
    return;
  }
  errorMessage.textContent = "That is not the word I was thinking of ♡";
  password.select();
});

musicButton.addEventListener("click", async () => {
  if (ourSong.paused) {
    try {
      await ourSong.play();
      musicButton.classList.add("is-playing");
      musicLabel.textContent = "our song is playing";
    } catch {
      musicLabel.textContent = "add a song below";
    }
    return;
  }
  ourSong.pause();
  musicButton.classList.remove("is-playing");
  musicLabel.textContent = "play our song";
});

ourSong.addEventListener("error", () => {
  musicLabel.textContent = "add a song below";
});

function showBookPage(nextPage, direction) {
  currentBookPage = (nextPage + bookImages.length) % bookImages.length;
  bookPageImage.src = bookImages[currentBookPage];
  bookPageImage.alt = `Book page ${currentBookPage + 1} of ${bookImages.length}`;
  updateBookButtons();
  if (currentBookPage === bookImages.length - 1) {
    playFinalBookVoiceNote();
  } else {
    bookVoiceAudio?.pause();
  }
}

previousBookPage.addEventListener("click", () => {
  showBookPage(currentBookPage - 1);
});

nextBookPage.addEventListener("click", () => {
  showBookPage(currentBookPage + 1);
});

yesButton.addEventListener("click", () => {
  window.location.href = "yes.html";
});

function dodgeNoButton() {
  const x = Math.round((Math.random() - 0.5) * 520);
  const y = Math.round((Math.random() - 0.5) * 220);
  noButton.style.transform = `translate(${x}px, ${y}px)`;
}

noButton.addEventListener("pointerenter", dodgeNoButton);
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  dodgeNoButton();
});

voiceNotes.forEach((voiceNote) => {
  const audio = voiceNote.querySelector("audio");
  const playButton = voiceNote.querySelector(".voice-note-play");
  const playIcon = voiceNote.querySelector(".voice-note-play-icon");
  const timeLabel = voiceNote.querySelector(".voice-note-time");

  function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }

  playButton.addEventListener("click", async () => {
    if (audio.paused) {
      voiceNotes.forEach((otherVoiceNote) => {
        const otherAudio = otherVoiceNote.querySelector("audio");
        if (otherAudio !== audio) otherAudio.pause();
      });
      try {
        await audio.play();
      } catch {
        timeLabel.textContent = "unavailable";
      }
      return;
    }
    audio.pause();
  });

  audio.addEventListener("loadedmetadata", () => {
    timeLabel.textContent = formatAudioTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    timeLabel.textContent = formatAudioTime(audio.currentTime);
  });
  audio.addEventListener("play", () => {
    if (voiceNote === bookVoiceNote) {
      ourSong.pause();
      musicButton.classList.remove("is-playing");
      musicLabel.textContent = "play our song";
    }
    voiceNote.classList.add("is-playing");
    playIcon.textContent = "Ⅱ";
  });
  audio.addEventListener("pause", () => {
    voiceNote.classList.remove("is-playing");
    playIcon.textContent = "▶";
  });
  audio.addEventListener("ended", () => {
    timeLabel.textContent = formatAudioTime(audio.duration);
  });
  audio.addEventListener("error", () => {
    timeLabel.textContent = "unavailable";
  });
});

updateBookButtons();
