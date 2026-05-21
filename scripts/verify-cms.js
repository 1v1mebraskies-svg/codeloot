#!/usr/bin/env node
/**
 * Verify CMS data integrity and search indexing
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/games.json'), 'utf8'));
const games = data.games;
let errors = [];

const gameIds = games.map((g) => g.id);
if (gameIds.length !== new Set(gameIds).size) {
    errors.push('Duplicate game IDs');
}

let allCodeIds = [];
games.forEach((g) => {
    if (!g.slug || !g.name) errors.push('Game missing slug/name: ' + g.id);
    (g.codes || []).forEach((c) => {
        allCodeIds.push(c.id);
        if (!c.code) errors.push('Empty code for game ' + g.slug);
    });
});

if (allCodeIds.length !== new Set(allCodeIds).size) {
    errors.push('Duplicate code IDs: ' + (allCodeIds.length - new Set(allCodeIds).size));
}

const slugs = new Set(games.map((g) => g.slug));
const htmlFiles = fs.readdirSync(path.join(__dirname, '../games')).filter((f) => f.endsWith('.html'));
htmlFiles.forEach((f) => {
    const slug = f.replace('.html', '');
    if (!slugs.has(slug)) {
        errors.push('HTML without JSON: ' + slug);
    }
});

function gameSearchText(game) {
    return [game.name, game.slug, game.description, game.category].join(' ').toLowerCase();
}

['blox', 'king', 'anime', 'volleyball', 'zzz'].forEach((q) => {
    const matches = games.filter((g) => gameSearchText(g).includes(q));
    console.log('search "' + q + '":', matches.length, 'games');
});

if (errors.length) {
    console.error('FAILED:', errors);
    process.exit(1);
}

console.log('OK:', games.length, 'games,', allCodeIds.length, 'codes, all IDs unique');
