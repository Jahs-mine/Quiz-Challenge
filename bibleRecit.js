import Game from "./modules.js";

class RecitationGame {
  constructor() {
    this.selectedAge = null;
    this.selectedCategory = null;
    this.usedTiles = [];
    this.appContainer = document.getElementById('app-container');
    this.recitationData = null;
    
    this.loadData().then(() => {
      this.createLandingPage();
    });
  }

  async loadData() {
    const response = await fetch('recitationData.json');
    this.recitationData = await response.json();
  }

  createLandingPage() {
    this.appContainer.innerHTML = ''; // Clear previous content using the container

    // Create age group card
    const ageGroupCard = document.createElement("div");
    ageGroupCard.className = "card";
    ageGroupCard.id = "ageGroupCard";
    ageGroupCard.innerHTML = `
      <h2>Welcome to Bible Recitation Practice</h2>
      <p>Learn the verses gradually and practice more along the way.</p>
      <p>Select an age group:</p>
      <input type="radio" name="ageGroup" id="teen" value="teen" />
      <label for="teen">Teen: 13-15</label><br />
      <input type="radio" name="ageGroup" id="superTeen" value="superTeen" />
      <label for="superTeen">Super Teen: 16-19</label>
    `;

    this.appContainer.appendChild(ageGroupCard);
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
    document.getElementById("startButton")?.addEventListener("click", () => {
      this.startTileMatchingGame();
    });
  }

  showCategoryCard() {
    const ageGroupCard = document.getElementById("ageGroupCard");
    const categoryCard = document.createElement("div");
    categoryCard.className = "card";
    categoryCard.id = "categoryCard";
    categoryCard.innerHTML = `
      <button class="back-button">← Back</button>
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

    // Remove existing category card if it exists
    const existingCategoryCard = document.getElementById("categoryCard");
    if (existingCategoryCard) {
      existingCategoryCard.remove();
    }

    this.appContainer.appendChild(categoryCard);
    
    // Add back button event listener
    categoryCard.querySelector('.back-button').addEventListener('click', () => {
      categoryCard.remove();
      ageGroupCard.classList.remove('hidden');
    });

    // Hide age group card
    ageGroupCard.classList.add('hidden');
    
    // Setup event listeners for the new card
    this.setupEventListeners();
  }

  startTileMatchingGame() {
    this.appContainer.innerHTML = "";
    
    const gameContainer = document.createElement("div");
    gameContainer.id = "gameContainer";
    
    // Create back button container
    const backButtonContainer = document.createElement("div");
    backButtonContainer.className = "back-button-container";
    
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.textContent = "← Back to Categories";
    backButton.addEventListener('click', () => {
      this.createLandingPage();
      this.showCategoryCard();
    });
    
    backButtonContainer.appendChild(backButton);
    this.appContainer.appendChild(backButtonContainer);
    this.appContainer.appendChild(gameContainer);
    
    // Get the selected category data
    const categoryData = this.recitationData[this.selectedAge][this.selectedCategory];

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
    tile.dataset.id = id;
    tile.dataset.type = type;
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
      // Correct match
      tile1.classList.add("matched");
      tile2.classList.add("matched");

      // Add the reference to the usedTiles array
      const reference = tile1.textContent.trim();
      this.usedTiles.push(reference);

      // Remove matched tiles from the DOM after a delay
      setTimeout(() => {
        tile1.remove();
        tile2.remove();
      }, 500);

      // Check if all tiles have been matched
      const remainingTiles = document.querySelectorAll(".tile");
      if (remainingTiles.length === 0) {
        alert("Congratulations! You've matched all the pairs in this round.");
        this.startNextRound();
      }
    } else {
      // Incorrect match
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
    const categoryData = this.recitationData[this.selectedAge][this.selectedCategory];
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
    const tiles = Array.from(column.children);
    const shuffledTiles = this.shuffleArray(tiles);
    column.innerHTML = "";
    shuffledTiles.forEach((tile) => column.appendChild(tile));
  }

}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new RecitationGame();
});
