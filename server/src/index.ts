import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the client app
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  // Check if we are in development or production essentially
  // For now, just try to serve index.html if it exists, otherwise send a message
  const indexPath = path.join(__dirname, '../../client/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
        res.status(500).send("Client app not built yet. Please run 'npm run build' in client directory.");
    }
  });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
