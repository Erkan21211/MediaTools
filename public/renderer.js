const form = document.getElementById('convert-form');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = document.getElementById('url').value;
  const format = document.getElementById('format').value;

  console.log('[DEBUG] Formulier verzonden');
  console.log('[DEBUG] URL:', url);
  console.log('[DEBUG] Formaat:', format);

  resultDiv.innerHTML = '⏳ Bezig met converteren...';

  try {
    const response = await window.electronAPI.convertVideo(url, format);

    console.log('[DEBUG] IPC response:', response);

    if (response.success) {
      const fileName = response.filePath.split(/[/\\]/).pop(); // cross-platform
      resultDiv.innerHTML = `
        ✅ Succes! Bestand opgeslagen als: <b>${fileName}</b><br>
        Je kunt het vinden in de geselecteerde map of standaard 'Downloads'.
      `;
    } else {
      console.error('[ERROR] Conversiefout:', response.error);
      resultDiv.innerHTML = `❌ Fout tijdens conversie: ${response.error || 'Onbekende fout'}`;
    }
  } catch (err) {
    console.error('[ERROR] Onverwachte fout:', err);
    resultDiv.innerHTML = `❌ Onverwachte fout: ${err.message || err}`;
  }
});
``
