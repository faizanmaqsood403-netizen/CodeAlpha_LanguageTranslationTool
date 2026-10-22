"use strict";

/*
 * LinguaAI — Language Translation Tool
 * Translation provider: MyMemory public demo API.
 * This is a browser-only learning/demo implementation.
 * Public service availability and rate limits are not guaranteed.
 */

const API_URL = "https://api.mymemory.translated.net/get";
const MAX_CHARACTERS = 5000;
const PLACEHOLDER = "Your translation will appear here...";
const FAILURE_TEXT = "Translation could not be completed.";

const languageNames = {
    en: "English", ur: "Urdu", ar: "Arabic", fr: "French",
    de: "German", es: "Spanish", hi: "Hindi", zh: "Chinese",
    tr: "Turkish", it: "Italian", ja: "Japanese", pt: "Portuguese",
    ru: "Russian", bn: "Bengali"
};

const speechLocales = {
    en: "en-US", ur: "ur-PK", ar: "ar-SA", fr: "fr-FR",
    de: "de-DE", es: "es-ES", hi: "hi-IN", zh: "zh-CN",
    tr: "tr-TR", it: "it-IT", ja: "ja-JP", pt: "pt-PT",
    ru: "ru-RU", bn: "bn-BD"
};

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const sourceText = document.getElementById("sourceText");
const translatedText = document.getElementById("translatedText");
const translateButton = document.getElementById("translateButton");
const swapLanguagesButton = document.getElementById("swapLanguages");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const speakButton = document.getElementById("speakButton");
const characterCount = document.getElementById("characterCount");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const resultLanguage = document.getElementById("resultLanguage");
const errorMessage = document.getElementById("errorMessage");

let latestTranslation = "";
let requestInProgress = false;

function updateCharacterCount() {
    characterCount.textContent = `${sourceText.value.length} / ${MAX_CHARACTERS}`;
}

function updateResultLanguage() {
    resultLanguage.textContent = languageNames[targetLanguage.value] || "Translation";
}

function setStatus(message, state = "ready") {
    statusText.textContent = message;
    statusDot.classList.toggle("loading", state === "loading");
    statusDot.classList.toggle("failed", state === "failed");
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    setStatus("Failed", "failed");
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
}

function resetOutput(message = PLACEHOLDER) {
    latestTranslation = "";
    translatedText.textContent = message;
    copyButton.disabled = true;
    speakButton.disabled = true;
}

function setLoading(isLoading) {
    requestInProgress = isLoading;
    translateButton.disabled = isLoading;
    sourceLanguage.disabled = isLoading;
    targetLanguage.disabled = isLoading;
    swapLanguagesButton.disabled = isLoading;
    clearButton.disabled = isLoading;
    translateButton.innerHTML = isLoading
        ? "<span>Translating...</span><span aria-hidden=\"true\">⏳</span>"
        : "<span>Translate Text</span><span aria-hidden=\"true\">→</span>";
}

function decodeHtmlEntities(value) {
    // MyMemory can return HTML entities. Decode as text, never as inserted HTML.
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
}

async function translate() {
    if (requestInProgress) return;

    const text = sourceText.value.trim();
    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    hideError();

    if (!text) {
        showError("Please enter some text to translate.");
        sourceText.focus();
        return;
    }

    if (text.length > MAX_CHARACTERS) {
        showError(`Text must not exceed ${MAX_CHARACTERS} characters.`);
        return;
    }

    if (source === target) {
        showError("Please select two different languages.");
        return;
    }

    if (!navigator.onLine) {
        showError("You appear to be offline. Connect to the internet and try again.");
        return;
    }

    setLoading(true);
    resetOutput("Please wait while we translate your text...");
    setStatus("Translating", "loading");

    try {
        const params = new URLSearchParams({
            q: text,
            langpair: `${source}|${target}`
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        let response;
        try {
            response = await fetch(`${API_URL}?${params.toString()}`, {
                method: "GET",
                headers: { "Accept": "application/json" },
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            throw new Error(`Translation service returned HTTP ${response.status}.`);
        }

        const data = await response.json();

        if (Number(data.responseStatus) !== 200) {
            throw new Error(
                data.responseDetails ||
                "The translation service could not process this request. Try again later."
            );
        }

        const rawTranslation = data.responseData?.translatedText;
        if (typeof rawTranslation !== "string" || !rawTranslation.trim()) {
            throw new Error("The translation service returned an empty result.");
        }

        latestTranslation = decodeHtmlEntities(rawTranslation);
        translatedText.textContent = latestTranslation;
        copyButton.disabled = false;
        speakButton.disabled = false;
        setStatus("Completed");
    } catch (error) {
        console.error("LinguaAI translation error:", error);
        resetOutput(FAILURE_TEXT);

        if (error.name === "AbortError") {
            showError("The request took too long. Please try again.");
        } else if (error instanceof TypeError) {
            showError("Could not connect to the translation service. Check your internet connection, then try again.");
        } else {
            showError(error.message || "Something went wrong. Please try again.");
        }
    } finally {
        setLoading(false);
    }
}

translateButton.addEventListener("click", translate);

sourceText.addEventListener("input", () => {
    updateCharacterCount();
    hideError();
});

sourceLanguage.addEventListener("change", () => {
    hideError();
});

targetLanguage.addEventListener("change", () => {
    updateResultLanguage();
    hideError();
});

clearButton.addEventListener("click", () => {
    if (requestInProgress) return;
    sourceText.value = "";
    resetOutput();
    updateCharacterCount();
    hideError();
    setStatus("Ready");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    sourceText.focus();
});

swapLanguagesButton.addEventListener("click", () => {
    if (requestInProgress) return;

    const oldSource = sourceLanguage.value;
    const oldTarget = targetLanguage.value;
    const oldInput = sourceText.value;
    const oldTranslation = latestTranslation;

    sourceLanguage.value = oldTarget;
    targetLanguage.value = oldSource;

    if (oldTranslation) {
        sourceText.value = oldTranslation;
        resetOutput();
    } else if (oldInput) {
        // Do not pretend the input has been translated in the reverse direction.
        resetOutput();
    }

    updateCharacterCount();
    updateResultLanguage();
    hideError();
    setStatus("Ready");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});

copyButton.addEventListener("click", async () => {
    if (!latestTranslation || copyButton.disabled) return;
    hideError();

    try {
        await navigator.clipboard.writeText(latestTranslation);
        copyButton.textContent = "Copied!";
        window.setTimeout(() => {
            copyButton.textContent = "Copy text";
        }, 1500);
    } catch (error) {
        showError("Clipboard access failed. Select the translated text and copy it manually.");
    }
});

speakButton.addEventListener("click", () => {
    if (!latestTranslation || speakButton.disabled) return;

    if (!("speechSynthesis" in window)) {
        showError("Text-to-Speech is not supported by this browser.");
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestTranslation);
    utterance.lang = speechLocales[targetLanguage.value] || "en-US";
    utterance.rate = 0.9;
    utterance.onerror = () => {
        showError("Speech playback failed. A voice for this language may not be installed on your device.");
    };
    window.speechSynthesis.speak(utterance);
});

// Enter can submit the text; Shift+Enter adds a new line.
sourceText.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        translate();
    }
});

window.addEventListener("online", () => {
    if (!requestInProgress) hideError();
});

updateCharacterCount();
updateResultLanguage();
setStatus("Ready");
console.log("LinguaAI is ready.");
