import fs from "fs";

const themes = {
  countries: JSON.parse(fs.readFileSync("./data/countries.json")),
  nature: JSON.parse(fs.readFileSync("./data/nature.json")),
  history: JSON.parse(fs.readFileSync("./data/history.json")),
  africa_focus: JSON.parse(fs.readFileSync("./data/africa_focus.json")),
  origins: JSON.parse(fs.readFileSync("./data/origins.json")),
};

export function getRandomMix() {
  return Object.values(themes).flat();
}

export function getThemeFacts(themeId) {
  if (themeId === "random_mix") {
    return getRandomMix();
  }
  return themes[themeId] || [];
}

export function getRandomFactFromTheme(themeId) {
  const facts = getThemeFacts(themeId);
  if (facts.length === 0) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}

export function getThemeNames() {
  return Object.keys(themes);
}