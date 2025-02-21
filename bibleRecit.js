import Game from "./modules.js";

class RecitationGame {
  constructor(mode = "0") {
    this.mode = mode;
    this.selectedAge = null;
    this.selectedCategories = new Set();
    this.selectedPracticeCategory = null;
    this.createLandingPage();
  }

  createLandingPage() {
    const body = document.body;
    body.innerHTML = `
      <h2>Welcome to Bible Recitation Practice</h2>
      <p>Learn the verses gradually and practice more along the way.</p>
      <p>Select an age group:</p>
      <input type="radio" name="ageGroup" id="teen13" value="teen13-15" />
      <label for="teen13">Teen: 13-15</label><br />
      <input type="radio" name="ageGroup" id="superTeen16" value="superTeen16-19" />
      <label for="superTeen16">Super Teen: 16-19</label>

      <div id="modeSelection" style="display: none;">
        <input type="radio" name="mode" id="learnMode" value="learn" />
        <label for="learnMode">LEARN</label>
        <input type="radio" name="mode" id="testMode" value="test" />
        <label for="testMode">SELF TEST</label>
      </div>

      <div id="learnSection" style="display: none;">
        <h4>LEARN: Select a category for practice:</h4>
        <ul id="practiceCategoryList">
          <li>
            <input type="radio" name="practiceCategory" id="sanctifyRadio" value="Sanctify/Sanctified/Sanctification" />
            <label for="sanctifyRadio">Sanctify/Sanctified/Sanctification</label>
          </li>
          <li>
            <input type="radio" name="practiceCategory" id="cleanRadio" value="Clean, Cleanse, Cleansing" />
            <label for="cleanRadio">Clean, Cleanse, Cleansing</label>
          </li>
          <li>
            <input type="radio" name="practiceCategory" id="redeemRadio" value="Redeem/Redeemed/Redeemer" />
            <label for="redeemRadio">Redeem/Redeemed/Redeemer</label>
          </li>
          <li>
            <input type="radio" name="practiceCategory" id="warRadio" value="War" />
            <label for="warRadio">War</label>
          </li>
          <li>
            <input type="radio" name="practiceCategory" id="sacrificeRadio" value="Sacrifice" />
            <label for="sacrificeRadio">Sacrifice</label>
          </li>
        </ul>
      </div>

      <div id="testSection" style="display: none;">
        <h4>SELF TEST: Select categories for testing:</h4>
        <ul id="testCategoryList">
          <li>
            <input type="checkbox" id="sanctifyCheckbox" value="Sanctify/Sanctified/Sanctification" />
            <label for="sanctifyCheckbox">Sanctify/Sanctified/Sanctification</label>
          </li>
          <li>
            <input type="checkbox" id="cleanCheckbox" value="Clean, Cleanse, Cleansing" />
            <label for="cleanCheckbox">Clean, Cleanse, Cleansing</label>
          </li>
          <li>
            <input type="checkbox" id="redeemCheckbox" value="Redeem/Redeemed/Redeemer" />
            <label for="redeemCheckbox">Redeem/Redeemed/Redeemer</label>
          </li>
          <li>
            <input type="checkbox" id="warCheckbox" value="War" />
            <label for="warCheckbox">War</label>
          </li>
          <li>
            <input type="checkbox" id="sacrificeCheckbox" value="Sacrifice" />
            <label for="sacrificeCheckbox">Sacrifice</label>
          </li>
        </ul>
      </div>

      <button id="startButton" style="display: none;">Start</button>
      <div id="dynamicContent"></div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Age group selection
    document.querySelectorAll('input[name="ageGroup"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        this.selectedAge = radio.value;
        document.getElementById("modeSelection").style.display = "block";
      });
    });

    // Mode selection (LEARN or TEST)
    document.querySelectorAll('input[name="mode"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "learn") {
          document.getElementById("learnSection").style.display = "block";
          document.getElementById("testSection").style.display = "none";
        } else if (radio.value === "test") {
          document.getElementById("testSection").style.display = "block";
          document.getElementById("learnSection").style.display = "none";
        }
        this.checkSelectionAndShowStart();
      });
    });

    // Category selection for practice (radio buttons)
    document.querySelectorAll('input[name="practiceCategory"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          this.selectedPracticeCategory = radio.value;
          this.checkSelectionAndShowStart();
        }
      });
    });

    // Category selection for test (checkboxes)
    document.querySelectorAll('#testCategoryList input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          this.selectedCategories.add(checkbox.value);
        } else {
          this.selectedCategories.delete(checkbox.value);
        }
        this.checkSelectionAndShowStart();
      });
    });

    // Start button event listener
    document.getElementById("startButton").addEventListener("click", () => {
      this.updateDynamicContent();
    });
  }

  checkSelectionAndShowStart() {
    const learnModeSelected = document.getElementById("learnMode").checked;
    const testModeSelected = document.getElementById("testMode").checked;

    if (learnModeSelected && this.selectedPracticeCategory) {
      document.getElementById("startButton").style.display = "block";
    } else if (testModeSelected && this.selectedCategories.size > 0) {
      document.getElementById("startButton").style.display = "block";
    } else {
      document.getElementById("startButton").style.display = "none";
    }
  }

  
  // Getter for selected age
  getSelectedAge() {
    return this.selectedAge;
  }

  // Getter for selected categories
  getSelectedCategories() {
    return Array.from(this.selectedCategories);
  }

  // Change mode and log selected data
  changeMode(newMode) {
    this.mode = newMode;
    console.log(
      `Mode changed to ${newMode}. Selected Age: ${this.getSelectedAge()}, Selected Categories: ${this.getSelectedCategories()}, Practice Category: ${this.selectedPracticeCategory}`
    );
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new RecitationGame();
});