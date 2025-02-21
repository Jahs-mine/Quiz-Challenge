// gameModule.js

const Game = {
  listen(state, statement) {
    return new Promise((resolve, reject) => {
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        let recognition;

        if (state === "start") {
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          const SpeechGrammarList =
            window.SpeechGrammarList || window.webkitSpeechGrammarList;

          recognition = new SpeechRecognition();

          if (statement) {
            const speechRecognitionList = this.createGrammarListFromStatement(
              statement
            );
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
            console.log("Transcript:", transcript);
            document.getElementById("output").textContent = transcript;
            resolve({ transcript, matched: this.checkMatch(transcript, statement) });
          };

          recognition.onend = () => {
              console.log("Speech recognition ended.");
          }

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            reject(event.error);
          };

          recognition.start();
        } else if (state === "stop" && recognition) {
          recognition.abort();
          resolve({transcript: null, matched: false})
        }
      } else {
        console.error("Speech Recognition API is not supported.");
        reject(new Error("Speech Recognition API is not supported."));
      }
    });
  },

  createGrammarListFromStatement(statement) {
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionList = new SpeechGrammarList();

    const sanitizedStatement = statement.toLowerCase().trim();
    const words = sanitizedStatement
      .split(/\s+/)
      .filter((word) => word !== "");

    let grammarString = "#JSGF V1.0; grammar statementGrammar; public <word> = ";

    if (words.length === 0) {
      grammarString += " <NULL> ;";
    } else {
      grammarString += words.join(" | ") + " ;";
    }

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
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-speech is not supported in this browser.");
    }
  },
};

export default Game;

