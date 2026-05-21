export default function handler(req, res) {
  res.json({
    cms: true,
    backend: 'GitHub API (Shared Data Source)',
    repo: 'CODELOOT',
    writes: ['data/games.json'],
    deployment: 'Vercel (automatic)',
    autosync: 'TRUE - Live updates to production',
  });
}
