// CODELOOT Admin Panel
let gamesData = null;
let currentEditingGameId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadGames();
    setupEventListeners();
});

async function loadGames() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Failed to fetch games');
        
        gamesData = await response.json();
        console.log('Loaded games:', gamesData);
        
        renderGamesTable();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('gamesTableContainer').style.display = 'block';
    } catch (error) {
        console.error('Error loading games:', error);
        showError('Failed to load games: ' + error.message);
        document.getElementById('loading').style.display = 'none';
    }
}

function renderGamesTable() {
    const tbody = document.getElementById('gamesTableBody');
    tbody.innerHTML = '';

    if (!gamesData || !gamesData.games || gamesData.games.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;">No games found</td></tr>';
        return;
    }

    gamesData.games.forEach(game => {
        const row = document.createElement('tr');
        const imageHtml = game.image 
            ? `<img src="/assets/img/${game.image}" alt="${game.name}" style="max-width:50px;max-height:40px;object-fit:cover;">`
            : '<span style="color:#999;">No image</span>';
        
        row.innerHTML = `
            <td>${game.id}</td>
            <td>${imageHtml}</td>
            <td><strong>${escapeHtml(game.name)}</strong></td>
            <td>${escapeHtml(game.slug)}</td>
            <td>${escapeHtml(game.category || 'general')}</td>
            <td>${game.featured ? '✓' : ''}</td>
            <td><span class="badge ${game.active ? 'active' : 'inactive'}">${game.active ? 'Active' : 'Inactive'}</span></td>
            <td>${(game.codes || []).length}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="editGame(${game.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteGame(${game.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupEventListeners() {
    // Add Game button
    document.getElementById('addGameBtn').addEventListener('click', openGameModal);

    // Game form submit
    document.getElementById('gameForm').addEventListener('submit', handleGameSubmit);

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('gameModal').style.display = 'none';
    });

    // Close button
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('gameModal').style.display = 'none';
    });

    // Image preview
    document.getElementById('gameImage').addEventListener('change', handleImagePreview);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('gameModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openGameModal(game = null) {
    const modal = document.getElementById('gameModal');
    const form = document.getElementById('gameForm');
    const modalTitle = document.getElementById('modalTitle');

    form.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('currentImageName').textContent = '-';

    if (game) {
        modalTitle.textContent = 'Edit Game';
        currentEditingGameId = game.id;
        document.getElementById('gameId').value = game.id;
        document.getElementById('gameName').value = game.name || '';
        document.getElementById('gameSlug').value = game.slug || '';
        document.getElementById('gameCategory').value = game.category || 'general';
        document.getElementById('gameDescription').value = game.description || '';
        document.getElementById('gameShortDescription').value = game.short_description || '';
        document.getElementById('gameLongDescription').value = game.long_description || '';
        document.getElementById('gameFeatured').checked = !!game.featured;
        document.getElementById('gameActive').checked = game.active !== false;
        
        if (game.image) {
            document.getElementById('currentImageName').textContent = game.image;
            document.getElementById('imagePreview').innerHTML = 
                `<img src="/assets/img/${game.image}" alt="Current" style="max-width:200px;max-height:150px;margin-top:10px;">`;
        }
    } else {
        modalTitle.textContent = 'Add New Game';
        currentEditingGameId = null;
        document.getElementById('gameFeatured').checked = false;
        document.getElementById('gameActive').checked = true;
    }

    modal.style.display = 'block';
}

function editGame(gameId) {
    const game = gamesData.games.find(g => g.id === gameId);
    if (game) {
        openGameModal(game);
    }
}

async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) {
        return;
    }

    try {
        gamesData.games = gamesData.games.filter(g => g.id !== gameId);
        await saveGames();
        renderGamesTable();
        showSuccess('Game deleted successfully');
    } catch (error) {
        console.error('Error deleting game:', error);
        showError('Failed to delete game: ' + error.message);
    }
}

async function handleGameSubmit(e) {
    e.preventDefault();

    const gameData = {
        name: document.getElementById('gameName').value.trim(),
        slug: document.getElementById('gameSlug').value.trim(),
        category: document.getElementById('gameCategory').value || 'general',
        description: document.getElementById('gameDescription').value.trim(),
        short_description: document.getElementById('gameShortDescription').value.trim(),
        long_description: document.getElementById('gameLongDescription').value.trim(),
        featured: document.getElementById('gameFeatured').checked,
        active: document.getElementById('gameActive').checked,
    };

    if (!gameData.name || !gameData.slug || !gameData.description) {
        showError('Name, Slug, and Description are required');
        return;
    }

    const imageFile = document.getElementById('gameImage').files[0];

    try {
        if (imageFile) {
            const imageResult = await uploadImage(imageFile, gameData.slug);
            gameData.image = imageResult.image;
        } else if (currentEditingGameId) {
            // Preserve existing image if no new upload
            const existing = gamesData.games.find(g => g.id === currentEditingGameId);
            if (existing && existing.image) {
                gameData.image = existing.image;
            }
        }

        if (currentEditingGameId) {
            // Update existing game
            const index = gamesData.games.findIndex(g => g.id === currentEditingGameId);
            if (index !== -1) {
                gameData.id = currentEditingGameId;
                gameData.created_at = gamesData.games[index].created_at;
                gameData.updated_at = new Date().toISOString();
                gameData.codes = gamesData.games[index].codes || [];
                gameData.redeem_instructions = gamesData.games[index].redeem_instructions || [];
                gamesData.games[index] = gameData;
            }
        } else {
            // Add new game
            const newId = gamesData.games.length > 0 
                ? Math.max(...gamesData.games.map(g => g.id)) + 1 
                : 1;
            gameData.id = newId;
            gameData.created_at = new Date().toISOString();
            gameData.updated_at = new Date().toISOString();
            gameData.codes = [];
            gameData.redeem_instructions = [];
            gamesData.games.push(gameData);
        }

        await saveGames();
        renderGamesTable();
        document.getElementById('gameModal').style.display = 'none';
        showSuccess(currentEditingGameId ? 'Game updated successfully' : 'Game added successfully');
        currentEditingGameId = null;
    } catch (error) {
        console.error('Error saving game:', error);
        showError('Failed to save game: ' + error.message);
    }
}

async function uploadImage(file, slug) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('slug', slug);

    const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    return await response.json();
}

async function saveGames() {
    const response = await fetch('/api/games', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(gamesData)
    });

    if (!response.ok) {
        throw new Error('Failed to save games');
    }

    return await response.json();
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').innerHTML = 
                `<img src="${event.target.result}" alt="Preview" style="max-width:200px;max-height:150px;margin-top:10px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 6000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '✓ ' + message;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('success');
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.classList.remove('success');
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
