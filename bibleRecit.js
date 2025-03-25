import Game from "./modules.js";

class BibleRecitationApp {
  constructor() {
    this.appContainer = document.getElementById("app-container");
    this.recitationData = null;
    this.selectedCategory = null;
    this.currentMode = null;
    this.currentVerseIndex = 0;

    // Initialize without automatic greeting
    Game.init('bible-recitation', {
      botMessages: {
        accountPrompt: "Select your account or create a new one",
        noAccountsFound: "No accounts found. Would you like to create one?",
        accountCreated: "Account created successfully!",
        loginSuccess: "Welcome back!"
      }
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
    document.getElementById('reloadBtn').addEventListener('click', () => window.location.reload());
  }

  getAgeGroupLabel(ageGroup) {
    const labels = {
      'teen': 'Teen (13-15)',
      'superTeen': 'Super Teen (16-19)',
      'adult': 'Adult (20+)'
    };
    return labels[ageGroup] || '';
  }

  showAccountSelection() {
    const allUsers = JSON.parse(localStorage.getItem('bibleGameUsers')) || {};
    const accounts = Object.keys(allUsers).map(id => ({
      id,
      name: allUsers[id].name,
      ageGroup: allUsers[id].ageGroup
    }));

    let accountsHTML = '';
    let createAccountHTML = '';
    
    if (accounts.length > 0) {
      accountsHTML = accounts.map(account => `
        <div class="account-item" data-id="${account.id}">
          <span class="account-name">${account.name}</span>
          <span class="account-age">${this.getAgeGroupLabel(account.ageGroup)}</span>
        </div>
      `).join('');
    } else {
      accountsHTML = '<div class="no-accounts-message">No accounts found</div>';
      createAccountHTML = '<button id="createAccountBtn" class="create-account-btn">Create New Account</button>';
    }

    this.appContainer.innerHTML = `
      <div class="account-container">
        <h1>Bible Verse Practice</h1>
        ${accounts.length > 0 ? 
          `<div class="bot-message">Select your account:</div>` : 
          `<div class="bot-message" id="noAccountMessage"></div>`
        }
        <div class="accounts-list">
          ${accountsHTML}
        </div>
        ${createAccountHTML}
        ${accounts.length > 0 ? 
          '<button id="createAccountBtn" class="create-account-btn">Create New Account</button>' : 
          ''
        }
      </div>
    `;

    if (accounts.length === 0) {
      Game.bot.send('noAccountsFound').then(message => {
        document.getElementById('noAccountMessage').textContent = message;
      });
    }

    if (accounts.length > 0) {
      document.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', () => {
          const userId = item.dataset.id;
          if (Game.selectAccount(userId)) {
            this.showMainMenu();
          }
        });
      });
    }

    document.getElementById('createAccountBtn')?.addEventListener('click', () => {
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

    document.getElementById('submitAccount').addEventListener('click', () => {
      const name = document.getElementById('newUsername').value.trim();
      const ageGroup = document.getElementById('ageGroup').value;
      
      if (name) {
        Game.createAccount(name, ageGroup);
        this.showMainMenu();
      } else {
        alert("Please enter your name");
      }
    });

    document.getElementById('cancelCreateAccount').addEventListener('click', () => {
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

    Game.bot.send('loginSuccess').then(message => {
      document.getElementById('mainMenuMessage').textContent = message;
    });

    document.getElementById('learnBtn').addEventListener('click', () => {
      this.currentMode = 'learn';
      this.showCategorySelection();
    });

    document.getElementById('matchBtn').addEventListener('click', () => {
      this.currentMode = 'match';
      this.showCategorySelection();
    });
  }

  showCategorySelection() {
    const title = this.currentMode === 'learn' ? 'Learn Verses' : 'Match Verses';
    const prompt = this.currentMode === 'learn' ? 'learnPrompt' : 'matchPrompt';

    this.appContainer.innerHTML = `
      <div class="category-container">
        <button class="back-button">← Back to Main Menu</button>
        <h2>${title}</h2>
        <div class="bot-message" id="categoryMessage"></div>
        <p>Select a category:</p>
        <div class="button-grid">
          <button class="selection-btn category-btn" data-value="SANCTIFY/SANCTIFIED/SANCTIFICATION">
            Sanctify/Sanctified
          </button>
          <button class="selection-btn category-btn" data-value="CLEAN/CLEANSE/CLEANSING">
            Clean/Cleanse
          </button>
          <button class="selection-btn category-btn" data-value="REDEEM/REDEEMED/REDEEMER">
            Redeem/Redeemed
          </button>
          <button class="selection-btn category-btn" data-value="WAR">
            War
          </button>
          <button class="selection-btn category-btn" data-value="SACRIFICE">
            Sacrifice
          </button>
        </div>
      </div>
    `;

    Game.bot.send(prompt).then(message => {
      document.getElementById('categoryMessage').textContent = message;
    });

    document.querySelector('.back-button').addEventListener('click', () => {
      this.showMainMenu();
    });

    document.querySelectorAll('.category-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.selectedCategory = button.dataset.value;
        if (this.currentMode === 'learn') {
          this.startLearningSession();
        } else {
          this.startMatchingGame();
        }
      });
    });
  }

  startLearningSession() {
    const verses = this.recitationData[Game.user.ageGroup][this.selectedCategory];
    this.currentVerseIndex = 0;

    this.appContainer.innerHTML = `
      <div class="learning-container">
        <button class="back-button">← Back to Categories</button>
        <h2>Learning: ${this.selectedCategory}</h2>
        <div class="bot-message" id="verseMessage"></div>
        <div id="verse-container"></div>
        <div class="navigation-buttons">
          <button id="prevBtn" class="nav-btn">Previous</button>
          <button id="nextBtn" class="nav-btn">Next</button>
        </div>
      </div>
    `;

    Game.bot.send('versePrompt').then(message => {
      document.getElementById('verseMessage').textContent = message;
    });

    const verseContainer = document.getElementById('verse-container');
    const updateVerseDisplay = () => {
      const verse = verses[this.currentVerseIndex];
      verseContainer.innerHTML = `
        <div class="verse-card">
          <h3>${verse.reference}</h3>
          <p class="verse-text">${Game.formatVerse(verse.verse)}</p>
        </div>
      `;
      
      document.getElementById('prevBtn').disabled = this.currentVerseIndex === 0;
      document.getElementById('nextBtn').disabled = this.currentVerseIndex === verses.length - 1;
      
      // Speak the verse
      Game.speak(`${verse.reference}. ${verse.verse}`);
    };

    document.getElementById('prevBtn').addEventListener('click', () => {
      if (this.currentVerseIndex > 0) {
        this.currentVerseIndex--;
        updateVerseDisplay();
      }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      if (this.currentVerseIndex < verses.length - 1) {
        this.currentVerseIndex++;
        updateVerseDisplay();
      }
    });

    document.querySelector('.back-button').addEventListener('click', () => {
      this.showCategorySelection();
    });

    updateVerseDisplay();
  }

  startMatchingGame() {
    const categoryData = this.recitationData[Game.user.ageGroup][this.selectedCategory];
    const tileData = categoryData.map(item => [item.reference, item.verse]);

    this.appContainer.innerHTML = `
      <div class="game-container">
        <button class="back-button">← Back to Categories</button>
        <h2>Matching Game: ${this.selectedCategory}</h2>
        <div class="bot-message" id="gameMessage"></div>
        <div id="game-board"></div>
      </div>
    `;

    Game.bot.send('matchPrompt').then(message => {
      document.getElementById('gameMessage').textContent = message;
    });

    Game.createMatchingGame(tileData, 'game-board');

    document.querySelector('.back-button').addEventListener('click', () => {
      this.showCategorySelection();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BibleRecitationApp();
});