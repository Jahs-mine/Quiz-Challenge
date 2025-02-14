const Game = {
  listen(state, statement) {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      if (state === "start") {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList =
          window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const SpeechRecognitionEvent =
          window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

        const recognition = new SpeechRecognition();
        if (statement) {
          const speechRecognitionList = new createGrammarListFromStatement(
            statement
          );
          recognition.grammars = speechRecognitionList;
        }

        recognition.continuous = true; // Stop recognition after one utterance
        recognition.interimResults = false; // Don't provide interim results
        recognition.lang = "en-US"; // Set language (e.g., 'es-ES', 'fr-FR')

        recognition.onstart = () => {
          console.log("Speech recognition started.");
          // Update UI, e.g., show a microphone icon
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Transcript:", transcript);
          // Do something with the transcript (e.g., display it, send it to a server)
          document.getElementById("output").textContent = transcript; // Example: Display in a <p> tag
        };

        recognition.abort = () => {
          console.log("Speech recognition ended.");
          // Update UI, e.g., hide the microphone icon
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          // Handle errors
        };

        recognition.start();

        function createGrammarListFromStatement(statement) {
          const speechRecognitionList = new SpeechGrammarList();

          // 1. Sanitize the statement (Important!)
          const sanitizedStatement = statement.toLowerCase().trim(); // Convert to lowercase and remove leading/trailing spaces

          // 2. Extract words (handle punctuation)
          const words = sanitizedStatement
            .split(/\s+/)
            .filter((word) => word !== ""); // Split by whitespace, remove empty strings

          // 3. Create the grammar string (using SRGS for robustness)
          let grammarString =
            "#JSGF V1.0; grammar statementGrammar; public <word> = ";

          if (words.length === 0) {
            grammarString += " <NULL> ;"; // Handle empty statements gracefully.
          } else {
            grammarString += words.join(" | ") + ";";
          }

          speechRecognitionList.addFromString(grammarString);

          return speechRecognitionList;
        }
      } else {
        recognition.abort();
      }
    } else {
      console.error("Speech Recognition API is not supported.");
      // Handle the error (e.g., display a message)
    }
  },
};

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

startButton.addEventListener("click", () =>
  Game.listen("start", "For God so loved the world, hath thou heard")
);
stopButton.addEventListener("click", () => Game.listen("stop"));
