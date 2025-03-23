const Game = {
  // Public method for speech recognition
  listen(state, statement) {
    return new Promise((resolve, reject) => {
      // Check for browser support
      if (
        !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
      ) {
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

        // Add grammar list if a statement is provided
        if (statement) {
          const speechRecognitionList =
            this.createGrammarListFromStatement(statement);
          recognition.grammars = speechRecognitionList;
        }

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-UK";

        // Event handlers
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

        // Start recognition
        recognition.start();
      } else if (state === "stop" && recognition) {
        // Stop recognition
        recognition.abort();
        resolve({ transcript: null, matched: false });
      }
    });
  },

  // Helper method for creating grammar list from a statement
  createGrammarListFromStatement(statement) {
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionList = new SpeechGrammarList();

    const sanitizedStatement = statement.toLowerCase().trim();
    const grammarString = `#JSGF V1.0; grammar statementGrammar; public <phrase> = "${sanitizedStatement}" ;`;
    speechRecognitionList.addFromString(grammarString);

    return speechRecognitionList;
  },

  // Helper method for checking if a transcript matches a statement
  checkMatch(transcript, statement) {
    const sanitizedTranscript = transcript.toLowerCase().trim();
    const sanitizedStatement = statement.toLowerCase().trim();

    return sanitizedTranscript === sanitizedStatement;
  },

  // Helper method for formatting verses
  formatVerse(verse) {
    return verse.replace(/,/g, ", ");
  },

  // Public method for text-to-speech
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
  },

  // New method: Create a matching game
  createMatchingGame(data, containerId) {
    // Initialize a new MatchingGame instance
    this.matchingGame = new MatchingGame(data, containerId);
  },
};

class MatchingGame {
  constructor(data, containerId) {
    this.data = data; // 2D array of pairs, e.g., [["John 3:16", "For God so loved..."], ...]
    this.container = document.getElementById(containerId); // Container for the game
    this.selectedTiles = []; // Stores currently selected tiles
    this.matchedPairs = []; // Stores matched pairs

    // Shuffle the data to randomize tile positions
    this.shuffleData();

    // Create and render the tiles
    this.createTiles();
  }

  // Shuffle the data array to randomize tile positions
  shuffleData() {
    for (let i = this.data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
  }

  // Create and render tiles
  createTiles() {
    // Clear the container
    this.container.innerHTML = "";

    // Create a wrapper for the columns
    const columnsWrapper = document.createElement("div");
    columnsWrapper.className = "columns-wrapper";

    // Create the reference column
    const referenceColumn = document.createElement("div");
    referenceColumn.className = "column";
    this.data.forEach((pair, index) => {
      const tile = this.createTile(pair[0], index, "reference");
      referenceColumn.appendChild(tile);
    });

    // Create the text column
    const textColumn = document.createElement("div");
    textColumn.className = "column";
    this.data.forEach((pair, index) => {
      const tile = this.createTile(pair[1], index, "text");
      textColumn.appendChild(tile);
    });

    // Append columns to the wrapper
    columnsWrapper.appendChild(referenceColumn);
    columnsWrapper.appendChild(textColumn);

    // Append the wrapper to the container
    this.container.appendChild(columnsWrapper);
  }

  // Create a single tile
  createTile(content, pairId, type) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.pairId = pairId; // Unique identifier for matching
    tile.dataset.type = type; // "reference" or "text"
    tile.textContent = content;

    // Add click event listener
    tile.addEventListener("click", () => this.handleTileClick(tile));

    return tile;
  }

  // Handle tile clicks
  handleTileClick(tile) {
    // Ignore if the tile is already matched
    if (tile.classList.contains("matched")) return;

    // Add the tile to the selected tiles array
    this.selectedTiles.push(tile);

    // Highlight the selected tile
    tile.classList.add("selected");

    // Check if two tiles are selected
    if (this.selectedTiles.length === 2) {
      this.checkMatch();
    }
  }

  // Check if the selected tiles are a match
  checkMatch() {
    const [tile1, tile2] = this.selectedTiles;

    // Check if the tiles have the same pairId (i.e., they are a pair)
    if (tile1.dataset.pairId === tile2.dataset.pairId) {
      // Mark tiles as matched
      tile1.classList.add("matched");
      tile2.classList.add("matched");

      // Add the pair to the matched pairs array
      this.matchedPairs.push([tile1, tile2]);

      // Check if all pairs have been matched
      if (this.matchedPairs.length === this.data.length) {
        this.handleGameComplete();
      }
    } else {
      // Deselect tiles after a short delay
      setTimeout(() => {
        tile1.classList.remove("selected");
        tile2.classList.remove("selected");
      }, 1000);
    }

    // Clear the selected tiles array
    this.selectedTiles = [];
  }

  // Handle game completion
  handleGameComplete() {
    alert("Congratulations! You've matched all the pairs.");
  }
}
export default Game;
