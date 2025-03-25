const Game = {
  // Core properties
  user: null,
  bot: null,
  sessionId: null,
  currentGame: null,

  // Initialize with game-specific options
  init(gameType, options = {}) {
    // Session management
    this.sessionId = sessionStorage.getItem('gameSessionId') || this.generateSessionId();
    sessionStorage.setItem('gameSessionId', this.sessionId);
    sessionStorage.setItem('gameSessionTimestamp', Date.now());

    // User management
    this.user = new User();
    
    // Bot initialization with game-specific messages
    this.bot = new GameBot(this.user, {
      ...this.getDefaultMessages(gameType),
      ...options.botMessages
    });

    return this;
  },

  // Generate a unique session ID
  generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 12);
  },

  // Game-specific default messages
  getDefaultMessages(gameType) {
    const baseMessages = {
      greetings: [
        `Welcome back, {name}! Ready for ${gameType}?`,
        `Good to see you again, {name}! Let's play ${gameType}.`
      ],
      congratulations: [
        "Great job, {name}!",
        "Well done, {name}!"
      ],
      encouragement: [
        "Keep trying, {name}!",
        "You can do it, {name}!"
      ]
    };

    switch(gameType) {
      case 'matching':
        return {
          ...baseMessages,
          instructions: "Match the verses with their references",
          gameComplete: "You've matched all the pairs!"
        };
      case 'recitation':
        return {
          ...baseMessages,
          instructions: "Repeat the verse after hearing it",
          gameComplete: "Perfect recitation!"
        };
      default:
        return baseMessages;
    }
  },

  // Account management methods
  createAccount(name, ageGroup) {
    this.user.updateName(name);
    this.user.updateAgeGroup(ageGroup);
    return this.user;
  },

  selectAccount(userId) {
    const allUsers = JSON.parse(localStorage.getItem('bibleGameUsers') || '{}');
    if (allUsers[userId]) {
      localStorage.setItem('bibleGameCurrentUser', userId);
      this.user = new User(); // Will auto-load the selected user
      return true;
    }
    return false;
  },

  // Game management
  startGame(gameType, config) {
    this.currentGame = this.createGameInstance(gameType, config);
    return this.currentGame;
  },

  createGameInstance(gameType, config) {
    switch(gameType) {
      case 'matching':
        return new MatchingGame(config.data, config.containerId, this.bot);
      case 'recitation':
        return new RecitationGame(config.data, this.bot);
      // Add other game types here
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  },

  // ===== Core Game Methods =====
  listen(state, statement) {
    return new Promise((resolve, reject) => {
      if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        console.error("Speech Recognition API is not supported.");
        reject(new Error("Speech Recognition API is not supported."));
        return;
      }

      let recognition;

      if (state === "start") {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList =
          window.SpeechGrammarList || window.webkitSpeechGrammarList;

        recognition = new SpeechRecognition();

        if (statement) {
          const speechRecognitionList =
            this.createGrammarListFromStatement(statement);
          recognition.grammars = speechRecognitionList;
        }

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-UK";

        recognition.onstart = () => {
          console.log("Speech recognition started.");
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          console.log("Transcript:", transcript);
          document.getElementById("output").textContent = transcript;
          resolve({
            transcript,
            matched: this.checkMatch(transcript, statement),
            confidence,
          });
        };

        recognition.onend = () => {
          console.log("Speech recognition ended.");
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          reject(event.error);
        };

        recognition.start();
      } else if (state === "stop" && recognition) {
        recognition.abort();
        resolve({ transcript: null, matched: false });
      }
    });
  },

  createGrammarListFromStatement(statement) {
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionList = new SpeechGrammarList();

    const sanitizedStatement = statement.toLowerCase().trim();
    const grammarString = `#JSGF V1.0; grammar statementGrammar; public <phrase> = "${sanitizedStatement}" ;`;
    speechRecognitionList.addFromString(grammarString);

    return speechRecognitionList;
  },

  checkMatch(transcript, statement) {
    const sanitizedTranscript = transcript.toLowerCase().trim();
    const sanitizedStatement = statement.toLowerCase().trim();
    return sanitizedTranscript === sanitizedStatement;
  },

  formatVerse(verse) {
    return verse.replace(/,/g, ", ");
  },

  speak(text) {
    return new Promise((resolve, reject) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event.error);
        window.speechSynthesis.speak(utterance);
      } else {
        reject(new Error("Text-to-speech is not supported in this browser."));
      }
    });
  }
};

