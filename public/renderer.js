const form = document.getElementById('convert-form');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = document.getElementById('url').value;
  const format = document.getElementById('format').value;

  resultDiv.innerHTML = 'Bezig met converteren...';

  try {
    const response = await window.electronAPI.convertVideo(url, format);

    if (response.success) {
      const fileName = response.filePath.split('\\').pop().split('/').pop(); // cross-platform
      resultDiv.innerHTML = `
        ✅ Succes! Bestand opgeslagen als: <b>${fileName}</b><br>
        Je kunt het vinden in de "downloads" map van deze app.
      `;
    } else {
      resultDiv.innerHTML = `❌ Fout: ${response.error}`;
    }
  } catch (err) {
    resultDiv.innerHTML = `❌ Onverwachte fout: ${err.message}`;
  }
});
