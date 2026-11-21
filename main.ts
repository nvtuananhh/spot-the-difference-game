// Spot It! Twin Pictures — hand-in assembler.
//
// This entrypoint does one job only: it gathers the finished game and its
// screenshots into the directory the scorer inspects, then asks the
// vendored make.fun library to summarise that directory as dossier.json.
// The game itself lives entirely under game/; nothing here draws, plays
// audio, or touches game logic, so changing this file cannot change how
// the game behaves when a browser opens game/index.html.
//
// Layout of the hand-in, step by step:
//   1. Work out where this file sits on disk (the repo checkout) and
//      where the finished entry must land (MAKEFUN_OUTPUT_DIR, or
//      /output when the variable is unset, which is the scorer's path).
//   2. Recreate the playable game under the destination, file for file.
//   3. Recreate the screenshots beside it, but only when the checkout
//      actually carries a screenshots/ folder — an entry without one
//      still hands in an empty screenshots/ directory for the dossier
//      builder to look at.
//   4. Build the dossier from the destination directory, under exactly
//      the caps the scorer enforces, and write it as dossier.json.
//
// Run it locally outside the scorer's container like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// then open the copied game with `node serve.ts` as README describes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

// The scorer's caps, taken from its gate.json. Only text_max_bytes
// shapes the dossier bytes; the remaining caps make this program refuse
// an entry the scorer would refuse anyway (too many screenshots, an
// oversized screenshot, or a game/ tree that is too large, too numerous,
// or whose paths run too long for the 1000-entry /output ceiling).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Where this source file lives: the checkout root, beside game/.
function checkoutRoot(): string {
  return fileURLToPath(new URL(".", import.meta.url));
}

// Where the finished entry lands. The environment variable lets a
// local run redirect the hand-in; the scorer itself uses /output.
function handInRoot(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// Create a directory and any missing parents, tolerating one that is
// already there.
function createTree(directory: string): void {
  mkdirSync(directory, { recursive: true });
}

// Copy a whole folder tree onto its destination, overwriting files
// that are already present there.
function mirrorTree(sourceFolder: string, targetFolder: string): void {
  cpSync(sourceFolder, targetFolder, { recursive: true });
}

// Stage the playable game: the entire game/ tree, copied verbatim.
function stageGame(checkout: string, handIn: string): void {
  mirrorTree(join(checkout, "game"), join(handIn, "game"));
}

// Stage the screenshots. The destination folder is always created
// first; the copy itself runs only when the checkout has screenshots
// to copy, so a missing folder is a quiet empty one, not a crash.
function stageScreenshots(checkout: string, handIn: string): void {
  const shotFolder = join(handIn, "screenshots");
  createTree(shotFolder);
  const sourceShots = join(checkout, "screenshots");
  if (existsSync(sourceShots)) {
    mirrorTree(sourceShots, shotFolder);
  }
}

// Ask the vendored library to summarise the staged hand-in and store
// the result as dossier.json at the hand-in root.
function emitDossier(handIn: string): void {
  const dossierText = buildDossier(handIn, DOSSIER_CAPS);
  writeFileSync(join(handIn, "dossier.json"), dossierText);
}

// Assemble the hand-in in the order the dossier builder expects:
// destination first, then the game, then the screenshots, then the
// dossier describing exactly what was staged.
function assembleHandIn(): void {
  const checkout = checkoutRoot();
  const handIn = handInRoot();
  createTree(handIn);
  stageGame(checkout, handIn);
  stageScreenshots(checkout, handIn);
  emitDossier(handIn);
}

assembleHandIn();
