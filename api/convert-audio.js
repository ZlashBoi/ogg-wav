const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { IncomingForm } = require('formidable');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'Error parsing form data' });
        return;
      }

      const audioFile = files.audio[0];
      const inputPath = audioFile.filepath;
      const outputPath = path.join('/tmp', `${Date.now()}.wav`);

      ffmpeg.setFfmpegPath(ffmpegPath);

      // Convert OGG to WAV
      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', () => {
          // Send back the converted WAV file URL or data
          res.status(200).json({ wav_url: outputPath });
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err);
          res.status(500).json({ error: 'Conversion failed' });
        })
        .run();
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
