class Bee {
  static lexicon = [
    {
      difficulty: "easy",
      data: {
        kings: [
          "Saul", "David", "Solomon", "Rehoboam", "Asa", "Jehoshaphat", "Ahab", "Uzziah", "Joash", "Josiah",
          "Hezekiah", "Jeroboam", "Abijah", "Manasseh", "Jehu", "Zedekiah", "Jehoiakim", "Jehoiachin", "Omri", "Nadab"
        ],
        queens: [
          "Queen of Sheba", "Esther", "Vashti", "Bathsheba", "Jezebel", "Athaliah", "Maacah", "Michal", "Abigail" // Removed Ruth - while a significant figure, not a queen in the traditional sense.
        ],
        prophets: [
          "Elijah", "Samuel", "Isaiah", "Jeremiah", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Micah",
          "Nathan", "Gad", "Obadiah", "Jonah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
        ],
        places: [
          "Jerusalem", "Bethlehem", "Nazareth", "Egypt", "Eden", "Jericho", "Zion", "Galilee", "Canaan", "Judea",
          "Samaria", "Philippi", "Sinai", "Corinth", "Damascus", "Babylon", "Golgotha", "Bethany", "Gilgal",
          "Sodom", "Capernaum", "Thessalonica", "Ephesus", "Hebron", "Gilead", "Assyria", "Antioch", "Emmaus",
          "Gomorrah", "Persia", "Joppa", "Tyre", "Sidon", "Caesarea", "Ptolemais" // Removed Rome and Athens - while important in biblical history, they are more broadly historical/geographical.
        ],
        rivers: ["Jordan", "Nile", "Euphrates", "Tigris", "Arnon", "Jabbok", "Kidron", "Sihon"],
        animals: [
          "Sheep", "Goat", "Donkey", "Lion", "Bear", "Wolf", "Ox", "Dove", "Fish", "Camel",
          "Cow", "Horse", "Dog", "Cat", "Fox", "Hyena", "Leopard", "Cheetah", "Elephant", "Hippopotamus",
          "Rhinoceros", "Giraffe", "Zebra", "Gazelle", "Antelope", "Deer", "Monkey", "Ape", "Rabbit", "Hare",
          "Squirrel", "Mouse", "Rat", "Bat", "Bird", "Snake", "Lizard", "Crocodile", "Insect", "Spider", "Scorpion"
        ]
      }
    },
    {
      difficulty: "medium",
      data: {
        kings: [
          "Hezekiah", "Josiah", "Jehoahaz", "Amaziah", "Adonijah", "Pekah", "Menahem", "Ahaz", "Jehoiada", "Jehoram",
          "Jehoiakim", "Jeconiah", "Zedekiah", "Ahab", "Jehu", "Hoshea"
        ],
        queens: [
          "Esther", "Athaliah", "Vashti", "Jezebel", "Tirzah", "Jedidah", "Azubah", "Shulamite Woman", "Ahinoam", "Shelomith",
          "Michal", "Maacah" // Removed more general terms and focused on named queens.
        ],
        prophets: [
          "Isaiah", "Jeremiah", "Ezekiel", "Habakkuk", "Zephaniah", "Malachi", "Obadiah", "Zechariah", "Nahum", "Haggai",
          "Daniel", "Hosea", "Joel", "Amos", "Jonah", "Micah", "Elisha"
        ],
        places: [
          "Capernaum", "Thessalonica", "Babylon", "Ephesus", "Damascus", "Bethany", "Antioch", "Gilead", "Hebron", "Nineveh",
          "Ararat", "Sidon", "Tyre", "Laodicea", "Beersheba", "Shiloh", "Penuel", "Gilgal",
          "Nazareth", "Sinai", "Philippi", "Samaria", "Colosse", "Pella", "Gerasa", "Philadelphia", "Pergamum",
          "Sardis", "Laodicea" // Removed Athens - same reasoning as above.
        ],
        rivers: ["Euphrates", "Tigris", "Jabbok", "Kidron", "Pishon", "Gihon", "Hiddekel", "Chebar"],
        animals: [
          "Leopard", "Hyena", "Eagle", "Vulture", "Serpent", "Jackal", "Ram", "Hart", "Gazelle", "Locust",
          "Lion", "Bear", "Wolf", "Cheetah", "Fox", "Badger", "Weasel", "Mongoose", "Wild Boar", "Antelope",
          "Deer", "Ibex", "Hare", "Rabbit", "Squirrel", "Mouse", "Rat", "Bat", "Eagle", "Hawk", "Owl", "Dove",
          "Pigeon", "Quail", "Partridge", "Ostrich", "Peacock", "Crane", "Stork", "Swallow", "Sparrow", "Raven",
          "Crow", "Snake", "Lizard", "Crocodile", "Turtle", "Tortoise", "Frog", "Toad", "Fish", "Shark", "Whale",
          "Dolphin", "Insect", "Spider", "Scorpion", "Worm"
        ]
      }
    },
    {
      difficulty: "hard",
      data: {
        kings: [
          "Manasseh", "Zedekiah", "Shalmaneser", "Tiglath-Pileser", "Sennacherib", "Esarhaddon", "Belshazzar", "Cyrus", "Darius", "Artaxerxes",
          "Ahaz", "Jotham", "Amaziah", "Azariah", "Uzziah", "Joram"
        ],
        queens: [
          "Athaliah", "Maacah", "Taphath", "Basemath", "Keturah", "Shiphrah", "Puah", "Tryphena", "Tryphosa", "Bernice", // Removed more general terms.
          "Jezebel", "Huldah"
        ],
        prophets: [
          "Hosea", "Zephaniah", "Habakkuk", "Obadiah", "Nahum", "Malachi", "Micah", "Haggai", "Zechariah", "Joel",
          "Jeremiah", "Ezekiel", "Daniel", "Elisha", "Elijah"
        ],
        places: [
          "Assyria", "Gomorrah", "Gilead", "Perea", "Sodom", "Tarshish", "Ur", "Patmos", "Ammon", "Moab",
          "Mizraim", "Dedan", "Ezion-Geber", "Kadesh", "Bashan", "Shechem", "Ashkelon", "Zarephath", "Aram", "Sidon",
          "Hebron", "Antioch", "Emmaus", "Persia", "Ararat", "Nineveh", "Haran", "Carchemish", "Hamath", "Tyre",
          "Byblos", "Berytus", "Damascus", "Palmyra", "Petra", "Alexandria", "Ephesus", "Smyrna", "Pergamum", "Thyatira",
          "Sardis", "Philadelphia", "Laodicea" // Removed more general locations.
        ],
        rivers: ["Jabbok", "Sihon", "Chebar", "Hiddekel", "Shihor", "Ahava", "Abana", "Pharpar", "Ulai", "Great River"],
        animals: [
          "Behemoth", "Leviathan", "Cockatrice", "Chameleon", "Viper", "Adder", "Ibex",  // Removed Satyr - mythological creature.
          "Unicorn", "Ostrich" //Kept Unicorn as it appears in some translations of the Bible.
        ] //Kept only creatures that are mentioned in the Bible, whether real or mythological.
      }
    }
  ];

