import Game from "./modules.js";

class BibleRecitationApp {
  constructor() {
    this.appContainer = document.getElementById("app-container");
    this.recitationData = null;
    this.selectedCategory = null;
    this.currentMode = null;
    this.currentVerseIndex = 0;
    this.currentRound = 1;
    this.roundSize = 5;
    this.learnedVerses = [];
    this.currentRecognition = null;
    this.inactivityTimer = null;

    Game.init("bible-recitation", {
      botMessages: {
        accountPrompt: "Select your account or create a new one",
        noAccountsFound: "No accounts found. Would you like to create one?",
        accountCreated: "Account created successfully!",
        loginSuccess: "Welcome back!",
        welcomeBack: "Welcome back! Ready to continue your Bible learning?",
        learningInstructions:
          "I'll read the verse first, then you try. Click 'Speak Verse' when you're ready.",
        correctResponse: "Perfect! You got it right!",
        tryAgain: "Almost there! Try speaking the verse again.",
        roundComplete: "Great job! You've completed this round!",
        categoryComplete:
          "Congratulations! You've completed all verses in this category!",
      },
    });

    this.loadData().then(() => {
      this.showAccountSelection();
    });
  }

  async loadData() {
    try {
      const response = await fetch("recitationData.json");
      this.recitationData = await response.json();
    } catch (error) {
      console.error("Error loading data:", error);
      this.showError("Error loading data. Please try again later.");
    }
  }

  showError(message) {
    this.appContainer.innerHTML = `
      <div class="error-container">
        <h2>Error</h2>
        <p>${message}</p>
        <button id="reloadBtn">Try Again</button>
      </div>
    `;
    document
      .getElementById("reloadBtn")
      .addEventListener("click", () => window.location.reload());
  }

  getAgeGroupLabel(ageGroup) {
    const labels = {
      teen: "Teen (13-15)",
      superTeen: "Super Teen (16-19)",
      adult: "Adult (20+)",
    };
    return labels[ageGroup] || "";
  }

  showAccountSelection() {
    const allUsers = JSON.parse(localStorage.getItem("bibleGameUsers")) || {};
    const accounts = Object.keys(allUsers).map((id) => ({
      id,
      name: allUsers[id].name,
      ageGroup: allUsers[id].ageGroup,
    }));

    let accountsHTML = "";
    let createAccountHTML = "";

    if (accounts.length > 0) {
      accountsHTML = accounts
        .map(
          (account) => `
        <div class="account-item" data-id="${account.id}">
          <span class="account-name">${account.name}</span>
          <span class="account-age">${this.getAgeGroupLabel(
            account.ageGroup
          )}</span>
        </div>
      `
        )
        .join("");
    } else {
      accountsHTML = '<div class="no-accounts-message">No accounts found</div>';
      createAccountHTML =
        '<button id="createAccountBtn" class="create-account-btn">Create New Account</button>';
    }

    this.appContainer.innerHTML = `
      <div class="account-container">
        <h1>Bible Verse Practice</h1>
        ${
          accounts.length > 0
            ? `<div class="bot-message">Select your account:</div>`
            : `<div class="bot-message" id="noAccountMessage"></div>`
        }
        <div class="accounts-list">
          ${accountsHTML}
        </div>
        ${createAccountHTML}
        ${
          accounts.length > 0
            ? '<button id="createAccountBtn" class="create-account-btn">Create New Account</button>'
            : ""
        }
      </div>
    `;

    if (accounts.length === 0) {
      Game.bot.send("noAccountsFound").then((message) => {
        document.getElementById("noAccountMessage").textContent = message;
      });
    }

    if (accounts.length > 0) {
      document.querySelectorAll(".account-item").forEach((item) => {
        item.addEventListener("click", () => {
          const userId = item.dataset.id;
          if (Game.selectAccount(userId)) {
            this.showMainMenu();
          }
        });
      });
    }

    document
      .getElementById("createAccountBtn")
      ?.addEventListener("click", () => {
        this.showCreateAccountForm();
      });
  }

