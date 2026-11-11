#!/usr/bin/env node
// Writes a signed /ad-photos link for every listed business to the file you name.
// Each link is a secret and this repo is public, so the file must live outside it.
//
// node --env-file=../Manitou-Beach/.env.notion.tmp scripts/ad-intake-links.mjs ~/Desktop/ad-links.tsv
//
// Needs AD_INTAKE_SIGNING_SECRET, SITE_URL, NOTION_TOKEN_BUSINESS and NOTION_DB_BUSINESS.
// The secret must match the one in Vercel or the links will not open.

import { chmodSync, realpathSync, writeFileSync } from 'fs';
import { dirname, resolve, sep } from 'path';
import { fileURLToPath } from 'url';
import { listedBusinesses, makeAdToken } from '../api/lib/ad-intake.js';

const repoRoot = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/ad-intake-links.mjs /path/outside/the/repo/links.tsv');
  process.exit(1);
}

let outPath;
try {
  outPath = resolve(realpathSync(dirname(resolve(target))), resolve(target).split(sep).pop());
} catch {
  console.error('That folder does not exist.');
  process.exit(1);
}
if (outPath === repoRoot || outPath.startsWith(repoRoot + sep)) {
  console.error('Refusing to write signed links inside the repo. Pick a path outside it.');
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/$/, '');
for (const [key, value] of Object.entries({
  AD_INTAKE_SIGNING_SECRET: process.env.AD_INTAKE_SIGNING_SECRET,
  SITE_URL: siteUrl,
  NOTION_TOKEN_BUSINESS: process.env.NOTION_TOKEN_BUSINESS,
  NOTION_DB_BUSINESS: process.env.NOTION_DB_BUSINESS,
})) {
  if (!value) {
    console.error(`${key} is not set.`);
    process.exit(1);
  }
}

const businesses = await listedBusinesses();
if (!businesses.length) {
  console.error('No listed businesses came back, nothing written.');
  process.exit(1);
}

const lines = businesses
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((b) => `${b.name}\t${siteUrl}/ad-photos?slug=${b.slug}&t=${makeAdToken(b.pageId)}`);

writeFileSync(outPath, lines.join('\n') + '\n', { mode: 0o600 });
chmodSync(outPath, 0o600);
console.log(`${businesses.length} links written to ${outPath}`);
