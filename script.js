const wrapper = document.querySelector(".wrapper"),
    searchInput = wrapper.querySelector("input"),
    synonyms = wrapper.querySelector(".synonyms .list"),
    infoText = wrapper.querySelector(".info-text"),
    volumeIcon = wrapper.querySelector(".word i");

let audio; // Declare audio variable globally

// Function to handle API data
function data(result, word) {
    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    } else {
        wrapper.classList.add("active");
        populateWordDetails(result[0]);
        populateSynonyms(result[0]);
    }
}

// Populate word details: word, phonetics, definition, example
function populateWordDetails(wordData) {
    const word = wordData.word;
    const phoneticsText = wordData.phonetics[0]?.text || "";
    const audioSrc = wordData.phonetics[0]?.audio || "";
    const definitions = wordData.meanings[0]?.definitions[0];

    document.querySelector(".word p").innerText = word;
    document.querySelector(".word span").innerText = `${wordData.meanings[0]?.partOfSpeech || ""} /${phoneticsText}/`;

    document.querySelector(".meaning span").innerText = definitions?.definition || "No definition available.";
    document.querySelector(".example span").innerText = definitions?.example || "No example available.";

    // Setup audio
    if (audioSrc && audioSrc.startsWith("https:")) {
        audio = new Audio(audioSrc);
        volumeIcon.style.color = "#000"; // Enable the volume icon
        volumeIcon.style.pointerEvents = "auto"; // Allow clicks
    } else {
        audio = null;
        volumeIcon.style.color = "#ccc"; // Gray out the volume icon
        volumeIcon.style.pointerEvents = "none"; // Disable clicks
        console.warn("No valid audio source available for this word.");
    }
}

// Populate synonyms
function populateSynonyms(wordData) {
    synonyms.innerHTML = ""; // Clear previous synonyms
    let synonymsArray = [];

    wordData.meanings.forEach(meaning => {
        if (meaning.definitions) {
            meaning.definitions.forEach(def => {
                if (def.synonyms) {
                    synonymsArray = [...synonymsArray, ...def.synonyms];
                }
            });
        }
    });

    // Remove duplicates and limit to first 5 synonyms
    synonymsArray = [...new Set(synonymsArray)].slice(0, 5);

    if (synonymsArray.length > 0) {
        synonymsArray.forEach(synonym => {
            let tag = `<span>${synonym}</span>`;
            synonyms.insertAdjacentHTML("beforeend", tag);
        });
    } else {
        synonyms.innerHTML = "<span>No synonyms available.</span>";
    }
}

// Fetch data from the API
function fetchApi(word) {
    infoText.style.color = "#000";
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(url)
        .then(res => res.json())
        .then(result => data(result, word))
        .catch(err => {
            console.error("Error fetching data:", err);
            infoText.innerHTML = `Can't fetch the meaning of <span>"${word}"</span>. Please, check your internet connection.`;
        });
}

// Event listeners
searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter" && e.target.value) {
        fetchApi(e.target.value);
    }
});

volumeIcon.addEventListener("click", () => {
    if (audio) {
        audio.play().catch(err => console.error("Audio playback failed:", err));
    }
});