  showCreateAccountForm() {
    this.appContainer.innerHTML = `
      <div class="account-form">
        <h2>Create New Account</h2>
        <div class="form-group">
          <label for="newUsername">Your Name:</label>
          <input type="text" id="newUsername" placeholder="Enter your name">
        </div>
        <div class="form-group">
          <label for="ageGroup">Age Group:</label>
          <select id="ageGroup">
            <option value="teen">Teen (13-15)</option>
            <option value="superTeen">Super Teen (16-19)</option>
            <option value="adult">Adult (20+)</option>
          </select>
        </div>
        <div class="form-actions">
          <button id="submitAccount" class="submit-btn">Create Account</button>
          <button id="cancelCreateAccount" class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.getElementById("submitAccount").addEventListener("click", () => {
      const name = document.getElementById("newUsername").value.trim();
      const ageGroup = document.getElementById("ageGroup").value;

      if (name) {
        Game.createAccount(name, ageGroup);
        this.showMainMenu();
      } else {
        alert("Please enter your name");
      }
    });

    document
      .getElementById("cancelCreateAccount")
      .addEventListener("click", () => {
        this.showAccountSelection();
      });
  }

  showMainMenu() {
    this.appContainer.innerHTML = `
      <div class="menu-container">
        <h1>Welcome, ${Game.user.name}!</h1>
        <div class="bot-message" id="mainMenuMessage"></div>
        <div class="button-grid">
          <button id="learnBtn" class="selection-btn">
            <span class="main-text">Learn Verses</span>
            <span class="sub-text">Study and memorize scripture</span>
          </button>
          <button id="matchBtn" class="selection-btn">
            <span class="main-text">Match Tiles</span>
            <span class="sub-text">Test your knowledge</span>
          </button>
        </div>
      </div>
    `;

    // Check if first time user
    const isFirstTime = !localStorage.getItem("hasUsedAppBefore");
    if (isFirstTime) {
      localStorage.setItem("hasUsedAppBefore", "true");
      this.showPAMIntroduction();
    } else {
      Game.bot.send("loginSuccess").then((message) => {
        document.getElementById("mainMenuMessage").textContent = message;
      });
    }

    document.getElementById("learnBtn").addEventListener("click", () => {
      this.currentMode = "learn";
      this.showCategorySelection();
    });

    document.getElementById("matchBtn").addEventListener("click", () => {
      this.currentMode = "match";
      this.showCategorySelection();
    });
  }

  showPAMIntroduction() {
    const pamHTML = `
      <div class="pam-container">
        <div class="pam-bubble">
          <div class="pam-content">
            <h3>Hello, I'm PAM!</h3>
            <p>Your Page Assistance Module for Bible learning. I'll guide you through memorizing scriptures.</p>
            <p>Click anywhere or press ENTER to continue.</p>
          </div>
        </div>
      </div>
    `;

    const existingMessage = document.getElementById("mainMenuMessage");
    if (existingMessage) {
      existingMessage.insertAdjacentHTML("afterend", pamHTML);
    } else {
      document
        .querySelector(".menu-container")
        .insertAdjacentHTML("afterbegin", pamHTML);
    }

    // Close PAM on click outside or ENTER
    const pamContainer = document.querySelector(".pam-container");
    const closePAM = () => {
      pamContainer.remove();
      document.removeEventListener("keydown", handleKeyPress);
      Game.bot.send("welcomeBack").then((message) => {
        document.getElementById("mainMenuMessage").textContent = message;
      });
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") closePAM();
    };

    pamContainer.addEventListener("click", closePAM);
    document.addEventListener("keydown", handleKeyPress);
  }

  showCategorySelection() {
    const title =
      this.currentMode === "learn" ? "Learn Verses" : "Match Verses";
    const prompt = this.currentMode === "learn" ? "learnPrompt" : "matchPrompt";

    this.appContainer.innerHTML = `
      <div class="category-container">
        <button class="back-button">← Back to Main Menu</button>
        <h2>${title}</h2>
        <div class="bot-message" id="categoryMessage"></div>
        <p>Select a category:</p>
        
        <div class="category-card" data-value="SANCTIFY/SANCTIFIED/SANCTIFICATION">
          <h3>Sanctify/Sanctified</h3>
          <p>Verses about sanctification and holiness</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
        
        <div class="category-card" data-value="CLEAN/CLEANSE/CLEANSING">
          <h3>Clean/Cleanse</h3>
          <p>Verses about purification and cleansing</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
        
        <div class="category-card" data-value="REDEEM/REDEEMED/REDEEMER">
          <h3>Redeem/Redeemed</h3>
          <p>Verses about redemption and salvation</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
        
        <div class="category-card" data-value="WAR">
          <h3>War</h3>
          <p>Verses about spiritual warfare</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
        
        <div class="category-card" data-value="SACRIFICE">
          <h3>Sacrifice</h3>
          <p>Verses about sacrifice and offering</p>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    `;

    Game.bot.send(prompt).then((message) => {
      document.getElementById("categoryMessage").textContent = message;
    });

    document.querySelector(".back-button").addEventListener("click", () => {
      this.showMainMenu();
    });

    document.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectedCategory = card.dataset.value;
        if (this.currentMode === "learn") {
          this.startLearningSession();
        } else {
          this.startMatchingGame();
        }
      });
    });

    // Load and display progress for each category
    this.loadCategoryProgress();
  }

  loadCategoryProgress() {
    const categories = document.querySelectorAll(".category-card");
    categories.forEach((card) => {
      const category = card.dataset.value;
      const learnedVerses =
        JSON.parse(
          localStorage.getItem(`learnedVerses_${Game.user.id}_${category}`)
        ) || [];
      const totalVerses =
        this.recitationData[Game.user.ageGroup][category].length;
      const progress = (learnedVerses.length / totalVerses) * 100;

      card.querySelector(".progress-bar").style.width = `${progress}%`;
    });
  }

  startLearningSession() {
    const verses =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];
    this.currentVerseIndex = 0;
    this.currentRound = 1;
    this.learnedVerses =
      JSON.parse(
        localStorage.getItem(
          `learnedVerses_${Game.user.id}_${this.selectedCategory}`
        )
      ) || [];

    this.appContainer.innerHTML = `
      <div class="learning-container">
        <button class="back-button">← Back to Categories</button>
        <h2>Learning: ${this.selectedCategory}</h2>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${
            (this.learnedVerses.length / verses.length) * 100
          }%"></div>
          <div class="progress-text">${this.learnedVerses.length}/${
      verses.length
    } verses learned</div>
        </div>
        <div class="bot-message" id="verseMessage"></div>
        <div id="verse-container"></div>
        <div class="learning-controls">
          <button id="speakBtn" class="speak-btn">Speak Verse</button>
          <button id="nextVerseBtn" class="nav-btn">Next Verse</button>
        </div>
        <div id="feedback-container"></div>
      </div>
    `;

    Game.bot.send("learningInstructions").then((message) => {
      document.getElementById("verseMessage").textContent = message;
      this.displayCurrentVerse();
    });

    document
      .getElementById("speakBtn")
      .addEventListener("click", () => this.attemptRecitation());
    document
      .getElementById("nextVerseBtn")
      .addEventListener("click", () => this.nextVerse());
    document.querySelector(".back-button").addEventListener("click", () => {
      this.showCategorySelection();
    });
  }

  displayCurrentVerse() {
    const verse = this.getCurrentVerse();
    const verseContainer = document.getElementById("verse-container");
    verseContainer.innerHTML = `
      <div class="verse-card">
        <h3>${verse.reference}</h3>
        <p class="verse-text">${Game.formatVerse(verse.verse)}</p>
      </div>
    `;

    // Speak the verse automatically
    Game.speak(`${verse.reference}. ${verse.verse}`);
  }

  getCurrentVerse() {
    return this.recitationData[Game.user.ageGroup][this.selectedCategory][
      this.currentVerseIndex
    ];
  }

  attemptRecitation() {
    const verse = this.getCurrentVerse();
    const fullText = `${verse.reference}. ${verse.verse}`;
    const feedbackContainer = document.getElementById("feedback-container");
    const speakBtn = document.getElementById("speakBtn");

    // Clear any previous recognition
    if (this.currentRecognition) {
      this.currentRecognition.stop();
      this.currentRecognition = null;
    }
    clearTimeout(this.inactivityTimer);

    // Change button to "Stop Listening" while listening
    speakBtn.textContent = "Stop Listening";
    speakBtn.classList.add("listening");

    feedbackContainer.innerHTML =
      '<p class="listening">Listening... Speak now!</p>';

    // Start listening continuously
    let userSpeech = "";
    Game.listenContinuous(
      fullText,
      (interimTranscript) => {
        // Display interim results
        if (interimTranscript) {
          feedbackContainer.innerHTML = `
            <p class="listening">Listening...</p>
            <div class="user-speech">
              <p>You said: <em>${interimTranscript}</em></p>
            </div>
          `;
          userSpeech = interimTranscript;
        }
      },
      (finalTranscript) => {
        userSpeech = finalTranscript;
      }
    )
      .then((recognitionObj) => {
        this.currentRecognition = recognitionObj;

        // Handle button click to stop listening
        const stopListening = () => {
          if (this.currentRecognition) {
            this.currentRecognition.stop();
            this.currentRecognition = null;
          }
          clearTimeout(this.inactivityTimer);
          speakBtn.textContent = "Speak Verse";
          speakBtn.classList.remove("listening");
          this.evaluateRecitation(userSpeech, fullText, verse);
        };

        // Set up new click handler
        speakBtn.onclick = stopListening;

        // Stop listening after 10 seconds of inactivity
        this.inactivityTimer = setTimeout(stopListening, 10000);
      })
      .catch((error) => {
        console.error("Recognition error:", error);
        feedbackContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        speakBtn.textContent = "Speak Verse";
        speakBtn.classList.remove("listening");
      });
  }

  evaluateRecitation(userSpeech, correctText, verse) {
    const feedbackContainer = document.getElementById("feedback-container");
    const similarity = Game.calculateSimilarity(userSpeech, correctText);

    if (similarity >= 0.8) {
      feedbackContainer.innerHTML = `
        <div class="feedback-result">
          <p class="success">Correct! Well done!</p>
          <div class="user-speech">
            <p>You said: <em>${userSpeech}</em></p>
          </div>
        </div>
        <button id="continueBtn" class="small-btn">Continue to Next Verse</button>
      `;

      this.markVerseAsLearned();
      Game.playSound("success");

      document.getElementById("continueBtn").addEventListener("click", () => {
        this.nextVerse();
      });
    } else if (similarity >= 0.5) {
      feedbackContainer.innerHTML = `
        <div class="feedback-result">
          <p class="partial">Close! You got ${Math.round(
            similarity * 100
          )}% correct.</p>
          <div class="user-speech">
            <p>You said: <em>${userSpeech}</em></p>
          </div>
          <p>Try again for better accuracy or continue if you're satisfied.</p>
        </div>
        <div class="feedback-actions">
          <button id="retryBtn" class="small-btn">Try Again</button>
          <button id="continueBtn" class="small-btn">Continue Anyway</button>
        </div>
      `;

      Game.playSound("partial");

      document.getElementById("retryBtn").addEventListener("click", () => {
        this.attemptRecitation();
      });

      document.getElementById("continueBtn").addEventListener("click", () => {
        this.markVerseAsLearned();
        this.nextVerse();
      });
    } else {
      feedbackContainer.innerHTML = `
        <div class="feedback-result">
          <p class="error">Not quite right. You got ${Math.round(
            similarity * 100
          )}% correct.</p>
          <div class="user-speech">
            <p>You said: <em>${userSpeech}</em></p>
          </div>
          <p>Please try again to continue.</p>
        </div>
        <button id="retryBtn" class="small-btn">Try Again</button>
      `;

      Game.playSound("error");

      document.getElementById("retryBtn").addEventListener("click", () => {
        this.attemptRecitation();
      });
    }
  }

  markVerseAsLearned() {
    const verse = this.getCurrentVerse();
    if (!this.learnedVerses.includes(verse.reference)) {
      this.learnedVerses.push(verse.reference);
      localStorage.setItem(
        `learnedVerses_${Game.user.id}_${this.selectedCategory}`,
        JSON.stringify(this.learnedVerses)
      );
      this.updateProgressBar();

      // Record successful recitation in user stats
      Game.user.recordGameAction("recitation", "successes");
    }
  }

  updateProgressBar() {
    const verses =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];
    const progress = (this.learnedVerses.length / verses.length) * 100;
    const progressBar = document.querySelector(".progress-bar");
    const progressText = document.querySelector(".progress-text");

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${this.learnedVerses.length}/${verses.length} verses learned`;
  }

