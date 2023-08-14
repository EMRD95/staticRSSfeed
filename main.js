const apiKey = 'ftukbsji3qqrpl4nwiftgmsh7c2inufrg1fabpi1';
const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=&api_key=${apiKey}`;
const jsonConfigUrl = 'config.json';
const maxDescriptionLength = 800;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  // Replace &amp; with & to handle &amp;#039;
  const textWithAmpersand = text.replace(/&amp;/g, '&');
  textArea.innerHTML = textWithAmpersand;
  return textArea.value;
}

function parseGoogleUrl(url) {
  if (url.includes('www.google.com/url')) {
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('url');
  }
  return url;
}

function sanitizeHTML(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = decodeHtmlEntities(htmlString);

  let textContent = tempElement.textContent || tempElement.innerText || '';
  textContent = textContent.replace(/(Tags:|Categories:)\s*\w+(\s*(Tags:|Categories:)\s*\w+)*/g, '');
  textContent = textContent.replace(/#(\w+)/g, '$1');
  textContent = textContent.replace(/#\w+/g, '');
  textContent = textContent.replace('Source: thehackernews.com – Author: .', '');
  
  // Remove URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  textContent = textContent.replace(urlRegex, '');

  return textContent;
}

function extractThumbnailFromDescription(description) {
  const imgTagRegex = /<img.*?src="(.*?)".*?>/i;
  const wpImageDivRegex = /<div class="wp-block-image">.*?<img.*?src="(.*?)".*?>.*?<\/div>/is;

  let match = description.match(imgTagRegex);
  if (match) {
    return match[1].replace('http://', 'https://'); // Update the protocol to HTTPS
  }

  match = description.match(wpImageDivRegex);
  if (match) {
    return match[1].replace('http://', 'https://'); // Update the protocol to HTTPS
  }

  return '';
}

function truncateDescription(description) {
  if (description.length > maxDescriptionLength) {
    return decodeHtmlEntities(description.slice(0, maxDescriptionLength)) + '...';
  }
  return decodeHtmlEntities(description);
}


function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {

function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
    allKeywords = allKeywords.map(keyword => keyword.toLowerCase());
    someKeywords = someKeywords.map(keyword => keyword.toLowerCase());
    noKeywords = noKeywords.map(keyword => keyword.toLowerCase());

    const promises = feedUrls.map((url, index) => {
        const encodedUrl = encodeURIComponent(url);
        const feedApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}&api_key=${apiKey}`;
        return fetch(feedApiUrl).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = `${(index + 1) / feedUrls.length * 100}%`;
            return response.json();
        });
    });

    Promise.allSettled(promises)
        .then(results => {
            let articles = results.flatMap(result =>
                result.status === 'fulfilled' ? result.value.items : []
            );
            articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            articles = articles.map(article => {
                article.link = parseGoogleUrl(article.link);
                article.faviconUrl = `https://www.google.com/s2/favicons?domain=${article.link}`;
                return article;
            });

            const filteredArticles = articles.filter(article => {
                const title = sanitizeHTML(article.title).replace(/<.*?>/g, '').toLowerCase();
                const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

                const allKeywordsIncluded = allKeywords.every(keyword => title.includes(keyword) || description.includes(keyword));
                const someKeywordsIncluded = someKeywords.length > 0 ? someKeywords.some(keyword => title.includes(keyword) || description.includes(keyword)) : true;
                const noKeywordsIncluded = noKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

                return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
            });

            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = '100%';
            displayArticles(filteredArticles);
        })
        .catch(error => console.error(error));
}



// Load keywords from config.json and populate input fields
async function loadKeywordsFromConfig() {
    try {
        const response = await fetch(jsonConfigUrl);
        const configData = await response.json();

        // Populate input fields
        document.getElementById('allKeywords').value = configData.allKeywords.join(', ');
        document.getElementById('someKeywords').value = configData.someKeywords.join(', ');
        document.getElementById('noKeywords').value = configData.noKeywords.join(', ');

        // Load any saved changes from local storage
        loadChangesFromLocalStorage();
    } catch (error) {
        console.error('Failed to load keywords from config.json:', error);
    }
}

// Load saved changes from local storage and populate input fields
function loadChangesFromLocalStorage() {
    const allKeywords = localStorage.getItem('allKeywords');
    const someKeywords = localStorage.getItem('someKeywords');
    const noKeywords = localStorage.getItem('noKeywords');

    if (allKeywords) {
        document.getElementById('allKeywords').value = allKeywords;
    }
    if (someKeywords) {
        document.getElementById('someKeywords').value = someKeywords;
    }
    if (noKeywords) {
        document.getElementById('noKeywords').value = noKeywords;
    }
}

// Event listener for the "Apply" button
document.getElementById('applyChanges').addEventListener('click', () => {
    // Save changes to local storage
    localStorage.setItem('allKeywords', document.getElementById('allKeywords').value);
    localStorage.setItem('someKeywords', document.getElementById('someKeywords').value);
    localStorage.setItem('noKeywords', document.getElementById('noKeywords').value);

    // Apply filtering logic to articles based on input fields (this functionality needs further integration)
    // TODO: Implement article filtering logic
});

// Event listener for the "Reset" button
document.getElementById('resetChanges').addEventListener('click', () => {
    // Clear local storage
    localStorage.removeItem('allKeywords');
    localStorage.removeItem('someKeywords');
    localStorage.removeItem('noKeywords');

    // Revert to the default state by reloading keywords from config.json
    loadKeywordsFromConfig();
});

// Invoke the function to load keywords from config.json upon page load
loadKeywordsFromConfig();

