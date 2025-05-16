const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

// App ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit on all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler voor YouTube conversie
ipcMain.handle('convert-video', async (event, url, format) => {
  const safeFormat = format === 'mp3' ? 'mp3' : 'mp4';
  const outputPath = path.join(__dirname, 'downloads');
  const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');

  const options = {
    output: outputTemplate,
    ffmpegLocation: ffmpegInstaller.path,
  };

  if (safeFormat === 'mp3') {
    Object.assign(options, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0
    });
  } else {
    Object.assign(options, {
      format: 'bestvideo+bestaudio'
    });
  }

  try {
    const result = await youtubedl(url, options);
    const stdout = result.stdout || result._stdout || '';
    const match = stdout.match(/Destination: (.+)/);
    const filePath = match ? match[1].trim() : null;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File not found after conversion.');
    }

    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
