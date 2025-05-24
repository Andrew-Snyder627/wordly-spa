/**
 * @jest-environment jsdom
 */

const {
  fetchWordData,
  handleSearch,
  renderWord,
  getAudioUrl,
  capitalize,
  renderError,
  clearError,
  saveFavorite,
  renderFavorites,
} = require("../app");

// Function Testing

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("Word")).toBe("Word");
    expect(capitalize("")).toBe("");
    expect(capitalize(null)).toBe("");
  });
});

describe("getAudioUrl", () => {
  it("returns first audio url if present", () => {
    const data = { phonetics: [{ audio: "" }, { audio: "audio.mp3" }] };
    expect(getAudioUrl(data)).toBe("audio.mp3");
  });
  it("returns null if phonetics is missing", () => {
    expect(getAudioUrl({})).toBe(null);
  });
  it("returns null if no audio is present", () => {
    expect(getAudioUrl({ phonetics: [{ audio: "" }] })).toBe(null);
  });
});

// DOM Manipulation Tests

describe("renderError and clearError", () => {
  let errorDiv;
  beforeEach(() => {
    document.body.innerHTML = `<div id="error-message" class="hidden"></div>`;
    errorDiv = document.getElementById("error-message");
  });

  it("renders error message and removes hidden", () => {
    renderError("An error!");
    expect(errorDiv.textContent).toBe("An error!");
    expect(errorDiv.classList.contains("hidden")).toBe(false);
  });

  it("clears error message and adds hidden", () => {
    renderError("Error!");
    clearError();
    expect(errorDiv.textContent).toBe("");
    expect(errorDiv.classList.contains("hidden")).toBe(true);
  });
});

describe("renderWord", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="results"></div>
      <div id="error-message" class="hidden"></div>
      <ul id="favorites-list"></ul>
    `;
  });

  it("renders word data with audio and definitions", () => {
    const data = {
      word: "example",
      phonetic: "blah-blah",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: "A thing that is characteristic of its kind.",
              example: "This is an example.",
              synonyms: ["instance", "specimen"],
            },
          ],
        },
      ],
      phonetics: [{ audio: "audio.mp3" }],
    };
    renderWord(data);
    const results = document.getElementById("results");
    expect(results.innerHTML).toContain("Example");
    expect(results.innerHTML).toContain("audio.mp3");
    expect(results.innerHTML).toContain("instance, specimen");
    expect(document.getElementById("save-word-btn")).toBeTruthy();
  });

  it("renders word data with no audio", () => {
    const data = {
      word: "sample",
      phonetic: "blah-blah",
      meanings: [
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: "Sample definition.",
              example: "This is a sample.",
              synonyms: [],
            },
          ],
        },
      ],
      phonetics: [], // No audio
    };
    renderWord(data);
    const results = document.getElementById("results");
    expect(results.innerHTML).not.toContain("audio");
  });
});

// Favorites and Local Storage Tests

describe("saveFavorite and renderFavorites", () => {
  beforeEach(() => {
    // Clear localStorage and set up DOM before each test
    localStorage.clear();
    document.body.innerHTML = `<ul id="favorites-list"></ul>`;
  });

  it("saves and renders a favorite word", () => {
    saveFavorite("cat");
    expect(JSON.parse(localStorage.getItem("favorites"))).toContain("cat");
    renderFavorites();
    expect(document.getElementById("favorites-list").innerHTML).toContain(
      "Cat"
    );
  });

  it("does not add duplicate favorites", () => {
    saveFavorite("cat");
    saveFavorite("cat");
    const favorites = JSON.parse(localStorage.getItem("favorites"));
    expect(favorites.filter((w) => w === "cat").length).toBe(1);
  });

  it("renders placeholder when no favorites", () => {
    renderFavorites();
    expect(document.getElementById("favorites-list").innerHTML).toContain(
      "No saved words yet"
    );
  });
});

// Async Fetch Test

describe("fetchWordData", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns data when fetch succeeds", async () => {
    const fakeResponse = [{ word: "test" }];
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeResponse),
    });
    const data = await fetchWordData("test");
    expect(data.word).toBe("test");
  });

  it("throws error if fetch response not ok", async () => {
    fetch.mockResolvedValue({ ok: false });
    await expect(fetchWordData("notfound")).rejects.toThrow("Word not found");
  });
});

// Form Handling Tests

describe("handleSearch", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="search-form">
        <input id="search-input" />
      </form>
      <div id="error-message" class="hidden"></div>
      <div id="results"></div>
      <ul id="favorites-list"></ul>
    `;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders error if input is empty", async () => {
    document.getElementById("search-input").value = "";
    const fakeEvent = { preventDefault: jest.fn() };
    await handleSearch(fakeEvent);
    expect(document.getElementById("error-message").textContent).toBe(
      "Please enter a word."
    );
  });

  it("renders error if word not found", async () => {
    document.getElementById("search-input").value = "notfound";
    fetch.mockResolvedValue({ ok: false });
    const fakeEvent = { preventDefault: jest.fn() };
    await handleSearch(fakeEvent);
    expect(document.getElementById("error-message").textContent).toBe(
      "Sorry, that word was not found."
    );
  });

  it("renders word data if fetch succeeds", async () => {
    document.getElementById("search-input").value = "cat";
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            word: "cat",
            meanings: [
              { partOfSpeech: "noun", definitions: [{ definition: "a cat" }] },
            ],
          },
        ]),
    });
    const fakeEvent = { preventDefault: jest.fn() };
    await handleSearch(fakeEvent);
    expect(document.getElementById("results").innerHTML).toContain("Cat");
  });
});
