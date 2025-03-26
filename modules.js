// game.js
const GameBot = {
  // Existing properties
  isSpeaking: false,
  currentSpeech: null,
  voices: [],
  voicesReady: false,
  isListening: false,
  recognition: null,

  // Default settings
  settings: {
    lang: "en-GB", // UK English
    pitch: 1,
    rate: 1,
    volume: 1,
    listenTimeout: 7000, // 7 seconds
  },

  /**
   * Initializes voices (called automatically on first speak if needed)
   */
  initVoices() {
    if (!window.speechSynthesis) return;

    // First try to get voices immediately
    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length > 0) {
      this.voicesReady = true;
      return;
    }

    // If not available, setup the event listener
    window.speechSynthesis.onvoiceschanged = () => {
      this.voices = window.speechSynthesis.getVoices();
      this.voicesReady = true;
      window.speechSynthesis.onvoiceschanged = null; // Cleanup
    };
  },

  /**
   * Speaks a statement using browser TTS with UK English
   * @param {string} statement - Text to be spoken
   * @param {function} [modifyFn] - Optional function to modify pronunciation
   */
  speak(statement, modifyFn) {
    // Initialize voices if not ready
    if (!this.voicesReady) {
      this.initVoices();
    }

    // Cancel any current speech
    this.stopSpeaking();

    // Apply modification if provided
    let textToSpeak = statement;
    if (modifyFn && typeof modifyFn === "function") {
      textToSpeak = modifyFn(statement);
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Configure utterance
    utterance.lang = this.settings.lang;
    utterance.pitch = this.settings.pitch;
    utterance.rate = this.settings.rate;
    utterance.volume = this.settings.volume;

    // Find a UK English voice
    const ukVoice = this.voices.find((voice) => voice.lang === "en-GB");
    if (ukVoice) {
      utterance.voice = ukVoice;
    }

    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentSpeech = utterance;
    };

    utterance.onend = utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentSpeech = null;
    };

    // Speak it
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Stops any current speech
   */
  stopSpeaking() {
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentSpeech = null;
    }
  },

  /**
   * Changes TTS settings
   * @param {object} newSettings - Partial settings object
   */
  configure(newSettings) {
    Object.assign(this.settings, newSettings);
  },

  /**
   * Starts speech recognition
   * @param {string} target - The target phrase to compare against
   * @param {function} [modifyFn] - Optional function to modify pronunciation
   * @returns {Promise<object>} Object with recognition results
   */
  listen(target, modifyFn) {
    return new Promise((resolve) => {
      if (!("webkitSpeechRecognition" in window)) {
        resolve({
          target,
          speech: "",
          accuracy: 0,
          error: "Speech recognition not supported",
        });
        return;
      }

      if (this.isListening) {
        this.stopListening();
      }

      this.isListening = true;
      this.recognition = new (window.webkitSpeechRecognition ||
        window.SpeechRecognition)();
      this.recognition.lang = this.settings.lang;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      let finalTranscript = "";
      let timeout;

      // Nested function to evaluate accuracy
      const evaluate = (speech, target) => {
        if (!speech || !target) return 0;

        // Apply modification if provided
        const processedTarget =
          modifyFn && typeof modifyFn === "function"
            ? modifyFn(target)
            : target;

        const processedSpeech =
          modifyFn && typeof modifyFn === "function"
            ? modifyFn(speech)
            : speech;

        // Simple accuracy calculation (can be enhanced)
        const targetWords = processedTarget.toLowerCase().split(/\s+/);
        const speechWords = processedSpeech.toLowerCase().split(/\s+/);

        let matches = 0;
        const maxLength = Math.max(targetWords.length, speechWords.length);

        for (let i = 0; i < maxLength; i++) {
          if (
            targetWords[i] &&
            speechWords[i] &&
            targetWords[i] === speechWords[i]
          ) {
            matches++;
          }
        }

        return (matches / maxLength) * 100;
      };

      // Event handlers
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        finalTranscript = transcript;

        // Reset timeout on each result
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.stopListening();
          resolve({
            target,
            speech: finalTranscript,
            accuracy: evaluate(finalTranscript, target),
            isComplete: true,
          });
        }, this.settings.listenTimeout);
      };

      this.recognition.onerror = (event) => {
        this.stopListening();
        resolve({
          target,
          speech: finalTranscript,
          accuracy: evaluate(finalTranscript, target),
          error: event.error,
        });
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Automatically restart if not manually stopped
          this.recognition.start();
        }
      };

      // Start listening
      this.recognition.start();

      // Set initial timeout
      timeout = setTimeout(() => {
        this.stopListening();
        resolve({
          target,
          speech: finalTranscript,
          accuracy: evaluate(finalTranscript, target),
          isComplete: !!finalTranscript,
        });
      }, this.settings.listenTimeout);
    });
  },

  /**
   * Stops speech recognition
   */
  stopListening() {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
      this.isListening = false;
      this.recognition = null;
    }
  },

  createUser(name, ageGroup) {
    return User.createUser(name, ageGroup);
  },

  loadUser(name, ageGroup) {
    return User.loadUser(name, ageGroup);
  },

  // Tile game - controlled instantiation
  createMatchingGame(tiles, containerId) {
    return new MatchingTilesGame(tiles, containerId);
  },

  showMessage(message) {
    // Create container if it doesn't exist
    if (!document.getElementById("pam-messages")) {
      const container = document.createElement("div");
      container.id = "pam-messages";
      document.body.appendChild(container);

      // Add global dismiss listener (only once)
      document.addEventListener("click", this.dismissMessage);
      document.addEventListener("keydown", this.dismissMessage);
    }

    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = "pam-message";
    messageElement.innerHTML = `
      <div class="pam-header">PAM</div>
      <div class="pam-content">${message}</div>
    `;

    // Add to container and animate in
    const container = document.getElementById("pam-messages");
    container.prepend(messageElement);

    setTimeout(() => {
      messageElement.style.opacity = "1";
    }, 10);

    // Add individual click handler
    messageElement.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering global dismiss
      this.animateDismiss(messageElement);
    });
  },

  dismissMessage: function () {
    const messages = document.querySelectorAll(".pam-message");
    messages.forEach((msg) => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 300);
    });
  },

  animateDismiss: function (element) {
    element.style.opacity = "0";
    setTimeout(() => element.remove(), 300);
  },
};