// Enhanced User class with cross-game stats
class User {
  constructor() {
    this.currentUserId = localStorage.getItem('bibleGameCurrentUser');
    this.loadUserData();
  }

  loadUserData() {
    const allUsers = JSON.parse(localStorage.getItem('bibleGameUsers') || '{}');
    
    if (this.currentUserId && allUsers[this.currentUserId]) {
      const userData = allUsers[this.currentUserId];
      this.id = this.currentUserId;
      this.name = userData.name;
      this.ageGroup = userData.ageGroup;
      this.preferences = userData.preferences || {};
      this.stats = {
        ...this.createDefaultStats(),
        ...(userData.stats || {})
      };
    } else {
      this.id = 'guest-' + Math.random().toString(36).substr(2, 9);
      this.name = 'Guest';
      this.ageGroup = null;
      this.preferences = {};
      this.stats = this.createDefaultStats();
      this.saveUserData();
    }
  }

  createDefaultStats() {
    return {
      totalGamesPlayed: 0,
      lastPlayed: new Date().toISOString(),
      games: {
        matching: { plays: 0, completions: 0 },
        recitation: { attempts: 0, successes: 0 }
      }
    };
  }

  saveUserData() {
    const allUsers = JSON.parse(localStorage.getItem('bibleGameUsers') || '{}');
    allUsers[this.id] = {
      name: this.name,
      ageGroup: this.ageGroup,
      preferences: this.preferences,
      stats: this.stats
    };
    localStorage.setItem('bibleGameUsers', JSON.stringify(allUsers));
    localStorage.setItem('bibleGameCurrentUser', this.id);
  }

  updateName(newName) {
    this.name = newName || 'Guest';
    this.saveUserData();
  }

  updateAgeGroup(ageGroup) {
    this.ageGroup = ageGroup;
    this.saveUserData();
  }

  recordGameAction(gameType, action, value = 1) {
    if (!this.stats.games[gameType]) {
      this.stats.games[gameType] = {};
    }
    this.stats.games[gameType][action] = (this.stats.games[gameType][action] || 0) + value;
    this.stats.totalGamesPlayed += value;
    this.stats.lastPlayed = new Date().toISOString();
    this.saveUserData();
  }
}

// Flexible GameBot class
class GameBot {
  constructor(user, messages = {}) {
    this.user = user;
    this.messages = messages;
    this.messageQueue = [];
    this.isSpeaking = false;
  }

