#!/usr/bin/env node
/**
 * One-time migration: extract games + codes from static HTML into data/games.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const INDEX_FILE = path.join(ROOT, 'index.html');
const OUT_FILE = path.join(ROOT, 'data', 'games.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function slugFromHref(href) {
  const m = href.match(/games\/([^"]+)\.html/);
  return m ? m[1] : null;
}

function parseIndexMeta() {
  const html = read(INDEX_FILE);
  const bySlug = {};
  const sections = [
    { pattern: /featured-games[\s\S]*?<div class="featured-grid">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/, category: 'anime', featured: true },
    { pattern: /aria-label="Anime Games"[\s\S]*?<div class="game-grid">([\s\S]*?)<\/div>/, category: 'anime', featured: false },
    { pattern: /aria-label="PvP Games"[\s\S]*?<div class="game-grid">([\s\S]*?)<\/div>/, category: 'pvp', featured: false },
    { pattern: /aria-label="RNG[\s\S]*?<div class="game-grid">([\s\S]*?)<\/div>/, category: 'rng', featured: false },
    { pattern: /aria-label="Horror[\s\S]*?<div class="game-grid">([\s\S]*?)<\/div>/, category: 'horror', featured: false },
  ];

  const cardRe = /href="games\/([^"]+)\.html"[^>]*data-game-card[^>]*data-game-name="([^"]*)"[\s\S]*?<h3>([^<]*)<\/h3>\s*<p>([^<]*)<\/p>/g;

  for (const { pattern, category, featured } of sections) {
    const m = html.match(pattern);
    if (!m) continue;
    let match;
    while ((match = cardRe.exec(m[1])) !== null) {
      const slug = match[1];
      if (!bySlug[slug]) {
        bySlug[slug] = {
          slug,
          name: match[3].trim(),
          description: match[4].trim(),
          category,
          featured: !!featured,
        };
      }
    }
  }

  return bySlug;
}

function parseGameFile(filePath) {
  const html = read(filePath);
  const slug = path.basename(filePath, '.html');

  const h1Match = html.match(/<h1>([^<]*)<\/h1>/);
  let name = h1Match ? h1Match[1].replace(/\s*Codes\s*$/i, '').trim() : slug;

  const descMatch = html.match(/class="game-banner-copy"[\s\S]*?<p>([^<]*)<\/p>/);
  const description = descMatch ? descMatch[1].trim() : '';

  const codes = [];
  const codeRe = /<article class="code-card">[\s\S]*?<h3>([^<]*)<\/h3>\s*<p>([^<]*)<\/p>[\s\S]*?data-code="([^"]*)"/g;
  let m;
  while ((m = codeRe.exec(html)) !== null) {
    codes.push({
      code: m[3].trim() || m[1].trim(),
      reward: m[2].trim(),
      status: 'active',
    });
  }

  return { slug, name, description, codes };
}

function main() {
  const indexMeta = parseIndexMeta();
  const files = fs.readdirSync(GAMES_DIR).filter((f) => f.endsWith('.html'));
  const games = [];
  let gameId = 0;
  let codeId = 0;
  const now = '2026-01-01T00:00:00Z';

  const featuredSlugs = new Set([
    'blox-fruits', 'king-legacy', 'anime-defenders', 'type-soul',
    'untitled-boxing-game', 'blade-ball',
  ]);

  for (const file of files.sort()) {
    const parsed = parseGameFile(path.join(GAMES_DIR, file));
    const meta = indexMeta[parsed.slug] || {};
    gameId += 1;

    const game = {
      id: gameId,
      name: meta.name || parsed.name,
      slug: parsed.slug,
      description: meta.description || parsed.description,
      category: meta.category || 'general',
      featured: meta.featured ?? featuredSlugs.has(parsed.slug),
      active: true,
      created_at: now,
      updated_at: now,
      codes: parsed.codes.map((c) => {
        codeId += 1;
        return {
          id: codeId,
          code: c.code,
          reward: c.reward,
          status: c.status,
          created_at: now,
        };
      }),
    };
    games.push(game);
  }

  const output = {
    games,
    metadata: {
      version: '1.0',
      last_updated: new Date().toISOString(),
    },
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${games.length} games, ${codeId} codes to ${OUT_FILE}`);
}

main();
