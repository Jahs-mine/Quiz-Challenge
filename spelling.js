class Bee {
  static lexicon = [
    {
      difficulty: "easy",
      data: {
        kings: ["Saul", "David", "Solomon"],
        queens: ["Queen of Sheba"],
        prophets: ["Elijah", "Samuel"],
        places: ["Jerusalem", "Bethlehem"],
        rivers: ["Jordan", "Nile"],
        animals: ["Sheep", "Goat", "Donkey"],
      },
    },
    {
      difficulty: "medium",
      data: {
        kings: ["Hezekiah", "Josiah"],
        queens: ["Esther"],
        prophets: ["Isaiah", "Jeremiah", "Ezekiel"],
        places: ["Nazareth", "Capernaum"],
        rivers: ["Euphrates", "Tigris"],
        animals: ["Lion", "Bear", "Wolf"],
      },
    },
    {
      difficulty: "hard",
      data: {
        kings: ["Manasseh", "Zedekiah"],
        queens: ["Athaliah"],
        prophets: ["Hosea", "Zephaniah", "Habakkuk"],
        places: ["Hebron", "Gilead"],
        rivers: ["Jabbok", "Sihon"],
        animals: ["Cockatrice", "Behemoth", "Leviathan"],
      },
    },
  ];

  constructor(mode, categories) {
    this.synth = window.speechSynthesis;
    this.start = document.getElementById("start");
    this.speaker = document.getElementById("speaker");
    this.spelling = document.getElementById("spelling");
    this.checkButton = document.getElementById("check");
    this.nextButton = document.getElementById("next");
    this.status = document.getElementById("status");

    this.mode = mode;
    this.categories = categories.length > 0 ? categories : ["kings"];
    this.words = this.getWordsForRound(this.mode, this.categories);
    this.currentWordIndex = 0;

    this.start.addEventListener("click", this.reStart.bind(this));
    this.speaker.addEventListener("click", this.speakWord.bind(this));
    this.checkButton.addEventListener("click", this.checkSpelling.bind(this));
    this.nextButton.addEventListener("click", this.nextWord.bind(this));
  }

  loadProgress() {
    const progress = JSON.parse(localStorage.getItem("spellingProgress")) || {};
    return progress;
  }

  saveProgress(word, correct, incorrect) {
    let progress = this.loadProgress();

    if (!progress[word] && (correct || incorrect)) {
        progress[word] = { correct: 0, incorrect: 0 };
    }
    if (progress[word]) {
        progress[word].correct += correct ? 1 : 0;
        progress[word].incorrect += incorrect ? 1 : 0;
    }

    localStorage.setItem("spellingProgress", JSON.stringify(progress));
    this.checkProgressReset();

    // *** Add this line for live updates ***
    console.log("Progress:", progress); // Log the entire progress object
}


  checkProgressReset() {
    const lastReset = localStorage.getItem("lastProgressReset");
    const now = Date.now();
    const RESET_INTERVAL = 7 * 24 * 60 * 60 * 1000;

    if (!lastReset || now - lastReset > RESET_INTERVAL) {
      localStorage.removeItem("spellingProgress");
      localStorage.setItem("lastProgressReset", now);
      console.log("Progress data reset!");
    }
  }

  getWordsForRound(mode, categories) {
    let words = [];

    if (mode === "3") {
      // "All" mode
      Bee.lexicon.forEach((level) => {
        categories.forEach((category) => {
          words = words.concat(
            this.getRandomWords(level.difficulty, category, 5)
          );
        });
      });
    } else {
      const difficulties = ["easy", "medium", "hard"];
      const difficulty = difficulties[parseInt(mode, 10)];
      categories.forEach((category) => {
        words = words.concat(this.getRandomWords(difficulty, category, 5));
      });
    }

    return this.shuffleArray(words);
  }

  getRandomWords(difficulty, category, count) {
    const entry = Bee.lexicon.find((level) => level.difficulty === difficulty);
    if (!entry || !entry.data[category]) {
        console.warn(`Invalid category "${category}" for difficulty "${difficulty}".`);
        return [];
    }

    let availableWords = [...entry.data[category]];
    const progressData = this.loadProgress();
    const selectedWords = [];

    // 1. Prepare words and weights:
    const weightedWords = [];

    availableWords.forEach(word => {
        const progress = progressData[word] || { correct: 0, incorrect: 0 };
        let weight = 1; // Default weight for new words

        if (Object.keys(progressData).length !== 0 && progress) { // Only apply weighting if progress exists
            weight = 1 / (Math.sqrt(progress.correct + 1) * (progress.incorrect + 1));
        }
        weightedWords.push({ word, weight }); // Store word and weight together
    });

    // 2. Sort by weight (descending):
    weightedWords.sort((a, b) => b.weight - a.weight);

    // 3. Select words (guaranteed no repetition):
    const numToSelect = Math.min(count, weightedWords.length); // Don't select more than available
    for (let i = 0; i < numToSelect; i++) {
        selectedWords.push(weightedWords[i].word);
    }

    console.log("Selected words:", selectedWords);
    console.log("Current Progress Data:", progressData);
    return selectedWords;
}

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async speakWord() {
    if (this.words.length > 0 && this.currentWordIndex < this.words.length) {
      const wordToSpeak = this.words[this.currentWordIndex];
      try {
        await this.speak(wordToSpeak);
      } catch (error) {
        console.error("Error speaking word:", error);
      }
    } else {
      this.status.innerHTML = `<span style="color: red;">You've finished all words!</span>`;
    }
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      if (this.synth.speaking) {
        reject("Speech already in progress.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.speaker.disabled = true;

      utterance.onend = () => {
        this.speaker.disabled = false;
        this.spelling.focus();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        this.speaker.disabled = false;
        reject(event.error);
      };

      this.synth.speak(utterance);
    });
  }

  checkSpelling() {
    if (this.words.length === 0) {
      this.status.innerHTML = `<span style="color: red;">No words loaded! Select a mode and category.</span>`;
      return;
    }

    if (this.currentWordIndex >= this.words.length) {
      this.status.innerHTML = `<span style="color: red;">You've finished all words!</span>`;
      return;
    }

    const userInput = this.spelling.value.trim();
    const correctWord = this.words[this.currentWordIndex];

    if (userInput === "") {
      this.status.innerHTML = `<span style="color: red;">Please attempt spelling before clicking "Check".</span>`;
      return;
    }

    if (userInput.toLowerCase() === correctWord.toLowerCase()) {
      this.status.innerHTML = `<span style="color: green;">✅ Correct! The word was "${correctWord}". Click "Next" for the next word.</span>`;
      this.nextButton.style.display = "inline-block";
      this.saveProgress(correctWord, true, false); // Save correct attempt
    } else {
      this.status.innerHTML = `<span style="color: red;">❌ Incorrect. Try again.</span>`;
      this.saveProgress(correctWord, false, true); // Save incorrect attempt
    }
  }

  nextWord() {
    if (this.currentWordIndex < this.words.length - 1) {
      this.currentWordIndex++;
      this.spelling.value = "";
      this.status.innerHTML = "";
      this.nextButton.style.display = "none";
    } else {
      this.status.innerHTML = `<span style="color: blue;">🎉 You've completed all words! Restart to play again.</span>`;
      this.nextButton.style.display = "none";
    }
  }

  reStart() {
    this.currentWordIndex = 0;
    this.spelling.value = "";
    this.status.innerHTML = "";
    this.words = this.getWordsForRound(this.mode, this.categories);
    this.nextButton.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  function getSelectedMode() {
    const selectedRadio = document.querySelector(`input[name="mode"]:checked`);
    return selectedRadio ? selectedRadio.value : "0";
  }

  function getSelectedCategories() {
    return [...document.querySelectorAll('input[name="category"]:checked')].map(
      (checkbox) => checkbox.value
    );
  }

  let mode = getSelectedMode();
  let categories = getSelectedCategories();
  const bee = new Bee(mode, categories);
  bee.checkProgressReset(); // Check for reset on page load

  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      bee.mode = getSelectedMode();
      bee.words = bee.getWordsForRound(bee.mode, bee.categories);
      bee.currentWordIndex = 0;
      bee.spelling.value = "";
    });
  });

  document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      bee.categories = getSelectedCategories();
      bee.words = bee.getWordsForRound(bee.mode, bee.categories);
      bee.currentWordIndex = 0;
      bee.spelling.value = "";
    });
  });
});
