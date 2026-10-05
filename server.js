import express from 'express';
import multer from 'multer';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

import { ingest } from 'evaa-engine';

const app = express();
const upload = multer({
  dest: path.join(os.tmpdir(), 'evaa-uploads')
});

const PORT = 3008;

app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    service: 'evaa-api',
    engine: 'connected'
  });
});

app.post('/api/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`Received: ${req.file.originalname}`);

    const outputDir = path.join(
      os.tmpdir(),
      'evaa-output',
      Date.now().toString()
    );

    await fs.mkdir(outputDir, { recursive: true });

    // API → EVAA Engine
    const result = await ingest(
      req.file.path,
      outputDir
    );

    res.json({
      success: true,
      file: req.file.originalname,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`EVAA API running at http://localhost:${PORT}`);
  console.log(`Ingest endpoint: POST http://localhost:${PORT}/api/ingest`);
});