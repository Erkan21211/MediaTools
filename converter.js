const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.post('/convert', async (req, res) => {
  const { url, format } = req.body;

  const safeFormat = format === 'mp3' ? 'mp3' : 'mp4';

  // Create a unique filename (timestamp + random)
  const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 10000);
  const outputFileName = `video-${uniqueId}.${safeFormat}`;
  const outputPath = path.join(__dirname, 'downloads', outputFileName);

  const options = {
    output: outputPath,
    ffmpegLocation: ffmpegInstaller.path,
  };

  if (safeFormat === 'mp3') {
    Object.assign(options, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0,
    });
  } else {
    Object.assign(options, {
      format: 'bestvideo+bestaudio',
      // No postprocessorArgs or mergeOutputFormat to avoid errors
    });
  }

  try {
    await youtubedl(url, options);

    if (!fs.existsSync(outputPath)) {
      return res.send('File not found after conversion.');
    }

    const fileUrl = `/downloads/${encodeURIComponent(outputFileName)}`;

    res.send(`<p>Done! <a href="${fileUrl}" download>Click here to download your ${safeFormat.toUpperCase()}</a></p>`);
  } catch (err) {
    console.error(err);
    res.send('Error during conversion: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
