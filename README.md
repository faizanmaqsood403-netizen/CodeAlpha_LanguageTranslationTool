# LinguaAI — Language Translation Tool

An internship Task 1 project: a responsive, dark-themed web application for translating text between supported languages.

## Features

- Responsive dark/glassmorphism interface
- Source and target language selection
- Translation through the MyMemory public demo API
- Language swap
- Character counter (up to 5,000 characters)
- Copy translated text
- Browser Text-to-Speech (voice availability depends on the device)
- Loading status, validation, timeout and error messages
- Keyboard shortcut: press Enter to translate; Shift+Enter inserts a new line

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API / JSON
- MyMemory translation API
- Browser Speech Synthesis API

## Run locally

1. Extract the project folder.
2. Open it in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Keep an internet connection available for translation requests.
5. Choose source and target languages, enter text, and click **Translate Text**.

## API notes

This demo uses the public MyMemory endpoint:

`https://api.mymemory.translated.net/get`

The public service may apply rate limits, have downtime, or change its terms. This project does not include a paid API key or guarantee service availability. For production use, select a supported translation provider, review its pricing and terms, and route credentials through a backend rather than exposing secret keys in frontend code.

## Privacy note

Text entered into the translator is sent to the external translation service for processing. Do not enter confidential, personal, or sensitive information.

## Submission checklist

- [ ] Test English → Urdu
- [ ] Test Urdu → English
- [ ] Test empty input validation
- [ ] Test swap, clear, copy and speech controls
- [ ] Test in a narrow/mobile browser window
- [ ] Capture screenshots of the working app
- [ ] Include this README with the submission