GameBot.initVoices();

export default GameBot;

class User {
  constructor(user_name, ageGroup, stats = {}) {
    this.user_name = user_name;
    this.ageGroup = ageGroup;
    this.stats = stats;
  }

  // Static method to create and save a new user
  static createUser(user_name, ageGroup) {
    if (User.userExists(user_name, ageGroup)) {
      throw new Error("User with this name and age group already exists");
    }

    const newUser = new User(user_name, ageGroup);
    newUser.saveToLocalStorage();
    return newUser;
  }

  // Updates existing user in localStorage
  static updateUser(user) {
    if (!(user instanceof User)) {
      throw new Error("Invalid user object");
    }

    if (!User.userExists(user.user_name, user.ageGroup)) {
      throw new Error("User not found");
    }

    user.saveToLocalStorage();
    return user;
  }

  // Deletes user from localStorage
  static deleteUser(user) {
    if (!(user instanceof User)) {
      throw new Error("Invalid user object");
    }

    localStorage.removeItem(User.getStorageKey(user.user_name, user.ageGroup));
  }

  // Checks if user exists in localStorage
  static userExists(user_name, ageGroup) {
    return (
      localStorage.getItem(User.getStorageKey(user_name, ageGroup)) !== null
    );
  }

  // Loads user from localStorage
  static loadUser(user_name, ageGroup) {
    const userData = localStorage.getItem(
      User.getStorageKey(user_name, ageGroup)
    );
    return userData ? User.fromJSON(userData) : null;
  }

  // Saves current user to localStorage
  saveToLocalStorage() {
    localStorage.setItem(
      User.getStorageKey(this.user_name, this.ageGroup),
      JSON.stringify(this.toJSON())
    );
  }

  // Helper method to generate storage key
  static getStorageKey(user_name, ageGroup) {
    return `user_${user_name}_${ageGroup}`;
  }

  // Converts user to JSON
  toJSON() {
    return {
      user_name: this.user_name,
      ageGroup: this.ageGroup,
      stats: this.stats,
    };
  }

  // Creates User instance from JSON
  static fromJSON(json) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new User(data.user_name, data.ageGroup, data.stats || {});
  }
}

class MatchingTilesGame {
  constructor(tilesData, containerID) {
    this.tilesData = tilesData;
    this.containerID = containerID;
    this.pairsCount = tilesData.length;
    this.tilePairs = [];
  }

  // Creates the tile elements and returns the node tree
  createTiles() {
    // Create main container
    const gameContainer = document.createElement("div");
    gameContainer.className = "tile-matching-game";

    // Create columns container
    const columnsContainer = document.createElement("div");
    columnsContainer.className = "columns-container";

    // Prepare tile pairs with unique IDs
    this.tilePairs = this.tilesData.map((pair, index) => {
      const pairId = (index + 1).toString().padStart(2, "0");
      return {
        id: pairId,
        left: { content: pair[0], pairId },
        right: { content: pair[1], pairId },
      };
    });

    // Create left and right columns
    const leftColumn = this.createColumn("left");
    const rightColumn = this.createColumn("right");

    // Shuffle tiles in each column
    this.shuffleTiles(leftColumn);
    this.shuffleTiles(rightColumn);

    // Build the node tree
    columnsContainer.appendChild(leftColumn);
    columnsContainer.appendChild(rightColumn);
    gameContainer.appendChild(columnsContainer);

    return gameContainer;
  }

  // Creates a single column of tiles
  createColumn(side) {
    const column = document.createElement("div");
    column.className = `column ${side}-column`;

    this.tilePairs.forEach((pair) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.pairId = pair.id;
      tile.dataset.side = side;
      tile.textContent = pair[side].content;
      column.appendChild(tile);
    });

    return column;
  }

  // Shuffles tiles within a column
  shuffleTiles(column) {
    for (let i = column.children.length; i >= 0; i--) {
      column.appendChild(column.children[(Math.random() * i) | 0]);
    }
  }

  // Renders the game to the specified container
  render() {
    const container = document.getElementById(this.containerID);
    if (!container) {
      console.error(`Container with ID ${this.containerID} not found`);
      return;
    }
    container.appendChild(this.createTiles());
  }
}