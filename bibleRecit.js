import GameBot from "./modules.js";

class BibleRecitationApp {
  constructor() {
    this.appContainer = document.getElementById("app-container");
    this.loginIcon = document.getElementById("login-icon");

    // Initially hide the login icon
    this.loginIcon.style.display = "none";

    // Add click handler for login icon
    this.loginIcon.addEventListener("click", () => this.showLoginPage());

    // Check for current user in localStorage
    const currentUser = GameBot.User.getCurrent();

    if (!currentUser) {
      // Show login page if no user is logged in
      this.showLoginPage();
    } else {
      // User is already logged in
      GameBot.showMessage(`Welcome back, ${currentUser.user_name}!`);
      this.initializeApp();
    }
  }

  showLoginPage() {
    GameBot.User.logIn((user) => {
      // This callback runs when user logs in successfully
      GameBot.showMessage(`Welcome, ${user.user_name}!`);
      // Initialize the rest of the app
      this.initializeApp();
    }, this.appContainer);
  }

  initializeApp() {
    // Make login icon visible
    this.loginIcon.style.display = "flex";

    // Initialize app properties
    this.recitationData = null;
    this.selectedCategory = null;
    this.currentMode = null;
    this.currentVerseIndex = 0;
    this.currentRound = 1;
    this.roundSize = 5;
    this.learnedVerses = [];

    // Initialize bot messages
    this.botMessages = {
      accountPrompt: "Select your account or create a new one",
      noAccountsFound: "No accounts found. Would you like to create one?",
      accountCreated: "Account created successfully!",
      loginSuccess: "Welcome back!",
      welcomeBack: "Welcome back! Ready to continue your Bible learning?",
      learningInstructions:
        "I'll read the verse first, then you try. Click 'Speak Verse' when you're ready.",
      correctResponse: "Perfect! You got it right!",
      tryAgain: "Almost there! Try speaking the verse again.",
      roundComplete: "Great job! You've completed this round!",
      categoryComplete:
        "Congratulations! You've completed all verses in this category!",
      matchingInstructions: "Match each reference to its verse",
    };

    // Load data and show main menu
    this.loadData().then(() => {
      this.showMainMenu();
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


  showMainMenu() {
    // Clear the app container
    this.appContainer.innerHTML = '';
  
    // Create main menu container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'main-menu';
  
    // Create title
    const title = document.createElement('h1');
    title.textContent = 'Bible Recitation App';
    menuContainer.appendChild(title);
  
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'menu-buttons';
  
    // Create Learn button
    const learnBtn = document.createElement('button');
    learnBtn.className = 'menu-btn learn-btn';
    learnBtn.textContent = 'Learn';
    learnBtn.addEventListener('click', () => {
      this.showCategorySelection('learn');
    });
    buttonsContainer.appendChild(learnBtn);
  
    // Create Quiz button
    const quizBtn = document.createElement('button');
    quizBtn.className = 'menu-btn quiz-btn';
    quizBtn.textContent = 'Quiz';
    quizBtn.addEventListener('click', () => {
      this.showCategorySelection('quiz');
    });
    buttonsContainer.appendChild(quizBtn);
  
    // Create Matching Game button
    const matchingGameBtn = document.createElement('button');
    matchingGameBtn.className = 'menu-btn matching-game-btn';
    matchingGameBtn.textContent = 'Matching Game';
    matchingGameBtn.addEventListener('click', () => {
      this.startMatchingGame();
    });
    buttonsContainer.appendChild(matchingGameBtn);
  
    // Add buttons container to menu
    menuContainer.appendChild(buttonsContainer);
  
    // Add menu to app container
    this.appContainer.appendChild(menuContainer);
  
    // Show welcome message
    GameBot.showMessage('Select a learning mode to begin!');
  }
  
  showCategorySelection(mode) {
    // Store the current mode
    this.currentMode = mode;
  
    // Clear the app container
    this.appContainer.innerHTML = '';
  
    // Create container for category selection
    const container = document.createElement('div');
    container.className = 'category-selection';
  
    // Create title
    const title = document.createElement('h2');
    title.textContent = `Select a Category for ${mode === 'learn' ? 'Learning' : 'Quiz'}`;
    container.appendChild(title);
  
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'category-buttons';
  
    // Create buttons for each category
    if (this.recitationData && this.recitationData.categories) {
      this.recitationData.categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category.name;
        btn.addEventListener('click', () => {
          this.selectedCategory = category;
          if (mode === 'learn') {
            this.startLearningSession();
          } else {
            this.startQuizSession();
          }
        });
        buttonsContainer.appendChild(btn);
      });
    }
  
    // Add back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = 'Back to Main Menu';
    backBtn.addEventListener('click', () => {
      this.showMainMenu();
    });
  
    // Add elements to container
    container.appendChild(buttonsContainer);
    container.appendChild(backBtn);
  
    // Add to app container
    this.appContainer.appendChild(container);
  }
  
  startMatchingGame() {
    // Clear the app container
    this.appContainer.innerHTML = '';
  
    // Create back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = 'Back to Main Menu';
    backBtn.addEventListener('click', () => {
      this.showMainMenu();
    });
    this.appContainer.appendChild(backBtn);
  
    // Prepare matching game data (example - you'll need to adapt this)
    const matchingData = [
      ['John 3:16', 'For God so loved the world...'],
      ['Psalm 23:1', 'The Lord is my shepherd...'],
      // Add more verse-reference pairs from your data
    ];
  
    // Create and render the matching game
    const matchingGame = new GameBot.MatchingTilesGame(matchingData, 'app-container');
    matchingGame.render();
  
    GameBot.showMessage('Match each Bible reference to its verse!');
  }
  
  // Placeholder methods for learning and quiz sessions
  startLearningSession() {
    // Implement learning session logic
    GameBot.showMessage('Starting learning session for ' + this.selectedCategory.name);
  }
  
  startQuizSession() {
    // Implement quiz session logic
    GameBot.showMessage('Starting quiz session for ' + this.selectedCategory.name);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BibleRecitationApp();
});
