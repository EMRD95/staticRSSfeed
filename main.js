const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
const jsonConfigUrl = 'config.json';
const maxDescriptionLength = 800;

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sanitizeHTML(htmlString) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;

  // Get the text content of the HTML string
  let textContent = tempElement.textContent || tempElement.innerText || '';

  // Remove all tags
  textContent = textContent.replace(/Tags: \w+/g, '');

  // Remove all categories
  textContent = textContent.replace(/Categories: \w+/g, '');

  return textContent;
}


function truncateDescription(description) {
  if (description.length > maxDescriptionLength) {
    return description.slice(0, maxDescriptionLength) + '...';
  }
  return description;
}

function fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords) {
  const promises = feedUrls.map(url => fetch(apiUrl + encodeURIComponent(url)).then(response => response.json()));

  Promise.all(promises)
    .then(results => {
      const articles = results.flatMap(result => result.items);
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      const filteredArticles = articles.filter(article => {
        const description = sanitizeHTML(article.description).replace(/<.*?>/g, '').toLowerCase();

        // All keywords must be included in the article
        const allKeywordsIncluded = allKeywords.every(keyword => description.includes(keyword));

        // At least one keyword must be included in the article
        const someKeywordsIncluded = someKeywords.some(keyword => description.includes(keyword));

        // None of the keywords in this list should be included in the article
        const noKeywordsIncluded = noKeywords.some(keyword => description.includes(keyword));

        return allKeywordsIncluded && someKeywordsIncluded && !noKeywordsIncluded;
      });

      const articlesContainer = document.getElementById('articles');
      articlesContainer.innerHTML = '';

      filteredArticles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('article');

        const titleElement = document.createElement('h2');
        titleElement.textContent = article.title;

        const sourceElement = document.createElement('p');
        sourceElement.textContent = `Source: ${article.author || article.creator}`;

        const dateElement = document.createElement('p');
        dateElement.textContent = formatDate(article.pubDate);

        const descriptionElement = document.createElement('p');
        const sanitizedDescription = sanitizeHTML(article.description).replace(/<.*?>/g, '');
        descriptionElement.textContent = truncateDescription(sanitizedDescription);

        const linkElement = document.createElement('a');
        linkElement.href = article.link;
        linkElement.textContent = 'Read More';

        articleElement.appendChild(titleElement);
        articleElement.appendChild(sourceElement);
        articleElement.appendChild(dateElement);
        articleElement.appendChild(descriptionElement);
        articleElement.appendChild(linkElement);

        articlesContainer.appendChild(articleElement);
      });
    })
    .catch(error => console.error(error));
}




function loadConfig() {
  fetch(jsonConfigUrl)
    .then(response => response.json())
    .then(data => {
      const feedUrls = data.feedUrls;
      const allKeywords = data.allKeywords || [];
      const someKeywords = data.someKeywords || [];
      const noKeywords = data.noKeywords || [];
      fetchArticles(feedUrls, allKeywords, someKeywords, noKeywords);
    })
    .catch(error => console.error(error));
}


loadConfig();
