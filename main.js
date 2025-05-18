const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

const ffmpegPath = app.isPackaged
  ? path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe')
  : path.join(__dirname, 'binaries', 'ffmpeg.exe');

const youtubedlPath = app.isPackaged
  ? path.join(process.resourcesPath, 'yt-dlp.exe')
  : path.join(__dirname, 'binaries', 'yt-dlp.exe');

ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

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

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Webview Log] ${message}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('convert-video', async (event, url, format, folderPath) => {
  console.log(`[DEBUG] URL ontvangen: ${url}`);
  console.log(`[DEBUG] Formaat: ${format}`);
  console.log(`[DEBUG] Folderpad: ${folderPath}`);

  const safeFormat = format === 'mp3' ? 'mp3' : 'mp4';
  const outputPath = folderPath || path.join(os.homedir(), 'Downloads');
  const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');

  const ytdlpArgs = [
    url,
    '--output', outputTemplate,
    '--ffmpeg-location', ffmpegPath
  ];

  if (safeFormat === 'mp3') {
    ytdlpArgs.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    ytdlpArgs.push('--format', 'bestvideo+bestaudio', '--recode-video', 'mp4');
  }

  console.log('[DEBUG] yt-dlp.exe path:', youtubedlPath);
  console.log('[DEBUG] yt-dlp.exe exists:', fs.existsSync(youtubedlPath));
  console.log('[DEBUG] yt-dlp args:', ytdlpArgs);

  return new Promise((resolve) => {
    execFile(youtubedlPath, ytdlpArgs, (error, stdout, stderr) => {
      if (error) {
        console.error('[ERROR] Conversiefout:', error, stderr);
        resolve({ success: false, error: stderr || error.message || String(error) });
      } else {
        console.log('[DEBUG] yt-dlp uitvoer:', stdout);
        // Je kunt hier eventueel het echte bestandspad uit stdout halen
        const filePath = outputTemplate.replace('%(title)s', 'output').replace('%(ext)s', safeFormat);
        console.log('[DEBUG] Bestand opgeslagen op:', filePath);
        resolve({ success: true, filePath });
      }
    });
  });
});
