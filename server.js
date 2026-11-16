import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});