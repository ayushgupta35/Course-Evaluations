chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeData') {
      (async () => {
        try {
          const course = message.course;
          const professor = message.professor;
  
          // Determine the TOC URL based on the first letter of the course
          const firstLetter = course.charAt(0).toLowerCase();
          const tocUrl = `https://www.washington.edu/cec/${firstLetter}-toc.html`;
  
          console.log(`Fetching TOC page: ${tocUrl}`);
  
          // Fetch the TOC page
          const tocResponse = await fetch(tocUrl, { credentials: 'include' });
          const tocText = await tocResponse.text();
  
          // Parse the TOC page to find the course link
          const parser = new DOMParser();
          const tocDoc = parser.parseFromString(tocText, 'text/html');
  
          const links = tocDoc.querySelectorAll('a');
          let courseLink = null;
  
          for (let link of links) {
            const linkText = link.textContent.replace(/\s+/g, ' ').trim();
            if (linkText.includes(course) && linkText.includes(professor)) {
              courseLink = link.getAttribute('href');
              break;
            }
          }
  
          if (!courseLink) {
            sendResponse({ error: 'Course with specified professor not found.' });
            return;
          }
  
          const courseUrl = new URL(courseLink, tocUrl).href;
          console.log(`Fetching course page: ${courseUrl}`);
  
          // Fetch the course page
          const courseResponse = await fetch(courseUrl, { credentials: 'include' });
          const courseText = await courseResponse.text();
  
          // Parse the course page to extract desired data
          const courseDoc = parser.parseFromString(courseText, 'text/html');
  
          const desiredQuestions = [
            "The course as a whole:",
            "The course content:",
            "Instructor's contribution:",
            "Instructor's effectiveness:",
          ];
  
          const rows = courseDoc.querySelectorAll('tbody tr');
          let results = '';
  
          for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const question = cells[0].textContent.trim();
              const median = cells[cells.length - 1].textContent.trim();
              if (desiredQuestions.includes(question)) {
                results += `${question} Median: ${median}\n`;
              }
            }
          }
  
          if (results) {
            sendResponse({ result: results });
          } else {
            sendResponse({ error: 'Desired data not found in course page.' });
          }
        } catch (error) {
          console.error('Error in content script:', error);
          sendResponse({ error: error.message });
        }
      })();
  
      // Return true to indicate that we will send a response asynchronously
      return true;
    }
  });  