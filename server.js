import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

function requestLogger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}

app.use(requestLogger);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});