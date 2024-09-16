document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scrapeButton').addEventListener('click', () => {
    const course = document.getElementById('courseInput').value.trim();
    const professor = document.getElementById('professorInput').value.trim();

    if (course && professor) {
      // Send a message to the background script
      chrome.runtime.sendMessage({ action: 'startScrape', course, professor }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById('output').innerText = `Error: ${chrome.runtime.lastError.message}`;
        } else if (response.error) {
          document.getElementById('output').innerText = `Error: ${response.error}`;
        } else {
          document.getElementById('output').innerText = response.result;
        }
      });
    } else {
      document.getElementById('output').innerText = 'Please enter both course and professor name.';
    }
  });
});