import Game from "./modules.js";

class RecitationGame {
  constructor() {
    this.selectedAge = null;
    this.selectedCategory = null;
    this.usedTiles = []; // Track tiles that have been matched
    this.createLandingPage();
  }

  createLandingPage() {
    const body = document.body;
    body.innerHTML = ""; // Clear previous content

    // Create age group card
    const ageGroupCard = document.createElement("div");
    ageGroupCard.className = "card";
    ageGroupCard.id = "ageGroupCard";
    ageGroupCard.innerHTML = `
      <h2>Welcome to Bible Recitation Practice</h2>
      <p>Learn the verses gradually and practice more along the way.</p>
      <p>Select an age group:</p>
      <input type="radio" name="ageGroup" id="teen13" value="teen13-15" />
      <label for="teen13">Teen: 13-15</label><br />
      <input type="radio" name="ageGroup" id="superTeen16" value="superTeen16-19" />
      <label for="superTeen16">Super Teen: 16-19</label>
    `;

    // Create category card (hidden initially)
    const categoryCard = document.createElement("div");
    categoryCard.className = "card hidden";
    categoryCard.id = "categoryCard";
    categoryCard.innerHTML = `
      <h4>Select a category to practice:</h4>
      <ul id="categoryList">
        <li>
          <input type="radio" name="category" id="sanctifyRadio" value="SANCTIFY/SANCTIFIED/SANCTIFICATION" />
          <label for="sanctifyRadio">Sanctify/Sanctified/Sanctification</label>
        </li>
        <li>
          <input type="radio" name="category" id="cleanRadio" value="CLEAN, CLEANSE, CLEANSING" />
          <label for="cleanRadio">Clean, Cleanse, Cleansing</label>
        </li>
        <li>
          <input type="radio" name="category" id="redeemRadio" value="REDEEM/REDEEMED/REDEEMER" />
          <label for="redeemRadio">Redeem/Redeemed/Redeemer</label>
        </li>
        <li>
          <input type="radio" name="category" id="warRadio" value="WAR" />
          <label for="warRadio">War</label>
        </li>
        <li>
          <input type="radio" name="category" id="sacrificeRadio" value="SACRIFICE" />
          <label for="sacrificeRadio">Sacrifice</label>
        </li>
      </ul>
      <button id="startButton">Start</button>
    `;

    // Append cards to the body
    body.appendChild(ageGroupCard);
    body.appendChild(categoryCard);

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Age group selection
    document.querySelectorAll('input[name="ageGroup"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        this.selectedAge = radio.value;
        this.showCategoryCard();
      });
    });

    // Category selection
    document.querySelectorAll('input[name="category"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          this.selectedCategory = radio.value;
        }
      });
    });

    // Start button event listener
    document.getElementById("startButton").addEventListener("click", () => {
      this.startTileMatchingGame();
    });
  }

  showCategoryCard() {
    const ageGroupCard = document.getElementById("ageGroupCard");
    const categoryCard = document.getElementById("categoryCard");

    // Hide age group card
    ageGroupCard.classList.add("hidden");

    // Show category card after a short delay
    setTimeout(() => {
      categoryCard.classList.remove("hidden");
    }, 300);
  }

  startTileMatchingGame() {
    const body = document.body;
    body.innerHTML = ""; // Clear previous content

    // Create game container
    const gameContainer = document.createElement("div");
    gameContainer.id = "gameContainer";
    body.appendChild(gameContainer);

    // Get the selected category data
    const categoryData =
      RecitationGame.data[this.selectedAge][this.selectedCategory];

    // Prepare data for the tile matching game
    const tileData = categoryData.map((item) => ({
      reference: item.reference,
      verse: item.verse,
    }));

    // Initialize the tile matching game
    this.createTileMatchingGame(tileData, gameContainer);
  }

  createTileMatchingGame(tileData, container) {
    // Filter out tiles that have already been used
    const availableTiles = tileData.filter(
      (tile) => !this.usedTiles.includes(tile.reference)
    );
  
    // Shuffle the available tiles
    const shuffledData = this.shuffleArray([...availableTiles]);
  
    // Limit to 5 pairs per round
    const limitedData = shuffledData.slice(0, 5);
  
    // Clear the container before adding new tiles
    container.innerHTML = "";
  
    // Create two columns: one for references and one for verses
    const referenceColumn = document.createElement("div");
    referenceColumn.className = "column";
    const verseColumn = document.createElement("div");
    verseColumn.className = "column";
  
    // Create tiles for references and verses
    limitedData.forEach((item, index) => {
      const referenceTile = this.createTile(item.reference, index, "reference");
      const verseTile = this.createTile(item.verse, index, "verse");
  
      // Append tiles to their respective columns
      referenceColumn.appendChild(referenceTile);
      verseColumn.appendChild(verseTile);
    });
  
    // Shuffle the order of tiles within each column
    this.shuffleColumn(referenceColumn);
    this.shuffleColumn(verseColumn);
  
    // Append columns to the container
    container.appendChild(referenceColumn);
    container.appendChild(verseColumn);
  
    // Add click event listeners to tiles
    this.setupTileEventListeners();
  }

  createTile(content, id, type) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.id = id; // Unique identifier for matching
    tile.dataset.type = type; // "reference" or "verse"
    tile.textContent = content;

    // Add click event listener
    tile.addEventListener("click", () => this.handleTileClick(tile));

    return tile;
  }

  handleTileClick(tile) {
    // Ignore if the tile is already matched
    if (tile.classList.contains("matched")) return;
  
    // Get all currently selected tiles
    const selectedTiles = document.querySelectorAll(".tile.selected");
  
    // If two tiles are already selected, do nothing
    if (selectedTiles.length >= 2) return;
  
    // Check if the selected tile is from the same column as the previously selected tile
    if (selectedTiles.length === 1) {
      const firstTile = selectedTiles[0];
      if (firstTile.dataset.type === tile.dataset.type) {
        // If the tiles are from the same column, reset the first selection
        firstTile.classList.remove("selected");
        // Keep the last selection (the current tile)
        tile.classList.add("selected");
        return;
      }
    }
  
    // Highlight the selected tile
    tile.classList.add("selected");
  
    // Check if two tiles are selected
    if (selectedTiles.length + 1 === 2) {
      this.checkMatch(selectedTiles[0], tile);
    }
  }
  checkMatch(tile1, tile2) {
    if (tile1.dataset.id === tile2.dataset.id) {
      // Correct match: apply green background
      tile1.classList.add("matched");
      tile2.classList.add("matched");

      // Add the reference to the usedTiles array
      const reference = tile1.textContent.trim();
      this.usedTiles.push(reference);

      // Remove matched tiles from the DOM after a delay
      setTimeout(() => {
        tile1.remove();
        tile2.remove();
      }, 500); // Adjust delay to match CSS animation

      // Check if all tiles have been matched
      const remainingTiles = document.querySelectorAll(".tile");
      if (remainingTiles.length === 0) {
        alert("Congratulations! You've matched all the pairs in this round.");
        this.startNextRound(); // Start the next round
      }
    } else {
      // Incorrect match: apply orange background
      tile1.classList.add("incorrect");
      tile2.classList.add("incorrect");

      // Deselect tiles after a short delay
      setTimeout(() => {
        tile1.classList.remove("selected", "incorrect");
        tile2.classList.remove("selected", "incorrect");
      }, 1000);
    }
  }
  startNextRound() {
    const gameContainer = document.getElementById("gameContainer");
    const categoryData =
      RecitationGame.data[this.selectedAge][this.selectedCategory];
    const tileData = categoryData.map((item) => ({
      reference: item.reference,
      verse: item.verse,
    }));

    // Start the next round with the remaining tiles
    this.createTileMatchingGame(tileData, gameContainer);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  shuffleColumn(column) {
    const tiles = Array.from(column.children); // Convert HTMLCollection to array
    const shuffledTiles = this.shuffleArray(tiles); // Shuffle the tiles
    column.innerHTML = ""; // Clear the column
    shuffledTiles.forEach((tile) => column.appendChild(tile)); // Append shuffled tiles
  }

  static data = {
    "teen13-15": {
      "SANCTIFY/SANCTIFIED/SANCTIFICATION": [
        {
          reference: "1 Thessalonians 4:3",
          verse:
            "For this is the will of God, even your sanctification, that ye should abstain from fornication: ",
        },
        {
          reference: "1 Thessalonians 4:4",
          verse:
            "That every one of you should know how to possess his vessel in sanctification and honour; ",
        },
        {
          reference: "2 Thessalonians 2:13",
          verse:
            "But we are bound to give thanks alway to God for you, brethren beloved of the Lord, because God hath from the beginning chosen you to salvation through sanctification of the Spirit and belief of the truth: ",
        },
        {
          reference: "1 Peter 1:2",
          verse:
            "Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ: Grace unto you, and peace, be multiplied. ",
        },
        {
          reference: "Exodus 13:2",
          verse:
            "Sanctify unto me all the firstborn, whatsoever openeth the womb among the children of Israel, both of man and of beast: it is mine. ",
        },
        {
          reference: "Exodus 19:22",
          verse:
            "And let the priests also, which come near to the LORD, sanctify themselves, lest the LORD break forth upon them. ",
        },
        {
          reference: "Exodus 30:29",
          verse:
            "And thou shalt sanctify them, that they may be most holy: whatsoever toucheth them shall be holy.",
        },
        {
          reference: "Exodus 31:13",
          verse:
            "Speak thou also unto the children of Israel, saying, Verily my sabbaths ye shall keep: for it is a sign between me and you throughout your generations; that ye may know that I am the LORD that doth sanctify you.  ",
        },
        {
          reference: "Leviticus 11:44",
          verse: "For I...",
        },
      ],
      SACRIFICE: [
        {
          reference: "Leviticus 2:13",
          verse:
            "And every oblation of thy meat offering shalt thou season with salt; neither shalt thou suffer the salt of the covenant of thy God to be meat offering; with all thine offerings thou shalt offer salt.  ",
        },
        {
          reference: "Romans 12:1",
          verse:
            "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service. ",
        },
        {
          reference: "1 Corinthians 8:4",
          verse:
            "As concerning therefore the eating of those things that are offered in sacrifice unto idols, we know that an idol is nothing in the world, and that there is none other God but one. ",
        },
        {
          reference: "1 Corinthians 10:20",
          verse:
            "But I say, that the things which the Gentiles sacrifice, they sacrifice to devils, and not to God: and I would not that ye should have fellowship with devils. ",
        },
      ],
      WAR: [
        {
          reference: "Deuteronomy 20:1",
          verse:
            "When thou goest out to battle against thine enemies, and seest horses, and chariots, and a people more than thou, be not afraid of them: for the LORD thy God is with thee, which brought thee up out of the land of Egypt. ",
        },
        {
          reference: "Joshua 23:10",
          verse:
            "One man of you shall chase a thousand: for the LORD your God, he it is that fighteth for you, as he hath promised you. ",
        },
        {
          reference: "2 Chronicles 20:17",
          verse:
            "Ye shall not need to fight in this battle: set yourselves, stand ye still, and see the salvation of the LORD with you, O Judah and Jerusalem; fear not, nor be dismayed; to morrow go out against them: for the LORD will be with you. ",
        },
        {
          reference: "Ephesians 6:12",
          verse:
            "For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places.",
        },
      ],
      "REDEEM/REDEEMED/REDEEMER": [
        {
          reference: "Psalm 19:14",
          verse:
            "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
        },
        {
          reference: "Isaiah 48:17",
          verse:
            "Thus saith the LORD, thy Redeemer, the Holy One of Israel; I am the LORD thy God which teacheth thee to profit, which leadeth thee by the way thou shouldest go.",
        },
        {
          reference: "Galatians 3:13",
          verse:
            "Christ hath redeemed us from the curse of the law, being made a curse for us: for it is written, Cursed is every one that hangeth on a tree:",
        },
        {
          reference: "Titus 2:14",
          verse:
            "Who gave himself for us, that he might redeem us from all iniquity, and purify unto himself a peculiar people, zealous of good works.",
        },
      ],
      "CLEAN, CLEANSE, CLEANSING": [
        {
          reference: "2 Chronicles 29:15",
          verse:
            "And they gathered their brethren, and sanctified themselves, and came, according to the commandment of the king, by the words of the LORD, to cleanse the house of the LORD. ",
        },
        {
          reference: "Psalm 19:12",
          verse:
            "Who can understand his errors? cleanse thou me from secret faults.",
        },
        {
          reference: "Psalm 51:2",
          verse:
            "Wash me throughly from mine iniquity, and cleanse me from my sin.",
        },
        {
          reference: "Psalm 119:9",
          verse:
            "BETH. Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.",
        },
      ],
    },
    "superTeen16-19": {
      "SANCTIFY/SANCTIFIED/SANCTIFICATION": [
        {
          reference: "1 Thessalonians 4:3",
          verse:
            "For this is the will of God, even your sanctification, that ye should abstain from fornication:",
        },
        {
          reference: "1 Thessalonians 4:4",
          verse:
            "That every one of you should know how to possess his vessel in sanctification and honour;",
        },
        {
          reference: "2 Thessalonians 2:13",
          verse:
            "But we are bound to give thanks alway to God for you, brethren beloved of the Lord, because God hath from the beginning chosen you to salvation through sanctification of the Spirit and belief of the truth:",
        },
        {
          reference: "1 Peter 1:2",
          verse:
            "Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ: Grace unto you, and peace, be multiplied.",
        },
        {
          reference: "Exodus 13:2",
          verse:
            "Sanctify unto me all the firstborn, whatsoever openeth the womb among the children of Israel, both of man and of beast: it is mine.",
        },
        {
          reference: "Exodus 19:22",
          verse:
            "And let the priests also, which come near to the LORD, sanctify themselves, lest the LORD break forth upon them.",
        },
        {
          reference: "Exodus 30:29",
          verse:
            "And thou shalt sanctify them, that they may be most holy: whatsoever toucheth them shall be holy.",
        },
        {
          reference: "Exodus 31:13",
          verse:
            "Speak thou also unto the children of Israel, saying, Verily my sabbaths ye shall keep: for it is a sign between me and you throughout your generations; that ye may know that I am the LORD that doth sanctify you.",
        },
        {
          reference: "Leviticus 11:44",
          verse:
            "For I am the LORD your God: ye shall therefore sanctify yourselves, and ye shall be holy; for I am holy: neither shall ye defile yourselves with any manner of creeping thing that creepeth upon the earth.",
        },
        {
          reference: "Leviticus 20:7",
          verse:
            "Sanctify yourselves therefore, and be ye holy: for I am the LORD your God.",
        },
        {
          reference: "Leviticus 20:8",
          verse:
            "And ye shall keep my statutes, and do them: I am the LORD which sanctify you.",
        },
        {
          reference: "Deuteronomy 5:12",
          verse:
            "Keep the sabbath day to sanctify it, as the LORD thy God hath commanded thee.",
        },
        {
          reference: "Joshua 3:5",
          verse:
            "And Joshua said unto the people, Sanctify yourselves: for to morrow the LORD will do wonders among you.",
        },
        {
          reference: "2 Chronicles 29:5",
          verse:
            "And said unto them, Hear me, ye Levites, sanctify now yourselves, and sanctify the house of the LORD God of your fathers, and carry forth the filthiness out of the holy place.",
        },
        {
          reference: "Isaiah 8:13",
          verse:
            "Sanctify the LORD of hosts himself; and let him be your fear, and let him be your dread.",
        },
        {
          reference: "Isaiah 29:23",
          verse:
            "But when he seeth his children, the work of mine hands, in the midst of him, they shall sanctify my name, and sanctify the Holy One of Jacob, and shall fear the God of Israel.",
        },
        {
          reference: "Ezekiel 20:12",
          verse:
            "Moreover also I gave them my sabbaths, to be a sign between me and them, that they might know that I am the LORD that sanctify them.",
        },
        {
          reference: "Ezekiel 36:23",
          verse:
            "And I will sanctify my great name, which was profaned among the heathen, which ye have profaned in the midst of them; and the heathen shall know that I am the LORD, saith the Lord GOD, when I shall be sanctified in you before their eyes.",
        },
        {
          reference: "Ezekiel 37:28",
          verse:
            "And the heathen shall know that I the LORD do sanctify Israel, when my sanctuary shall be in the midst of them for evermore.",
        },
        {
          reference: "Ezekiel 38:23",
          verse:
            "Thus will I magnify myself, and sanctify myself; and I will be known in the eyes of many nations, and they shall know that I am the LORD.",
        },
        {
          reference: "Joel 1:14",
          verse:
            "Sanctify ye a fast, call a solemn assembly, gather the elders and all the inhabitants of the land into the house of the LORD your God, and cry unto the LORD,",
        },
        {
          reference: "John 17:17",
          verse: "Sanctify them through thy truth: thy word is truth.",
        },
        {
          reference: "John 17:19",
          verse:
            "And for their sakes I sanctify myself, that they also might be sanctified through the truth.",
        },
        {
          reference: "Ephesians 5:26",
          verse:
            "That he might sanctify and cleanse it with the washing of water by the word,",
        },
        {
          reference: "1 Thessalonians 5:23",
          verse:
            "And the very God of peace sanctify you wholly; and I pray God your whole spirit and soul and body be preserved blameless unto the coming of our Lord Jesus Christ.",
        },
        {
          reference: "Hebrews 13:12",
          verse:
            "Wherefore Jesus also, that he might sanctify the people with his own blood, suffered without the gate.",
        },
        {
          reference: "1 Peter 3:15",
          verse:
            "But sanctify the Lord God in your hearts: and be ready always to give an answer to every man that asketh you a reason of the hope that is in you with meekness and fear:",
        },
        {
          reference: "2 Chronicles 29:15",
          verse:
            "And they gathered their brethren, and sanctified themselves, and came, according to the commandment of the king, by the words of the LORD, to cleanse the house of the LORD.",
        },
        {
          reference: "2 Chronicles 30:8",
          verse:
            "Now be ye not stiffnecked, as your fathers were, but yield yourselves unto the LORD, and enter into his sanctuary, which he hath sanctified for ever: and serve the LORD your God, that the fierceness of his wrath may turn away from you.",
        },
        {
          reference: "Isaiah 5:16",
          verse:
            "But the LORD of hosts shall be exalted in judgment, and God that is holy shall be sanctified in righteousness.",
        },
        {
          reference: "Jeremiah 1:5",
          verse:
            "Before I formed thee in the belly I knew thee; and before thou camest forth out of the womb I sanctified thee, and I ordained thee a prophet unto the nations.",
        },
        {
          reference: "Ezekiel 20:41",
          verse:
            "I will accept you with your sweet savour, when I bring you out from the people, and gather you out of the countries wherein ye have been scattered; and I will be sanctified in you before the heathen.",
        },
        {
          reference: "Ezekiel 36:23",
          verse:
            "And I will sanctify my great name, which was profaned among the heathen, which ye have profaned in the midst of them; and the heathen shall know that I am the LORD, saith the Lord GOD, when I shall be sanctified in you before their eyes.",
        },
        {
          reference: "1 Corinthians 1:30",
          verse:
            "But of him are ye in Christ Jesus, who of God is made unto us wisdom, and righteousness, and sanctification, and redemption.",
        },
        {
          reference: "Acts 20:32",
          verse:
            "And now, brethren, I commend you to God, and to the word of his grace, which is able to build you up, and to give you an inheritance among all them which are sanctified.",
        },
        {
          reference: "Acts 26:18",
          verse:
            "To open their eyes, and to turn them from darkness to light, and from the power of Satan unto God, that they may receive forgiveness of sins, and inheritance among them which are sanctified by faith that is in me.",
        },
        {
          reference: "1 Corinthians 6:11",
          verse:
            "And such were some of you: but ye are washed, but ye are sanctified, but ye are justified in the name of the Lord Jesus, and by the Spirit of our God.",
        },
        {
          reference: "1 Corinthians 7:14",
          verse:
            "For the unbelieving husband is sanctified by the wife, and the unbelieving wife is sanctified by the husband: else were your children unclean; but now are they holy.",
        },
        {
          reference: "2 Timothy 2:21",
          verse:
            "If a man therefore purge himself from these, he shall be a vessel unto honour, sanctified, and meet for the master's use, and prepared unto every good work.",
        },
        {
          reference: "Hebrews 2:11",
          verse:
            "For both he that sanctifieth and they who are sanctified are all of one: for which cause he is not ashamed to call them brethren,",
        },
      ],
      "CLEAN, CLEANSE, CLEANSING": [
        {
          reference: "2 Chronicles 29:15",
          verse:
            "And they gathered their brethren, and sanctified themselves, and came, according to the commandment of the king, by the words of the LORD, to cleanse the house of the LORD.",
        },
        {
          reference: "Psalm 19:12",
          verse:
            "Who can understand his errors? cleanse thou me from secret faults.",
        },
        {
          reference: "Psalm 51:2",
          verse:
            "Wash me throughly from mine iniquity, and cleanse me from my sin.",
        },
        {
          reference: "Psalm 119:9",
          verse:
            "BETH. Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.",
        },
        {
          reference: "Isaiah 1:16",
          verse:
            "Wash you, make you clean; put away the evil of your doings from before mine eyes; cease to do evil;",
        },
        {
          reference: "Jeremiah 33:8",
          verse:
            "And I will cleanse them from all their iniquity, whereby they have sinned against me; and I will pardon all their iniquities, whereby they have sinned, and whereby they have transgressed against me.",
        },
        {
          reference: "Matthew 10:8",
          verse:
            "Heal the sick, cleanse the lepers, raise the dead, cast out devils: freely ye have received, freely give.",
        },
        {
          reference: "Matthew 23:26",
          verse:
            "Thou blind Pharisee, cleanse first that which is within the cup and platter, that the outside of them may be clean also.",
        },

        {
          reference: "2 Corinthians 7:1",
          verse:
            "Having therefore these promises, dearly beloved, let us cleanse ourselves from all filthiness of the flesh and spirit, perfecting holiness in the fear of God.",
        },
        {
          reference: "Ephesians 5:26",
          verse:
            "That he might sanctify and cleanse it with the washing of water by the word,",
        },
        {
          reference: "James 4:8",
          verse:
            "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded.",
        },
        {
          reference: "1 John 1:9",
          verse:
            "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
        },
        {
          reference: "Numbers 35:33",
          verse:
            "So ye shall not pollute the land wherein ye are: for blood it defileth the land: and the land cannot be cleansed of the blood that is shed therein, but by the blood of him that shed it.",
        },
        {
          reference: "Joshua 22:17",
          verse:
            "Is the iniquity of Peor too little for us, from which we are not cleansed until this day, although there was a plague in the congregation of the LORD,",
        },
        {
          reference: "2 Chronicles 29:18",
          verse:
            "Then they went in to Hezekiah the king, and said, We have cleansed all the house of the LORD, and the altar of burnt offering, with all the vessels thereof, and the shewbread table, with all the vessels thereof.",
        },
        {
          reference: "2 Chronicles 30:18",
          verse:
            "For a multitude of the people, even many of Ephraim, and Manasseh, Issachar, and Zebulun, had not cleansed themselves, yet did they eat the Passover otherwise than it was written. But Hezekiah prayed for them, saying, The good LORD pardon everyone.",
        },
        {
          reference: "2 Chronicles 30:19",
          verse:
            "That prepareth his heart to seek God, the LORD God of his fathers, though he be not cleansed according to the purification of the sanctuary.",
        },
        {
          reference: "Nehemiah 13:9",
          verse:
            "Then I commanded, and they cleansed the chambers: and thither brought I again the vessels of the house of God, with the meat offering and the frankincense.",
        },
        {
          reference: "Job 15:14",
          verse:
            "What is man, that he should be clean? and he which is born of a woman, that he should be righteous?",
        },
        {
          reference: "Job 35:3",
          verse:
            "For thou saidst, What advantage will it be unto thee? and, What profit shall I have, if I be cleansed from my sin?",
        },
        {
          reference: "Psalm 73:13",
          verse:
            "Verily I have cleansed my heart in vain, and washed my hands in innocency.",
        },
        {
          reference: "Psalm 51:10",
          verse:
            "Create in me a clean heart, O God; and renew a right spirit within me.",
        },
        {
          reference: "Proverbs 16:2",
          verse:
            "All the ways of a man are clean in his own eyes; but the LORD weigheth the spirits.",
        },
        {
          reference: "Ecclesiastes 9:2",
          verse:
            "All things come alike to all: there is one event to the righteous, and to the wicked; to the good and to the clean, and to the unclean; to him that sacrificeth, and to him that sacrificeth not: as is the good, so is the sinner; and he that sweareth, as he that feareth an oath.",
        },
        {
          reference: "Jeremiah 13:27",
          verse:
            "I have seen thine adulteries, and thy neighings, the lewdness of thy whoredom, and thine abominations on the hills in the fields. Woe unto thee, O Jerusalem! wilt thou not be made clean? when shall it once be?",
        },
        {
          reference: "Ezekiel 22:24",
          verse:
            "Son of man, say unto her, Thou art the land that is not cleansed, nor rained upon in the day of indignation.",
        },
        {
          reference: "Ezekiel 36:33",
          verse:
            "Thus saith the Lord GOD; In the day that I shall have cleansed you from all your iniquities I will also cause you to dwell in the cities, and the wastes shall be builded.",
        },
        {
          reference: "Daniel 8:13",
          verse:
            "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        },
        {
          reference: "Joel 3:21",
          verse:
            "For I will cleanse their blood that I have not cleansed: for the LORD dwelleth in Zion.",
        },
        {
          reference: "Matthew 8:3",
          verse:
            "And Jesus put forth his hand, and touched him, saying, I will; be thou clean. And immediately his leprosy was cleansed.",
        },
        {
          reference: "Matthew 11:5",
          verse:
            "The blind receive their sight, and the lame walk, the lepers are cleansed, and the deaf hear, the dead are raised up, and the poor have the gospel preached to them.",
        },
        {
          reference: "Mark 1:40",
          verse:
            "And there came a leper to him, beseeching him, and kneeling down to him, and saying unto him, If thou wilt, thou canst make me clean.",
        },
        {
          reference: "Mark 1:41",
          verse:
            "And Jesus, moved with compassion, put forth his hand, and touched him, and saith unto him, I will; be thou clean.",
        },
        {
          reference: "Mark 1:42",
          verse:
            "And as soon as he had spoken, immediately the leprosy departed from him, and he was cleansed.",
        },
        {
          reference: "Luke 4:27",
          verse:
            "And many lepers were in Israel in the time of Eliseus the prophet; and none of them was cleansed, saving Naaman the Syrian.",
        },
        {
          reference: "Luke 7:22",
          verse:
            "Then Jesus answering said unto them, Go your way, and tell John what things ye have seen and heard; how that the blind see, the lame walk, the lepers are cleansed, the deaf hear, the dead are raised, to the poor the gospel is preached.",
        },
        {
          reference: "Luke 11:39",
          verse:
            "And the Lord said unto him, Now do ye Pharisees make clean the outside of the cup and the platter; but your inward part is full of ravening and wickedness.",
        },
        {
          reference: "Luke 17:14",
          verse:
            "And when he saw them, he said unto them, Go shew yourselves unto the priests. And it came to pass, that, as they went, they were cleansed.",
        },
        {
          reference: "Luke 17:17",
          verse:
            "And Jesus answering said, Were there not ten cleansed? but where are the nine?",
        },
        {
          reference: "John 15:3",
          verse:
            "Now ye are clean through the word which I have spoken unto you.",
        },
      ],
      "REDEEM/REDEEMED/REDEEMER": [
        {
          reference: "Job 5:20",
          verse:
            "In famine he shall redeem thee from death: and in war from the power of the sword.",
        },
        {
          reference: "Psalm 25:22",
          verse: "Redeem Israel, O God, out of all his troubles.",
        },
        {
          reference: "Psalm 26:11",
          verse:
            "But as for me, I will walk in mine integrity: redeem me, and be merciful unto me.",
        },
        {
          reference: "Psalm 44:26",
          verse: "Arise for our help, and redeem us for thy mercies' sake.",
        },
        {
          reference: "Psalm 49:15",
          verse:
            "But God will redeem my soul from the power of the grave: for he shall receive me. Selah.",
        },
        {
          reference: "Psalm 72:14",
          verse:
            "He shall redeem their soul from deceit and violence: and precious shall their blood be in his sight.",
        },
        {
          reference: "Jeremiah 15:21",
          verse:
            "And I will deliver thee out of the hand of the wicked, and I will redeem thee out of the hand of the terrible.",
        },
        {
          reference: "Hosea 13:14",
          verse:
            "I will ransom them from the power of the grave; I will redeem them from death: O death, I will be thy plagues; O grave, I will be thy destruction: repentance shall be hid from mine eyes.",
        },
        {
          reference: "Titus 2:14",
          verse:
            "Who gave himself for us, that he might redeem us from all iniquity, and purify unto himself a peculiar people, zealous of good works.",
        },
        {
          reference: "Exodus 15:13",
          verse:
            "Thou in thy mercy hast led forth the people which thou hast redeemed: thou hast guided them in thy strength unto thy holy habitation.",
        },
        {
          reference: "Deuteronomy 7:8",
          verse:
            "But because the LORD loved you, and because he would keep the oath which he had sworn unto your fathers, hath the LORD brought you out with a mighty hand, and redeemed you out of the house of bondmen, from the hand of Pharaoh king of Egypt.",
        },
        {
          reference: "Deuteronomy 9:26",
          verse:
            "I prayed therefore unto the LORD, and said, O Lord GOD, destroy not thy people and thine inheritance, which thou hast redeemed through thy greatness, which thou hast brought forth out of Egypt with a mighty hand.",
        },
        {
          reference: "Deuteronomy 21:8",
          verse:
            "Be merciful, O LORD, unto thy people Israel, whom thou hast redeemed, and lay not innocent blood unto thy people of Israel's charge. And the blood shall be forgiven them.",
        },
        {
          reference: "Psalm 31:5",
          verse:
            "Into thine hand I commit my spirit: thou hast redeemed me, O LORD God of truth.",
        },
        {
          reference: "Psalm 71:23",
          verse:
            "My lips shall greatly rejoice when I sing unto thee; and my soul, which thou hast redeemed.",
        },
        {
          reference: "Psalm 106:10",
          verse:
            "And he saved them from the hand of him that hated them, and redeemed them from the hand of the enemy.",
        },
        {
          reference: "Psalm 107:2",
          verse:
            "Let the redeemed of the LORD say so, whom he hath redeemed from the hand of the enemy;",
        },
        {
          reference: "Psalm 136:24",
          verse:
            "And hath redeemed us from our enemies: for his mercy endureth for ever.",
        },
        {
          reference: "Isaiah 43:1",
          verse:
            "But now thus saith the LORD that created thee, O Jacob, and he that formed thee, O Israel, Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.",
        },
        {
          reference: "Isaiah 44:22",
          verse:
            "I have blotted out, as a thick cloud, thy transgressions, and, as a cloud, thy sins: return unto me; for I have redeemed thee.",
        },
        {
          reference: "Isaiah 51:11",
          verse:
            "Therefore the redeemed of the LORD shall return, and come with singing unto Zion; and everlasting joy shall be upon their head: they shall obtain gladness and joy; and sorrow and mourning shall flee away.",
        },
        {
          reference: "Isaiah 52:3",
          verse:
            "For thus saith the LORD, Ye have sold yourselves for nought; and ye shall be redeemed without money.",
        },
        {
          reference: "Isaiah 52:9",
          verse:
            "Break forth into joy, sing together, ye waste places of Jerusalem: for the LORD hath comforted his people, he hath redeemed Jerusalem.",
        },
        {
          reference: "Isaiah 62:12",
          verse:
            "And they shall call them, The holy people, The redeemed of the LORD: and thou shalt be called, Sought out, A city not forsaken.",
        },
        {
          reference: "Isaiah 63:9",
          verse:
            "In all their affliction he was afflicted, and the angel of his presence saved them: in his love and in his pity he redeemed them; and he bare them, and carried them all the days of old.",
        },
        {
          reference: "Jeremiah 31:11",
          verse:
            "For the LORD hath redeemed Jacob, and ransomed him from the hand of him that was stronger than he.",
        },
        {
          reference: "Lamentations 3:58",
          verse:
            "O Lord, thou hast pleaded the causes of my soul; thou hast redeemed my life.",
        },
        {
          reference: "Luke 1:68",
          verse:
            "Blessed be the Lord God of Israel; for he hath visited and redeemed his people,",
        },
        {
          reference: "Galatians 3:13",
          verse:
            "Christ hath redeemed us from the curse of the law, being made a curse for us: for it is written, Cursed is every one that hangeth on a tree:",
        },
        {
          reference: "Revelation 14:4",
          verse:
            "These are they which were not defiled with women; for they are virgins. These are they which follow the Lamb whithersoever he goeth. These were redeemed from among men, being the first fruits unto God and to the Lamb.",
        },
        {
          reference: "Job 19:25",
          verse:
            "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth:",
        },
        {
          reference: "Psalm 19:14",
          verse:
            "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.",
        },
        {
          reference: "Psalm 78:35",
          verse:
            "And they remembered that God was their rock, and the high God their redeemer.",
        },
        {
          reference: "Proverbs 23:11",
          verse:
            "For their redeemer is mighty; he shall plead their cause with thee.",
        },
        {
          reference: "Isaiah 44:6",
          verse:
            "Thus saith the LORD the King of Israel, and his redeemer the LORD of hosts; I am the first, and I am the last; and beside me there is no God.",
        },
        {
          reference: "Isaiah 44:24",
          verse:
            "Thus saith the LORD, thy redeemer, and he that formed thee from the womb, I am the LORD that maketh all things; that stretcheth forth the heavens alone; that spreadeth abroad the earth by myself;",
        },
        {
          reference: "Isaiah 47:4",
          verse:
            "As for our redeemer, the LORD of hosts is his name, the Holy One of Israel.",
        },
        {
          reference: "Isaiah 49:26",
          verse:
            "And I will feed them that oppress thee with their own flesh; and they shall be drunken with their own blood, as with sweet wine: and all flesh shall know that I the LORD am thy Saviour and thy Redeemer, the mighty One of Jacob.",
        },
        {
          reference: "Isaiah 54:8",
          verse:
            "In a little wrath I hid my face from thee for a moment; but with everlasting kindness will I have mercy on thee, saith the LORD thy Redeemer.",
        },
        {
          reference: "Jeremiah 50:34",
          verse:
            "Their Redeemer is strong; the LORD of hosts is his name: he shall throughly plead their cause, that he may give rest to the land, and disquiet the inhabitants of Babylon.",
        },
      ],
      WAR: [
        {
          reference: "Exodus 15:3",
          verse: "The LORD is a man of war: the LORD is his name.",
        },
        {
          reference: "Numbers 10:9",
          verse:
            "And if ye go to war in your land against the enemy that oppresseth you, then ye shall blow an alarm with the trumpets; and ye shall be remembered before the LORD your God, and ye shall be saved from your enemies.",
        },
        {
          reference: "Joshua 8:1",
          verse:
            "And the LORD said unto Joshua, Fear not, neither be thou dismayed: take all the people of war with thee, and arise, go up to Ai: see, I have given into thy hand the king of Ai, and his people, and his city, and his land:",
        },
        {
          reference: "Joshua 14:11",
          verse:
            "As yet I am as strong this day as I was in the day that Moses sent me: as my strength was then, even so is my strength now, for war, both to go out, and to come in.",
        },
        {
          reference: "2 Samuel 1:27",
          verse: "How are the mighty fallen, and the weapons of war perished!",
        },
        {
          reference: "2 Samuel 3:1",
          verse:
            "Now there was long war between the house of Saul and the house of David: but David waxed stronger and stronger, and the house of Saul waxed weaker and weaker.",
        },
        {
          reference: "1 Chronicles 28:3",
          verse:
            "But God said unto me, Thou shalt not build an house for my name, because thou hast been a man of war, and hast shed blood.",
        },
        {
          reference: "2 Chronicles 14:6",
          verse:
            "And he built fenced cities in Judah: for the land had rest, and he had no war in those years; because the LORD had given him rest.",
        },
        {
          reference: "2 Chronicles 17:10",
          verse:
            "And the fear of the LORD fell upon all the kingdoms of the lands that were round about Judah, so that they made no war against Jehoshaphat.",
        },
        {
          reference: "Job 5:20",
          verse:
            "In famine he shall redeem thee from death: and in war from the power of the sword.",
        },
        {
          reference: "Psalm 27:3",
          verse:
            "Though an host should encamp against me, my heart shall not fear: though war should rise against me, in this will I be confident.",
        },
        {
          reference: "Psalm 55:21",
          verse:
            "The words of his mouth were smoother than butter, but war was in his heart: his words were softer than oil, yet were they drawn swords.",
        },
        {
          reference: "Psalm 120:7",
          verse: "I am for peace: but when I speak, they are for war.",
        },
        {
          reference: "Psalm 144:1",
          verse:
            "Blessed be the LORD my strength, which teacheth my hands to war, and my fingers to fight:",
        },
        {
          reference: "Proverbs 20:18",
          verse:
            "Every purpose is established by counsel: and with good advice make war.",
        },
        {
          reference: "Proverbs 24:6",
          verse:
            "For by wise counsel thou shalt make thy war: and in multitude of counsellors there is safety.",
        },
        {
          reference: "Ecclesiastes 3:8",
          verse:
            "A time to love, and a time to hate; a time of war, and a time of peace.",
        },
        {
          reference: "Ecclesiastes 9:18",
          verse:
            "Wisdom is better than weapons of war: but one sinner destroyeth much good.",
        },
        {
          reference: "Isaiah 41:12",
          verse:
            "Thou shalt seek them, and shalt not find them, even them that contended with thee: they that war against thee shall be as nothing, and as a thing of nought.",
        },
        {
          reference: "Isaiah 42:13",
          verse:
            "The LORD shall go forth as a mighty man, he shall stir up jealousy like a man of war: he shall cry, yea, roar; he shall prevail against his enemies.",
        },
        {
          reference: "Jeremiah 49:2",
          verse:
            "Therefore, behold, the days come, saith the LORD, that I will cause an alarm of war to be heard in Rabbah of the Ammonites; and it shall be a desolate heap, and her daughters shall be burned with fire: then shall Israel be heir unto them that were his heirs, saith the LORD.",
        },
        {
          reference: "Jeremiah 51:20",
          verse:
            "Thou art my battle axe and weapons of war: for with thee will I break in pieces the nations, and with thee will I destroy kingdoms.",
        },
        {
          reference: "Ezekiel 39:20",
          verse:
            "Thus ye shall be filled at my table with horses and chariots, with mighty men, and with all men of war, saith the Lord GOD.",
        },
        {
          reference: "Joel 3:9",
          verse:
            "Proclaim ye this among the Gentiles; Prepare war, wake up the mighty men, let all the men of war draw near; let them come up:",
        },
        {
          reference: "Micah 2:8",
          verse:
            "Even of late my people is risen up as an enemy: ye pull off the robe with the garment from them that pass by securely as men averse from war.",
        },
        {
          reference: "Luke 14:31",
          verse:
            "Or what king, going to make war against another king, sitteth not down first, and consulteth whether he be able with ten thousand to meet him that cometh against him with twenty thousand?",
        },
        {
          reference: "Luke 23:11",
          verse:
            "And Herod with his men of war set him at nought, and mocked him, and arrayed him in a gorgeous robe, and sent him again to Pilate.",
        },
        {
          reference: "2 Corinthians 10:3",
          verse:
            "For though we walk in the flesh, we do not war after the flesh:",
        },
        {
          reference: "1 Timothy 1:18",
          verse:
            "This charge I commit unto thee, son Timothy, according to the prophecies which went before on thee, that thou by them mightest war a good warfare;",
        },
        {
          reference: "James 4:1",
          verse:
            "From whence come wars and fightings among you? come they not hence, even of your lusts that war in your members?",
        },
        {
          reference: "James 4:2",
          verse:
            "Ye lust, and have not: ye kill, and desire to have, and cannot obtain: ye fight and war, yet ye have not, because ye ask not.",
        },
        {
          reference: "1 Peter 2:11",
          verse:
            "Dearly beloved, I beseech you as strangers and pilgrims, abstain from fleshly lusts, which war against the soul;",
        },
        {
          reference: "Revelation 11:7",
          verse:
            "And when they shall have finished their testimony, the beast that ascendeth out of the bottomless pit shall make war against them, and shall overcome them, and kill them.",
        },
        {
          reference: "Revelation 12:7",
          verse:
            "And there was war in heaven: Michael and his angels fought against the dragon; and the dragon fought and his angels,",
        },
        {
          reference: "Revelation 12:17",
          verse:
            "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ.",
        },
        {
          reference: "Revelation 13:4",
          verse:
            "And they worshipped the dragon which gave power unto the beast: and they worshipped the beast, saying, Who is like unto the beast? who is able to make war with him?",
        },
        {
          reference: "Revelation 13:7",
          verse:
            "And it was given unto him to make war with the saints, and to overcome them: and power was given him over all kindreds, and tongues, and nations.",
        },
        {
          reference: "Revelation 17:14",
          verse:
            "These shall make war with the Lamb, and the Lamb shall overcome them: for he is Lord of lords, and King of kings: and they that are with him are called, and chosen, and faithful.",
        },
        {
          reference: "Revelation 19:11",
          verse:
            "And I saw heaven opened, and behold a white horse; and he that sat upon him was called Faithful and True, and in righteousness he doth judge and make war.",
        },
        {
          reference: "Revelation 19:19",
          verse:
            "And I saw the beast, and the kings of the earth, and their armies, gathered together to make war against him that sat on the horse, and against his army.",
        },
      ],
      SACRIFICE: [
        {
          reference: "Exodus 8:28",
          verse:
            "And Pharaoh said, I will let you go, that ye may sacrifice to the LORD your God in the wilderness; only ye shall not go very far away: intreat for me.",
        },
        {
          reference: "1 Samuel 15:22",
          verse:
            "And Samuel said, Hath the LORD as great delight in burnt offerings and sacrifices, as in obeying the voice of the LORD? Behold, to obey is better than sacrifice, and to hearken than the fat of rams.",
        },
        {
          reference: "1 Samuel 16:5",
          verse:
            "And he said, Peaceably: I am come to sacrifice unto the LORD: sanctify yourselves, and come with me to the sacrifice. And he sanctified Jesse and his sons, and called them to the sacrifice.",
        },
        {
          reference: "1 Kings 3:4",
          verse:
            "And the king went to Gibeon to sacrifice there; for that was the great high place: a thousand burnt offerings did Solomon offer upon that altar.",
        },
        {
          reference: "1 Kings 8:62",
          verse:
            "And the king, and all Israel with him, offered sacrifice before the LORD.",
        },
        {
          reference: "1 Kings 18:36",
          verse:
            "And it came to pass at the time of the offering of the evening sacrifice, that Elijah the prophet came near, and said, LORD God of Abraham, Isaac, and of Israel, let it be known this day that thou art God in Israel, and that I am thy servant, and that I have done all these things at thy word.",
        },
        {
          reference: "1 Kings 18:38",
          verse:
            "Then the fire of the LORD fell, and consumed the burnt sacrifice, and the wood, and the stones, and the dust, and licked up the water that was in the trench.",
        },
        {
          reference: "2 Chronicles 2:6",
          verse:
            "But who is able to build him an house, seeing the heaven and heaven of heavens cannot contain him? who am I then, that I should build him an house, save only to burn sacrifice before him?",
        },
        {
          reference: "2 Chronicles 7:12",
          verse:
            "And the LORD appeared to Solomon by night, and said unto him, I have heard thy prayer, and have chosen this place to myself for an house of sacrifice.",
        },
        {
          reference: "Psalm 40:6",
          verse:
            "Sacrifice and offering thou didst not desire; mine ears hast thou opened: burnt offering and sin offering hast thou not required.",
        },
        {
          reference: "Psalm 50:5",
          verse:
            "Gather my saints together unto me; those that have made a covenant with me by sacrifice.",
        },
        {
          reference: "Psalm 54:6",
          verse:
            "I will freely sacrifice unto thee: I will praise thy name, O LORD; for it is good.",
        },
        {
          reference: "Psalm 107:22",
          verse:
            "And let them sacrifice the sacrifices of thanksgiving, and declare his works with rejoicing.",
        },
        {
          reference: "Psalm 116:17",
          verse:
            "I will offer to thee the sacrifice of thanksgiving, and will call upon the name of the LORD.",
        },
        {
          reference: "Psalm 141:2",
          verse:
            "Let my prayer be set forth before thee as incense; and the lifting up of my hands as the evening sacrifice.",
        },
        {
          reference: "Proverbs 15:8",
          verse:
            "The sacrifice of the wicked is an abomination to the LORD: but the prayer of the upright is his delight.",
        },
        {
          reference: "Proverbs 21:3",
          verse:
            "To do justice and judgment is more acceptable to the LORD than sacrifice.",
        },
        {
          reference: "Proverbs 21:27",
          verse:
            "The sacrifice of the wicked is abomination: how much more, when he bringeth it with a wicked mind?",
        },
        {
          reference: "Ezekiel 39:19",
          verse:
            "And ye shall eat fat till ye be full, and drink blood till ye be drunken, of my sacrifice which I have sacrificed for you.",
        },
        {
          reference: "Hosea 6:6",
          verse:
            "For I desired mercy, and not sacrifice; and the knowledge of God more than burnt offerings.",
        },
        {
          reference: "Jonah 1:16",
          verse:
            "Then the men feared the LORD exceedingly, and offered a sacrifice unto the LORD, and made vows.",
        },
        {
          reference: "Jonah 2:9",
          verse:
            "But I will sacrifice unto thee with the voice of thanksgiving; I will pay that that I have vowed. Salvation is of the LORD.",
        },
        {
          reference: "Zephaniah 1:7",
          verse:
            "Hold thy peace at the presence of the Lord GOD: for the day of the LORD is at hand: for the LORD hath prepared a sacrifice, he hath bid his guests.",
        },
        {
          reference: "Zephaniah 1:8",
          verse:
            "And it shall come to pass in the day of the LORD'S sacrifice, that I will punish the princes, and the king's children, and all such as are clothed with strange apparel.",
        },
        {
          reference: "Malachi 1:8",
          verse:
            "And if ye offer the blind for sacrifice, is it not evil? and if ye offer the lame and sick, is it not evil? offer it now unto thy governor; will he be pleased with thee, or accept thy person? saith the LORD of hosts.",
        },
        {
          reference: "Matthew 9:13",
          verse:
            "But go ye and learn what that meaneth, I will have mercy, and not sacrifice: for I am not come to call the righteous, but sinners to repentance.",
        },
        {
          reference: "Mark 9:49",
          verse:
            "For every one shall be salted with fire, and every sacrifice shall be salted with salt.",
        },
        {
          reference: "Romans 12:1",
          verse:
            "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.",
        },
        {
          reference: "1 Corinthians 8:4",
          verse:
            "As concerning therefore the eating of those things that are offered in sacrifice unto idols, we know that an idol is nothing in the world, and that there is none other God but one.",
        },
        {
          reference: "1 Corinthians 10:20",
          verse:
            "But I say, that the things which the Gentiles sacrifice, they sacrifice to devils, and not to God: and I would not that ye should have fellowship with devils.",
        },
        {
          reference: "1 Corinthians 10:28",
          verse:
            "But if any man say unto you, This is offered in sacrifice unto idols, eat not for his sake that shewed it, and for conscience sake: for the earth is the Lord's, and the fulness thereof:",
        },
        {
          reference: "Ephesians 5:2",
          verse:
            "And walk in love, as Christ also hath loved us, and hath given himself for us an offering and a sacrifice to God for a sweet smelling savour.",
        },
        {
          reference: "Philippians 2:17",
          verse:
            "Yea, and if I be offered upon the sacrifice and service of your faith, I joy, and rejoice with you all.",
        },
        {
          reference: "Philippians 4:18",
          verse:
            "But I have all, and abound: I am full, having received of Epaphroditus the things which were sent from you, an odour of a sweet smell, a sacrifice acceptable, well pleasing to God.",
        },
        {
          reference: "Hebrews 7:27",
          verse:
            "Who needeth not daily, as those high priests, to offer up sacrifice, first for his own sins, and then for the people's: for this he did once, when he offered up himself.",
        },
        {
          reference: "Hebrews 10:8",
          verse:
            "Above when he said, Sacrifice and offering and burnt offerings and offering for sin thou wouldest not, neither hadst pleasure therein; which are offered by the law;",
        },
        {
          reference: "Hebrews 10:12",
          verse:
            "But this man, after he had offered one sacrifice for sins for ever, sat down on the right hand of God;",
        },
        {
          reference: "Hebrews 10:26",
          verse:
            "For if we sin wilfully after that we have received the knowledge of the truth, there remaineth no more sacrifice for sins,",
        },
        {
          reference: "Hebrews 11:4",
          verse:
            "By faith Abel offered unto God a more excellent sacrifice than Cain, by which he obtained witness that he was righteous, God testifying of his gifts: and by it he being dead yet speaketh.",
        },
        {
          reference: "Hebrews 13:15",
          verse:
            "By him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of our lips giving thanks to his name.",
        },
      ],
    },
  };
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new RecitationGame();
});
