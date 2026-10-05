import express from 'express';
import multer from 'multer';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

import { ingest } from 'evaa-engine';

const app = express();

const PORT = 3008;

// --------------------------------------------------
// Local directories
// --------------------------------------------------

const uploadDir = path.join(
  os.tmpdir(),
  'evaa-uploads'
);

const outputBaseDir = path.join(
  os.tmpdir(),
  'evaa-output'
);

await fs.mkdir(uploadDir, {
  recursive: true
});

await fs.mkdir(outputBaseDir, {
  recursive: true
});

// --------------------------------------------------
// Multer configuration
// Preserve original file extension
// --------------------------------------------------

const upload = multer({
  storage: multer.diskStorage({

    destination: uploadDir,

    filename: (req, file, cb) => {

      const extension = path.extname(
        file.originalname
      );

      const filename =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}${extension}`;

      cb(null, filename);
    }

  })
});

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json());

app.use(
  express.static(
    path.join(process.cwd(), 'public')
  )
);

// --------------------------------------------------
// API Status
// --------------------------------------------------

app.get('/api/status', (req, res) => {

  res.json({
    success: true,
    service: 'evaa-api',
    engine: 'connected',
    environment: 'local'
  });

});

// --------------------------------------------------
// Ingest
// --------------------------------------------------

app.post(
  '/api/ingest',
  upload.single('file'),

  async (req, res) => {

    let uploadedFilePath = null;

    try {

      // --------------------------------------------
      // Validate upload
      // --------------------------------------------

      if (!req.file) {

        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });

      }

      uploadedFilePath = req.file.path;

      console.log('');
      console.log('========================================');
      console.log('EVAA INGESTION');
      console.log('========================================');

      console.log(
        `File: ${req.file.originalname}`
      );

      console.log(
        `Size: ${req.file.size} bytes`
      );

      console.log(
        `Temp path: ${req.file.path}`
      );

      // --------------------------------------------
      // Create output directory
      // --------------------------------------------

      const jobId = Date.now().toString();

      const outputDir = path.join(
        outputBaseDir,
        jobId
      );

      await fs.mkdir(outputDir, {
        recursive: true
      });

      console.log(
        `Output directory: ${outputDir}`
      );

      // --------------------------------------------
      // API → EVAA Engine
      // --------------------------------------------

      console.log(
        'Calling EVAA Engine...'
      );

      const result = await ingest(
        uploadedFilePath,
        outputDir
      );

      console.log(
        'EVAA Engine completed'
      );

      // --------------------------------------------
      // Response
      // --------------------------------------------

      return res.json({

        success: true,

        file: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        },

        job: {
          id: jobId,
          status: 'completed'
        },

        result

      });

    } catch (error) {

      console.error('');
      console.error(
        'EVAA ingestion failed:'
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        error: error.message
      });

    } finally {

      // --------------------------------------------
      // Delete temporary uploaded file
      // --------------------------------------------

      if (uploadedFilePath) {

        try {

          await fs.unlink(
            uploadedFilePath
          );

          console.log(
            `Temporary upload removed: ${uploadedFilePath}`
          );

        } catch (cleanupError) {

          console.warn(
            'Could not remove temporary upload:',
            cleanupError.message
          );

        }

      }

      console.log(
        '========================================'
      );

      console.log('');

    }

  }
);

// --------------------------------------------------
// API 404
// --------------------------------------------------

app.use('/api', (req, res) => {

  res.status(404).json({
    success: false,
    error: 'API route not found'
  });

});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {

  console.log('');
  console.log('========================================');
  console.log('        EVAA API - LOCAL DEMO');
  console.log('========================================');

  console.log(
    `Frontend:       http://localhost:${PORT}`
  );

  console.log(
    `Status:         http://localhost:${PORT}/api/status`
  );

  console.log(
    `Ingest:         POST /api/ingest`
  );

  console.log('');

  console.log(
    'Storage:        Local filesystem'
  );

  console.log(
    'Database:       None'
  );

  console.log(
    'Redis:          None'
  );

  console.log(
    'Cloudflare R2:  None'
  );

  console.log('========================================');
  console.log('');

});