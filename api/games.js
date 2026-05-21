import { getFileContent, createOrUpdateFile, getFileSha } from '../lib/github-api.js';

const DATA_PATH = 'data/games.json';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Read from GitHub (shared data source)
      const content = await getFileContent(DATA_PATH);
      
      if (content) {
        const data = JSON.parse(content);
        // Include current SHA for conflict detection
        const sha = await getFileSha(DATA_PATH);
        data._version = sha;
        data._timestamp = new Date().toISOString();
        res.json(data);
      } else {
        res.json({ 
          games: [], 
          metadata: { version: '1.0', last_updated: '' },
          _version: null,
          _timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to read games data from GitHub:', error);
      res.status(500).json({ error: 'Failed to read games data' });
    }
  } else if (req.method === 'PUT') {
    try {
      const gamesData = req.body;
      const clientVersion = req.headers['x-if-version'] || req.body._version;
      
      // Check for conflicts by comparing GitHub file SHA
      const currentVersion = await getFileSha(DATA_PATH);
      
      if (clientVersion && currentVersion && clientVersion !== currentVersion) {
        // Conflict detected - someone else modified the file
        const currentContent = await getFileContent(DATA_PATH);
        const currentData = currentContent ? JSON.parse(currentContent) : null;
        
        return res.status(409).json({
          success: false,
          error: 'CONFLICT',
          message: 'The data was modified by another user. Please refresh and try again.',
          clientVersion: clientVersion,
          serverVersion: currentVersion,
          currentData: currentData
        });
      }
      
      // Update metadata
      if (!gamesData.metadata) {
        gamesData.metadata = { version: '1.0', last_updated: '' };
      }
      gamesData.metadata.last_updated = new Date().toISOString();
      
      // Remove internal fields before saving
      const { _version, _timestamp, ...dataToSave } = gamesData;
      
      // Convert to JSON string
      const content = JSON.stringify(dataToSave, null, 2);
      
      // Create commit message
      const activeCount = (gamesData.games || []).filter(g => g.active !== false).length;
      const message = `Update games data (${activeCount} active games)`;
      
      // Update file in GitHub (shared data source)
      const result = await createOrUpdateFile(DATA_PATH, content, message);
      
      res.json({
        success: true,
        synced: activeCount,
        files: ['data/games.json'],
        version: result.sha,
        message: 'Saved to GitHub - Live site updated instantly'
      });
    } catch (error) {
      console.error('Failed to save games data to GitHub:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