  send(messageType, customText) {
    const message = customText || this.getRandomMessage(messageType);
    
    if (!message) {
      console.warn(`No message defined for type: ${messageType}`);
      return Promise.resolve();
    }

    const processedMessage = this.replacePlaceholders(message);
    
    return new Promise(resolve => {
      this.messageQueue.push({ text: processedMessage, resolve });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.isSpeaking || this.messageQueue.length === 0) return;
    
    this.isSpeaking = true;
    const { text, resolve } = this.messageQueue.shift();
    
    this.speak(text).then(() => {
      this.isSpeaking = false;
      resolve();
      this.processQueue();
    });
  }

  getRandomMessage(type) {
    const messages = this.messages[type];
    if (!messages || messages.length === 0) return null;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  replacePlaceholders(text) {
    return text.replace('{name}', this.user.name)
               .replace('{ageGroup}', this.user.ageGroup || '');
  }

  speak(text) {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  // Convenience methods
  greet() {
    return this.send('greetings');
  }

  congratulate() {
    return this.send('congratulations');
  }

  encourage() {
    return this.send('encouragement');
  }

  giveInstructions() {
    return this.send('instructions');
  }

  announceCompletion() {
    return this.send('gameComplete');
  }
}

// MatchingGame class
class MatchingGame {
  constructor(data, containerId, bot) {
    this.data = data;
    this.container = document.getElementById(containerId);
    this.bot = bot;
    this.selectedTiles = [];
    this.matchedPairs = [];

    Game.user.recordGameAction('matching', 'plays');
    this.bot.giveInstructions().then(() => {
      this.shuffleData();
      this.createTiles();
    });
  }

  shuffleData() {
    for (let i = this.data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
  }

  createTiles() {
    this.container.innerHTML = '';
    const columnsWrapper = document.createElement('div');
    columnsWrapper.className = 'columns-wrapper';

    const referenceColumn = document.createElement('div');
    referenceColumn.className = 'column';
    this.data.forEach((pair, index) => {
      const tile = this.createTile(pair[0], index, 'reference');
      referenceColumn.appendChild(tile);
    });

    const textColumn = document.createElement('div');
    textColumn.className = 'column';
    this.data.forEach((pair, index) => {
      const tile = this.createTile(pair[1], index, 'text');
      textColumn.appendChild(tile);
    });

    columnsWrapper.appendChild(referenceColumn);
    columnsWrapper.appendChild(textColumn);
    this.container.appendChild(columnsWrapper);
  }

  createTile(content, pairId, type) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.pairId = pairId;
    tile.dataset.type = type;
    tile.textContent = content;

    tile.addEventListener('click', () => this.handleTileClick(tile));
    return tile;
  }

  handleTileClick(tile) {
    if (tile.classList.contains('matched')) return;

    this.selectedTiles.push(tile);
    tile.classList.add('selected');

    if (this.selectedTiles.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    const [tile1, tile2] = this.selectedTiles;

    if (tile1.dataset.pairId === tile2.dataset.pairId) {
      tile1.classList.add('matched');
      tile2.classList.add('matched');
      this.matchedPairs.push([tile1, tile2]);

      if (this.matchedPairs.length === this.data.length) {
        this.handleGameComplete();
      }
    } else {
      setTimeout(() => {
        tile1.classList.remove('selected');
        tile2.classList.remove('selected');
        this.bot.encourage();
      }, 1000);
    }

    this.selectedTiles = [];
  }

  handleGameComplete() {
    Game.user.recordGameAction('matching', 'completions');
    this.bot.announceCompletion();
  }
}

// RecitationGame class (example for another game type)
class RecitationGame {
  constructor(data, bot) {
    this.verses = data;
    this.bot = bot;
    this.currentVerseIndex = 0;
    
    Game.user.recordGameAction('recitation', 'attempts');
    this.startRecitation();
  }

  startRecitation() {
    this.bot.giveInstructions().then(() => {
      this.playCurrentVerse();
    });
  }

  playCurrentVerse() {
    const currentVerse = this.verses[this.currentVerseIndex];
    this.bot.send('versePrompt', `Please recite: ${currentVerse.reference}`)
      .then(() => Game.speak(currentVerse.text))
      .then(() => this.listenForRecitation(currentVerse.text));
  }

  listenForRecitation(expectedText) {
    Game.listen('start', expectedText).then(result => {
      if (result.matched) {
        Game.user.recordGameAction('recitation', 'successes');
        this.bot.congratulate().then(() => this.nextVerse());
      } else {
        this.bot.encourage().then(() => this.playCurrentVerse());
      }
    });
  }

  nextVerse() {
    this.currentVerseIndex++;
    if (this.currentVerseIndex < this.verses.length) {
      this.playCurrentVerse();
    } else {
      this.bot.announceCompletion();
    }
  }
}

export default Game;