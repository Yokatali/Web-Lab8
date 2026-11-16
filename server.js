import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

const COURSES = [
  { id: 1, title: 'Web Programming', credits: 6 },
  { id: 2, title: 'Operating Systems', credits: 6 },
  { id: 3, title: 'Data Structures', credits: 5 },
  { id: 4, title: 'Database Systems', credits: 5 },
];

let requestsServed = 0;

function requestLogger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}

function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(requestLogger);
app.use(requestCounter);

app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Yusuf's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /api/\n');
});

app.get('/old-page', (req, res) => {
  res.redirect('/hello');
});

app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    userAgent: req.get('User-Agent'),
    accept: req.get('Accept'),
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed });
});

app.use((req, res) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(404).send('<h1>404</h1><p>Sorry, this page was not found.</p>');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});