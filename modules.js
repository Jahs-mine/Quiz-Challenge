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
      setTimeout(() => msg.remove(), 7000);
    });
  },

  animateDismiss: function (element) {
    element.style.opacity = "0";
    setTimeout(() => element.remove(), 7000);
  },
};

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

  //Get current user frim local storage
  static getCurrent() {
    const currentUserData = localStorage.getItem('currentUser');
    return currentUserData ? User.fromJSON(currentUserData) : null;
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

  /**
   * Creates and renders a login page UI
   * @param {function} onLogin - Callback when user logs in successfully
   * @param {HTMLElement} container - Element to render the UI in
   */
  static createLogInPage(onLogin, container) {
    // Clear container
    container.innerHTML = "";

    // Get all users from localStorage
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("user_")) {
        const userData = localStorage.getItem(key);
        try {
          users.push(User.fromJSON(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }

    // Create UI elements
    const loginDiv = document.createElement("div");
    loginDiv.className = "user-login";

    if (users.length === 0) {
      loginDiv.innerHTML = `
        <h2>No accounts found</h2>
        <p>Please sign up first</p>
        <button class="switch-to-signup">Go to Sign Up</button>
      `;

      const switchBtn = loginDiv.querySelector(".switch-to-signup");
      switchBtn.addEventListener("click", () => {
        User.createSignUpPage(onLogin, container);
      });
    } else {
      loginDiv.innerHTML = `
        <h2>Select Your Account</h2>
        <div class="user-list"></div>
      `;

      const userList = loginDiv.querySelector(".user-list");

      users.forEach((user) => {
        const userBtn = document.createElement("button");
        userBtn.className = "user-account";
        userBtn.innerHTML = `
          <span class="user-name">${user.user_name}</span>
          <span class="user-age">${user.ageGroup}</span>
        `;

        userBtn.addEventListener("click", () => {
          // Set current user in localStorage
          localStorage.setItem("currentUser", JSON.stringify(user.toJSON()));
          if (onLogin) onLogin(user);
        });

        userList.appendChild(userBtn);
      });

      // Add sign up option
      const signUpOption = document.createElement("div");
      signUpOption.className = "signup-option";
      signUpOption.innerHTML = `<p>Don't have an account? <button class="switch-to-signup">Sign Up</button></p>`;

      const switchBtn = signUpOption.querySelector(".switch-to-signup");
      switchBtn.addEventListener("click", () => {
        User.createSignUpPage(onLogin, container);
      });

      loginDiv.appendChild(signUpOption);
    }

    container.appendChild(loginDiv);
  }

  /**
   * Creates and renders a sign up page UI
   * @param {function} onSignUp - Callback when user signs up successfully
   * @param {HTMLElement} container - Element to render the UI in
   */
  static createSignUpPage(onSignUp, container) {
    // Clear container
    container.innerHTML = "";

    const signupDiv = document.createElement("div");
    signupDiv.className = "user-signup";
    signupDiv.innerHTML = `
      <h2>Create Your Account</h2>
      <form class="signup-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label>Age Group:</label>
          <div class="age-options">
            <label>
              <input type="radio" name="ageGroup" value="teen" required>
              Teen (13-15)
            </label>
            <label>
              <input type="radio" name="ageGroup" value="superteen">
              Superteen (16-19)
            </label>
          </div>
        </div>
        <button type="submit">Create Account</button>
      </form>
      <div class="login-option">
        <p>Already have an account? <button class="switch-to-login">Log In</button></p>
      </div>
    `;

    const form = signupDiv.querySelector(".signup-form");
    const switchBtn = signupDiv.querySelector(".switch-to-login");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = form.username.value.trim();
      const ageGroup = form.ageGroup.value;

      if (!username || !ageGroup) {
        alert("Please fill in all fields");
        return;
      }

      try {
        const newUser = User.createUser(username, ageGroup);
        localStorage.setItem("currentUser", JSON.stringify(newUser.toJSON()));

        if (onSignUp) onSignUp(newUser);
      } catch (error) {
        alert(error.message);
      }
    });

    switchBtn.addEventListener("click", () => {
      User.createLogInPage(onSignUp, container);
    });

    container.appendChild(signupDiv);
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

GameBot.initVoices();

GameBot.User = {
  create: (name, ageGroup) => new User(name, ageGroup).saveToLocalStorage(),
  load: User.loadUser,
  exists: User.userExists,
  delete: User.deleteUser,
  signUp: User.createSignUpPage,
  logIn: User.createLogInPage,
  getCurrent: User.getCurrent,
};

// Keep the original class reference if needed elsewhere
GameBot.UserClass = User;
GameBot.MatchingTilesGame = MatchingTilesGame;

export default GameBot;
