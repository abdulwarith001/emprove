const fs = require("fs");
const axios = require("axios");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "words.json");
const OUTPUT_FILE = path.join(__dirname, "vocab_enriched_500.json");
const DELAY_MS = 1000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function loadJSON(file) {
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
  return [];
}

async function fetchWordData(word) {
  try {
    const res = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = res.data[0];

    const pronunciation = data.phonetics?.[0]?.text || "";
    const meaningBlock = data.meanings?.[0];
    const partOfSpeech = meaningBlock?.partOfSpeech || "";
    const definitions = meaningBlock?.definitions || [];

    const definition = definitions[0]?.definition || "";
    const examples = definitions
      .filter((d) => d.example)
      .map((d) => d.example)
      .slice(0, 5);

    while (examples.length < 5) examples.push("");

    return {
      word,
      pronunciation,
      definition,
      partOfSpeech,
      examples,
    };
  } catch (err) {
    console.warn(`Failed: ${word} – ${err.message}`);
    return null;
  }
}

async function main() {
  const sourceWords = loadJSON(INPUT_FILE);
  const savedData = loadJSON(OUTPUT_FILE);
  const savedWords = new Set(savedData.map((w) => w.word));

  for (const entry of sourceWords) {
    if (savedWords.has(entry.word)) {
      console.log(`Skipping (already saved): ${entry.word}`);
      continue;
    }

    const enriched = await fetchWordData(entry.word);
    if (enriched) {
      const final = { ...entry, ...enriched };
      savedData.push(final);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(savedData, null, 2));
      console.log(`✅ Saved: ${entry.word}`);
    }

    await delay(DELAY_MS);
  }

  console.log("🎉 Done enriching all available words.");
}

main();
