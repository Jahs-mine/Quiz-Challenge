// lexicon = [
//   [
//     {
//       kings: [],
//       queen: [],
//       prophets: [],
//       places: [],
//       rivers: [],
//     },
//   ],
//   [
//     {
//       kings: [],
//       queen: [],
//       prophets: [],
//       places: [],
//       rivers: [],
//     },
//   ],
//   [
//     {
//       kings: [],
//       queen: [],
//       prophets: [],
//       places: [],
//       rivers: [],
//     },
//   ],
// ];

lexicon = [  
    // Easy  
    [  
      {  
        kings: ["Saul", "David", "Solomon"],  
        queen: ["Queen of Sheba"],  
        prophets: ["Elijah", "Samuel"],  
        places: ["Jerusalem", "Bethlehem"],  
        rivers: ["Jordan", "Nile"],  
      },  
    ],  
    // Medium  
    [  
      {  
        kings: ["Hezekiah", "Josiah"],  
        queen: ["Esther"],  
        prophets: ["Isaiah", "Jeremiah", "Ezekiel"],  
        places: ["Nazareth", "Capernaum"],  
        rivers: ["Euphrates", "Tigris"],  
      },  
    ],  
    // Hard  
    [  
      {  
        kings: ["Manasseh", "Zedekiah"],  
        queen: ["Athaliah"],  
        prophets: ["Hosea", "Zephaniah", "Habakkuk"],  
        places: ["Hebron", "Gilead"],  
        rivers: ["Jabbok", "Sihon"],  
      },  
    ],  
  ]; 

btn = document.getElementById("start");
let mode = "",
  category = "";

btn.addEventListener("click", reStart);

function getSelectedRadio(name) {
  const selectedRadio = document.querySelector(`input[name="${name}"]:checked`); // Get the checked radio button
  if (selectedRadio) {
    return selectedRadio.value; // Return its value
  } else {
    console.log("nothing selected");
    return null; // Or return a default value, or handle the case where nothing is selected
  }
}
function reStart(event) {
  // Your restart logic goes here.  For example:
  console.log("Restart button clicked!");

  mode = getSelectedRadio("mode");
  category = getSelectedRadio("category");

  let words = getWordsForRound(mode,category);

  console.log(mode, category);
  console.log(words);
}

function getRandomWords(wordList, numWords) {
  const shuffled = [...wordList].sort(() => 0.5 - Math.random()); // Shuffle the array
  return shuffled.slice(0, numWords); // Take the first 'numWords'
}
function getWordsForRound(mode, category) {
  let words = [];
  if (mode === 3) {
    // "All" mode
    for (let i = 0; i < 3; i++) {
      // Iterate through all difficulty levels
      words = words.concat(getRandomWords(lexicon[i][0][category], 10)); //Get 10 words from each difficulty
    }
  } else {
    words = getRandomWords(lexicon[mode][0][category], 10);
  }

  return words;
}
