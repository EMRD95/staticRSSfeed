const apiKey = 'ftukbsji3qqrpl4nwiftgmsh7c2inufrg1fabpi1';
const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=&api_key=${apiKey}`;
const jsonConfigUrl = 'config.json';
const keywordsUrl = 'keywords.json';
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

const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');

function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
    progressBar.style.width = '0%';
  
  allKeywords = allKeywords.map(keyword => keyword.toLowerCase());
  someKeywords = someKeywords.map(keyword => keyword.toLowerCase());
  noKeywords = noKeywords.map(keyword => keyword.toLowerCase());

  // If all keyword fields are empty, simulate a space in the "Some Keywords" field
  if (allKeywords.length === 0 && someKeywords.length === 0 && noKeywords.length === 0) {
    someKeywords.push(" ");
  }

  const promises = feedUrls.map((url, index) => {
    const encodedUrl = encodeURIComponent(url);
    const feedApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}&api_key=${apiKey}`;
    return fetch(feedApiUrl).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update progress bar width after each API call
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
        article.link = parseGoogleUrl(article.link); // update the link
        article.faviconUrl = `https://www.google.com/s2/favicons?domain=${article.link}`; // update the faviconUrl
        return article;
      });

      const filteredArticles = articles.filter(article => {
        const title = sanitizeHTML(article.title).replace(/<.*?>/g, '').toLowerCase();
        const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

        const allKeywordsIncluded = allKeywords.every(keyword => title.includes(keyword) || description.includes(keyword));
        const someKeywordsIncluded = someKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
        const noKeywordsIncluded = noKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));

        return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
      });

      const progressBar = document.getElementById('progress-bar');
      progressBar.style.width = '100%'; // Filtering phase is from 50 to 100%
      displayArticles(filteredArticles);
      // Hide the entire progress container after loading is complete
            // Use setTimeout to delay hiding by 1 second
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        })
        .catch(error => {
            console.error(error);
            
            // Use setTimeout to delay hiding by 1 second, even if there's an error
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        });
}

function displayArticles(articles) {
  const articlesContainer = document.getElementById('articles');
  articlesContainer.innerHTML = '';

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    const titleElement = document.createElement('h2');
    const sanitizedTitle = sanitizeHTML(article.title).replace(/<.*?>/g, '');
    titleElement.textContent = decodeHtmlEntities(sanitizedTitle);
	  
    const thumbnailElement = document.createElement('img');
    thumbnailElement.classList.add('thumbnail');
    thumbnailElement.src = article.thumbnail || extractThumbnailFromDescription(article.description);

    const faviconElement = document.createElement('img');
    faviconElement.classList.add('favicon');
    faviconElement.src = article.faviconUrl;

    const sourceElement = document.createElement('p');
    if (article.author || article.creator) {
    sourceElement.textContent = `Source: ${decodeHtmlEntities(article.author) || decodeHtmlEntities(article.creator)}`;
    }

    const dateElement = document.createElement('p');
    dateElement.textContent = formatDate(article.pubDate);

    const descriptionElement = document.createElement('p');
	const sanitizedDescription = sanitizeHTML(article.description).replace(/<.*?>/g, '');
    descriptionElement.textContent = decodeHtmlEntities(truncateDescription(sanitizedDescription));


    const linkElement = document.createElement('a');
    linkElement.href = article.link;
    linkElement.classList.add('article-link');
    linkElement.target = '_blank';
    const url = new URL(article.link);
    linkElement.textContent = url.hostname;

    const factCheckButton = document.createElement('button');
    factCheckButton.textContent = '🤔';
	factCheckButton.classList.add('fact-check'); // Add the new class
    factCheckButton.onclick = () => {
	const query = encodeURIComponent(decodeHtmlEntities(sanitizedTitle));
	window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    articleElement.appendChild(titleElement);
    articleElement.appendChild(thumbnailElement);
    articleElement.appendChild(faviconElement);
    articleElement.appendChild(sourceElement);
    articleElement.appendChild(dateElement);
    articleElement.appendChild(descriptionElement);
    articleElement.appendChild(linkElement);
    articleElement.appendChild(factCheckButton); // Add the fact check button to the article

    articlesContainer.appendChild(articleElement);
    // Update the article counter
    const articleCounter = document.getElementById('article-counter');
    articleCounter.textContent = `Total articles: ${articles.length}`;

  });
}