  nextVerse() {
    const verses =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];
    this.currentVerseIndex++;

    if (this.currentVerseIndex >= verses.length) {
      // Finished all verses
      this.showCompletionScreen();
    } else {
      this.displayCurrentVerse();
      document.getElementById("feedback-container").innerHTML = "";

      // Check if round completed
      if (this.currentVerseIndex % this.roundSize === 0) {
        this.currentRound++;
        this.showRoundComplete();
      }
    }
  }

  showRoundComplete() {
    const verses =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];
    const roundCompleteHTML = `
      <div class="round-complete">
        <h3>Round ${this.currentRound - 1} Complete!</h3>
        <p>You've completed ${this.currentVerseIndex} of ${
      verses.length
    } verses</p>
        <button id="continueBtn" class="nav-btn">Continue</button>
      </div>
    `;

    document.getElementById("verse-container").innerHTML = roundCompleteHTML;
    document.getElementById("feedback-container").innerHTML = "";

    Game.bot.send("roundComplete").then(() => {
      document.getElementById("continueBtn").addEventListener("click", () => {
        this.displayCurrentVerse();
      });
    });
  }

  showCompletionScreen() {
    const verses =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];
    this.appContainer.innerHTML = `
      <div class="learning-container">
        <button class="back-button">← Back to Categories</button>
        <h2>Completed: ${this.selectedCategory}</h2>
        <div class="progress-container">
          <div class="progress-bar" style="width: 100%"></div>
          <div class="progress-text">${verses.length}/${
      verses.length
    } verses learned</div>
        </div>
        <div class="bot-message">
          ${Game.bot.replacePlaceholders("categoryComplete")}
        </div>
        <div class="completion-actions">
          <button id="restartBtn" class="nav-btn">Restart Category</button>
          <button id="newCategoryBtn" class="nav-btn">Choose New Category</button>
        </div>
      </div>
    `;

    document.getElementById("restartBtn").addEventListener("click", () => {
      this.startLearningSession();
    });

    document.getElementById("newCategoryBtn").addEventListener("click", () => {
      this.showCategorySelection();
    });

    document.querySelector(".back-button").addEventListener("click", () => {
      this.showCategorySelection();
    });
  }

  startMatchingGame() {
    const categoryData =
      this.recitationData[Game.user.ageGroup][this.selectedCategory];

    this.appContainer.innerHTML = `
      <div class="game-container">
        <button class="back-button">← Back to Categories</button>
        <h2>Matching Game: ${this.selectedCategory}</h2>
        <div class="bot-message" id="gameMessage"></div>
        <div class="matching-instructions">
          <p>Match each Bible reference to its corresponding verse by clicking on pairs</p>
        </div>
        <div class="matching-game-board" id="game-board"></div>
        <div id="game-status"></div>
        <button id="resetGameBtn" class="reset-btn">Reset Game</button>
      </div>
    `;

    Game.bot.send("matchPrompt").then((message) => {
      document.getElementById("gameMessage").textContent = message;
    });

    this.setupMatchingGame(categoryData);

    document.querySelector(".back-button").addEventListener("click", () => {
      this.showCategorySelection();
    });
  }

  setupMatchingGame(categoryData) {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    // Create two separate columns
    gameBoard.innerHTML = `
      <div class="matching-column" id="references-column">
        <h3 class="column-title">References</h3>
      </div>
      <div class="matching-column" id="verses-column">
        <h3 class="column-title">Verses</h3>
      </div>
    `;

    const referencesColumn = document.getElementById("references-column");
    const versesColumn = document.getElementById("verses-column");

    // Shuffle the verses
    const shuffledVerses = [...categoryData];
    this.shuffleArray(shuffledVerses);

    // Create reference tiles
    categoryData.forEach((item) => {
      const refTile = document.createElement("div");
      refTile.className = "matching-tile reference-tile";
      refTile.textContent = item.reference;
      refTile.dataset.reference = item.reference;
      referencesColumn.appendChild(refTile);
    });

    // Create verse tiles
    shuffledVerses.forEach((item) => {
      const verseTile = document.createElement("div");
      verseTile.className = "matching-tile verse-tile";
      verseTile.textContent = Game.formatVerse(item.verse);
      verseTile.dataset.reference = item.reference;
      versesColumn.appendChild(verseTile);
    });

    // Matching game logic
    let selectedReference = null;
    let matchedPairs = 0;
    const totalPairs = categoryData.length;

    // Update game status
    const updateStatus = () => {
      const statusElement = document.getElementById("game-status");
      statusElement.textContent = `Matches: ${matchedPairs}/${totalPairs}`;

      if (matchedPairs === totalPairs) {
        statusElement.innerHTML +=
          '<div class="success-message">All matches found!</div>';
      }
    };

    // Check if reference and verse match
    const checkMatch = (verseTile) => {
      if (selectedReference === verseTile.dataset.reference) {
        // Match found
        document
          .querySelectorAll(
            `.matching-tile[data-reference="${selectedReference}"]`
          )
          .forEach((tile) => {
            tile.classList.add("matched");
            tile.classList.remove("selected");
            tile.style.pointerEvents = "none"; // Disable further clicks
          });

        matchedPairs++;
        updateStatus();
        selectedReference = null;

        // Play success sound
        Game.playSound("success");
      } else {
        // No match
        Game.playSound("error");
        setTimeout(() => {
          document
            .querySelectorAll(".matching-tile.selected")
            .forEach((tile) => {
              tile.classList.remove("selected");
            });
          selectedReference = null;
        }, 1000);
      }
    };

    // Add click handlers
    document.querySelectorAll(".reference-tile").forEach((tile) => {
      tile.addEventListener("click", function () {
        if (this.classList.contains("matched")) return;

        // Clear previous selection
        document.querySelectorAll(".reference-tile.selected").forEach((t) => {
          t.classList.remove("selected");
        });

        // Select this tile
        this.classList.add("selected");
        selectedReference = this.dataset.reference;
      });
    });

    document.querySelectorAll(".verse-tile").forEach((tile) => {
      tile.addEventListener("click", function () {
        if (this.classList.contains("matched") || !selectedReference) return;

        // Clear previous selection
        document.querySelectorAll(".verse-tile.selected").forEach((t) => {
          t.classList.remove("selected");
        });

        // Select this tile
        this.classList.add("selected");
        checkMatch(this);
      });
    });

    // Initialize game status
    updateStatus();

    // Reset button functionality
    document.getElementById("resetGameBtn").addEventListener("click", () => {
      this.setupMatchingGame(categoryData);
    });
  }

  // Helper function to shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BibleRecitationApp();
});
