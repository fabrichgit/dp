import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import deploymentRoutes from './routes/deploymentRoutes';
import { injectHeaderScript } from './middleware/injectScript';
import fs from 'fs';
import dotenv from 'dotenv';
import { protectRoute } from './middleware/protected';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', "login.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));
express.static(path.join(__dirname, "../uploads"))

app.use("*", injectHeaderScript);

app.get('/~/:id*', (_req, res) => {
  const sub = _req.originalUrl.replace("/~", "")
  
  const basePath = path.join(__dirname, '../uploads', sub);
  
  if(sub.split("/").length !== 2){
    res.sendFile(basePath)
    return
  }
  
  // Lire les fichiers et dossiers dans le chemin
  fs.readdir(basePath, { withFileTypes: true }, (err, files) => {
      if (err) {
          res.status(404).send('Chemin introuvable');
          return;
      }

      // Trouver le premier dossier
      const firstDirectory = files.find(file => file.isDirectory());
      if (!firstDirectory) {
          res.status(404).send('Aucun dossier trouvé');
          return;
      }

      const folderPath = path.join(basePath, firstDirectory.name);
      
      res.sendFile(folderPath+"/");
  });
});

// Routes
app.use('/api/deployments', deploymentRoutes);

// Main page
app.get('/app', protectRoute, (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  const redr = req.headers["referer"]?.split("/")
  const originalUrl = req.originalUrl
  if(!redr || !originalUrl){
    res.redirect(originalUrl+"/")
    return
  }

  const sub = redr.join("").replace("/~", "")
  
  const basePath = path.join(__dirname, '../uploads', redr?.at(4)!);

  // Lire les fichiers et dossiers dans le chemin
  fs.readdir(basePath, { withFileTypes: true }, (err, files) => {
      if (err) {
          res.status(404).send('Chemin introuvable');
          return;
      }

      // Trouver le premier dossier
      const firstDirectory = files.find(file => file.isDirectory());
      if (!firstDirectory) {
          res.status(404).send('Aucun dossier trouvé');
          return;
      }

      const folderPath = path.join(basePath, firstDirectory.name);
      // res.send({redr, originalUrl, folderPath})
      const final = `/${redr?.at(3)}/${redr?.at(4)}/${folderPath.split("/").reverse().at(0)}${originalUrl}`
      res.redirect(final)
      // res.sendFile(folderPath+"/");
  });

  // res.send({redr, originalUrl})
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});