function getFeedUrls() {
    return fetch(jsonConfigUrl)
        .then(response => response.json());
}

function getKeywordsData() {
    return fetch(keywordsUrl)
        .then(response => response.json());
}

async function getKeywordsFromStorageOrDefault() {
    const keywordsData = await getKeywordsData();
    
    const fromStorage = key => {
        const item = localStorage.getItem(key);
        return item ? item.split(',').map(keyword => {
            keyword = keyword.trim().toLowerCase();
            if (!keyword.startsWith(" ")) keyword = " " + keyword;
            if (!keyword.endsWith(" ")) keyword = keyword + " ";
            return keyword;
        }) : [];
    };

    return {
        allKeywords: fromStorage('allKeywords').length ? fromStorage('allKeywords') : keywordsData.allKeywords,
        someKeywords: fromStorage('someKeywords').length ? fromStorage('someKeywords') : keywordsData.someKeywords,
        noKeywords: fromStorage('noKeywords').length ? fromStorage('noKeywords') : keywordsData.noKeywords,
    };
}

async function loadConfig() {
    const data = await getFeedUrls();
    const { allKeywords, someKeywords, noKeywords } = await getKeywordsFromStorageOrDefault();
    fetchArticles(data.feedUrls, allKeywords, someKeywords, noKeywords);
}

async function loadKeywordsToInputFields() {
    const { allKeywords, someKeywords, noKeywords } = await getKeywordsFromStorageOrDefault();
    document.getElementById('allKeywords').value = allKeywords.join(', ');
    document.getElementById('someKeywords').value = someKeywords.join(', ');
    document.getElementById('noKeywords').value = noKeywords.join(', ');
}

// Event listener for 'applyChanges'
document.getElementById('applyChanges').addEventListener('click', async () => {
	progressContainer.style.display = 'block';
    let allKeywordsValue = document.getElementById('allKeywords').value;
    let someKeywordsValue = document.getElementById('someKeywords').value;
    let noKeywordsValue = document.getElementById('noKeywords').value;
    
    // If all fields are empty, add a space to "Some Keywords"
    if (!allKeywordsValue && !someKeywordsValue && !noKeywordsValue) {
        someKeywordsValue = " ";
    }

    localStorage.setItem('allKeywords', allKeywordsValue);
    localStorage.setItem('someKeywords', someKeywordsValue);
    localStorage.setItem('noKeywords', noKeywordsValue);
    await loadConfig();
});

// Event listener for 'resetChanges'
document.getElementById('resetChanges').addEventListener('click', async () => {
	progressContainer.style.display = 'block';
    localStorage.removeItem('allKeywords');
    localStorage.removeItem('someKeywords');
    localStorage.removeItem('noKeywords');
    await loadKeywordsToInputFields();
    await loadConfig();
});

// Event listener for 'clearChanges'
document.getElementById('clearChanges').addEventListener('click', async () => {
	progressContainer.style.display = 'block';
    document.getElementById('allKeywords').value = "";
    document.getElementById('someKeywords').value = " ";
    document.getElementById('noKeywords').value = "";

    // Save the cleared and updated keywords to localStorage
    localStorage.setItem('allKeywords', "");
    localStorage.setItem('someKeywords', " ");
    localStorage.setItem('noKeywords', "");
    
    await loadConfig();
});

// Load keywords to input fields on page load
(async () => {
    await loadKeywordsToInputFields();
    await loadConfig();
})();


