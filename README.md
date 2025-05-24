# Wordly: Interactive Dictionary SPA

---

## Overview

Wordly is a Single Page Application (SPA) built with HTML, CSS, and JavaScript that allows users to search for words and retrieve real-time dictionary information. The application interacts with the free dictionaryapi.dev API to display definitions, pronunciations, synonyms, and usage examples. Users can also save their favorite words for easy access—all on a single, responsive web page.

## Features

Search Functionality: Users can search for any English word to retrieve dictionary information.

Pronunciation and Audio Playback: Displays phonetic spelling and, when available, allows users to listen to word pronunciations.

Definitions and Examples: Presents part of speech, definitions, and example sentences for each word.

Synonyms: Lists synonyms where provided by the API.

Favorites List: Users can save words to their favorites, which persist in the browser’s local storage.

Responsive UI: The application is styled for clarity and accessibility, with a clean and modern interface.

Error Handling: Displays friendly error messages if a word is not found or if there is a network/API issue.

## Getting Started

### Prerequisites

Node.js (for running tests)

npm (for package management)

Live Server extension for VS Code, or any static file server, to run locally without CORS issues

## Technical Details

API: dictionaryapi.dev

Persistence: Uses browser localStorage for favorites

Testing: Jest + jsdom

No frameworks are required—this app is built with vanilla JavaScript, HTML, and CSS for learning and clarity.

## Acknowledgments

This project was built by Andrew Snyder as part of the Flatiron School software engineering curriculum.
