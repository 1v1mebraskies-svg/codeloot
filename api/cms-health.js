export default function handler(req, res) {
  res.json({
    cms: true,
    root: process.cwd(),
    writes: ['data/games.json', 'index.html', 'games/*.html', 'assets/img/*'],
  });
}