  constructor(mode, categories) {
    this.synth = window.speechSynthesis;
    this.start = document.getElementById("start");
    this.reveal = document.getElementById("reveal");
    this.speaker = document.getElementById("speaker");
    this.spelling = document.getElementById("spelling");
    this.submitButton = document.getElementById("submit");
    this.nextButton = document.getElementById("next");
    this.status = document.getElementById("status");

    this.mode = mode;
    this.categories = categories.length > 0 ? categories : ["kings"];
    this.words = this.getWordsForRound(this.mode, this.categories);
    this.currentWordIndex = 0;

    this.start.addEventListener("click", this.reStart.bind(this));
    this.reveal.addEventListener("click", this.revealSpelling.bind(this));
    this.speaker.addEventListener("click", this.speakWord.bind(this));
    this.submitButton.addEventListener("click", this.submitSpelling.bind(this));
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
      console.warn(
        `Invalid category "${category}" for difficulty "${difficulty}".`
      );
      return [];
    }

    let availableWords = [...entry.data[category]];
    const progressData = this.loadProgress();
    const selectedWords = [];

    // 1. Prepare words and weights:
    const weightedWords = [];

    availableWords.forEach((word) => {
      const progress = progressData[word] || { correct: 0, incorrect: 0 };
      let weight = 1; // Default weight for new words

      if (Object.keys(progressData).length !== 0 && progress) {
        // Only apply weighting if progress exists
        weight =
          1 / (Math.sqrt(progress.correct + 1) * (progress.incorrect + 1));
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

  revealSpelling() {
    const correctWord = this.words[this.currentWordIndex];

    this.status.innerHTML = `<span style="color: green;">The word was "${correctWord}". Click "Next" for the next word.</span>`;
    this.nextButton.style.display = "inline-block";
    this.saveProgress(correctWord, false, true); // Save correct attempt
  }
  submitSpelling() {
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
      this.status.innerHTML = `<span style="color: red;">Please attempt spelling before clicking "Submit".</span>`;
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
