import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import deploymentRoutes from './routes/deploymentRoutes';
import { injectHeaderScript } from './middleware/injectScript';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  createParentPath: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));
// Serve deployed sites
express.static(path.join(__dirname, '../uploads'))
app.use('*', injectHeaderScript);
app.get('/_/:id*', (_req, res) => {
  const sub = _req.originalUrl.replace("/_", "")
  res.sendFile(path.join(__dirname, '../uploads', sub));
});

// Routes
app.use('/api/deployments', deploymentRoutes);

// Main page
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  const redr = req.headers["referer"]?.split("/")
  const originalUrl = req.originalUrl
  if(!redr || !originalUrl){
    res.redirect(originalUrl+"/")
    return
  }
  res.redirect(`/${redr?.at(3)}/${redr?.at(4)}/${originalUrl}`)
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});