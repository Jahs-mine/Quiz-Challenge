import Game from "./modules.js";

class RecitationGame {
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
  };

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
    document
      .querySelectorAll('input[name="practiceCategory"]')
      .forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.checked) {
            this.selectedPracticeCategory = radio.value;
            this.checkSelectionAndShowStart();
          }
        });
      });

    // Category selection for test (checkboxes)
    document
      .querySelectorAll('#testCategoryList input[type="checkbox"]')
      .forEach((checkbox) => {
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
      `Mode changed to ${newMode}. Selected Age: ${this.getSelectedAge()}, Selected Categories: ${this.getSelectedCategories()}, Practice Category: ${
        this.selectedPracticeCategory
      }`
    );
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new RecitationGame();
});
