document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  document
    .getElementById("search-form")
    .addEventListener("submit", handleSearch);
  document.getElementById("clear-favorites").addEventListener("click", () => {
    localStorage.removeItem("favorites");
    renderFavorites();
  });
});

// Global Variables
let currentSelectedFavorite = null;

// Fetch word data from API
// Throw error if word is not found or failed request
function fetchWordData(word) {
  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => {
      if (!response.ok) throw new Error("Word not found");
      return response.json();
    })
    .then((data) => data[0]);
}

// Handle the search for submission. Fetch, Parse, & Render
async function handleSearch(event) {
  event.preventDefault();
  clearError();
  const word = document.getElementById("search-input").value.trim();
  if (!word) return renderError("Please enter a word.");
  try {
    const data = await fetchWordData(word);
    renderWord(data);
  } catch (err) {
    renderError("Sorry, that word was not found.");
  }
}
// Render word data into the results section
// Shows pronuciation, audio, all definitions, part of speech, synonyms, & save button
function renderWord(data) {
  const results = document.getElementById("results");
  const audioPhonetic = getAudioUrl(data);
  results.innerHTML = `
    <h2>${capitalize(data.word)}</h2>
    <p><strong>Phonetic:</strong> ${data.phonetic || "N/A"}</p>
    ${audioPhonetic ? `<audio controls src="${audioPhonetic}"></audio>` : ""}
    <div>
      ${data.meanings
        .map(
          (m) => `
        <p><strong>${m.partOfSpeech}:</strong> ${
            m.definitions[0].definition
          }</p>
        ${
          m.definitions[0].example
            ? `<blockquote>Example: "${m.definitions[0].example}"</blockquote>`
            : ""
        }
        ${
          m.definitions[0].synonyms && m.definitions[0].synonyms.length
            ? `<p><strong>Synonyms:</strong> ${m.definitions[0].synonyms.join(
                ", "
              )}</p>`
            : ""
        }
      `
        )
        .join("")}
    </div>
    <button id="save-word-btn">Save Word</button>
  `;

  // Set up save button event revisit
  document.getElementById("save-word-btn").onclick = () =>
    saveFavorite(data.word);
}

// Extract the first available audio URL from API data
function getAudioUrl(data) {
  if (!data.phonetics) return null;
  const found = data.phonetics.find((p) => p.audio);
  return found && found.audio ? found.audio : null;
}

// Capitalize the first letter of a string
function capitalize(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show an error message in the #error-message div
function renderError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

// Hide and clear the error message
function clearError() {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = "";
  errorDiv.classList.add("hidden");
}

// Save a favorite word to localStorage and update the favorite list.
// First time using localStorage hopefully set up properly
function saveFavorite(word) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favorites.includes(word)) {
    favorites.push(word);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  }
}

// Render the favorites
function renderFavorites() {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const favoriteList = document.getElementById("favorites-list");
  if (!favoriteList) return;
  if (favorites.length === 0) {
    favoriteList.innerHTML = `<li><em>No saved words yet.</em></li>`;
    return;
  }
  favoriteList.innerHTML = favorites
    .map(
      (word) =>
        `<li>
      <span class="favorite-word" data-word="${word}" tabindex="0" role="button">${capitalize(
          word
        )}</span>
      <button class="remove-favorite" data-word="${word}">Remove</button></li>`
    )
    .join("");

  // Event listeners to remove buttons
  document.querySelectorAll(".remove-favorite").forEach((button) =>
    button.addEventListener("click", (e) => {
      removeFavorite(e.target.getAttribute("data-word"));
    })
  );
  document.querySelectorAll(".favorite-word").forEach((button) =>
    button.addEventListener("click", (event) => {
      const word = event.target.getAttribute("data-word");
      loadFavoriteWord(word);
    })
  );
  // Apply highlighting to selected favorite if it exists
  if (currentSelectedFavorite) {
    highlightFavorite(currentSelectedFavorite);
  }
}

function removeFavorite(word) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter((favorite) => favorite !== word);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  // Clear highlight if the selected favorite is removed
  if (currentSelectedFavorite === word) {
    currentSelectedFavorite = null;
  }
  renderFavorites();
}

function loadFavoriteWord(word) {
  clearError();
  fetchWordData(word)
    .then((data) => {
      renderWord(data);
      currentSelectedFavorite = word;
      highlightFavorite(word);
    })
    .catch(() => {
      renderError("Sorry, that word was not found.");
    });
}

function highlightFavorite(word) {
  document.querySelectorAll(".favorite-word").forEach((button) => {
    if (button.getAttribute("data-word") === word) {
      button.classList.add("selected-favorite");
    } else {
      button.classList.remove("selected-favorite");
    }
  });
}

// Export for testing
module.exports = {
  fetchWordData,
  handleSearch,
  renderWord,
  getAudioUrl,
  capitalize,
  renderError,
  clearError,
  saveFavorite,
  renderFavorites,
  removeFavorite,
  // Using these to expose the selected favorite state for testing
  getCurrentSelectedFavorite: () => currentSelectedFavorite,
  setCurrentSelectedFavorite: (val) => {
    currentSelectedFavorite = val;
  },
};
