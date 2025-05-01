const contentDiv = document.getElementById("content");

let firstLoad = true;

async function loadPage(page, addToHistory = true) {
  try {

    if (!firstLoad) {
      contentDiv.style.opacity = 0;
    }

    const response = await fetch(`${page}.html`);
    if (!response.ok) throw new Error('Page not found');

    const html = await response.text();

    setTimeout(() => {
      contentDiv.innerHTML = html;

      if (addToHistory) {
        history.pushState({ page }, '', page === 'home' ? '/' : `/${page}`);
      }

      setActiveNav(page);

      if (page === 'roster') {
        const script = document.createElement('script');
        script.src = 'scripts/roster.js';
        script.onload = () => {
          loadRoster();
        };
        document.body.appendChild(script);
      }

      if (!firstLoad) {
        contentDiv.style.opacity = 1;
      }

      firstLoad = false;

    }, firstLoad ? 0 : 300);

  } catch (error) {
    console.error("Error loading page:", error);
    contentDiv.innerHTML = "<h2>Page Not Found</h2><p>Sorry, we couldn't load that page.</p>";
    contentDiv.style.opacity = 1;
    firstLoad = false;
  }
}

// Highlight the correct nav link
function setActiveNav(page) {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Handle menu link clicks
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const page = event.target.getAttribute('data-page');
    loadPage(page);
  });
});

// Handle back/forward browser buttons
window.addEventListener('popstate', event => {
  const state = event.state;
  if (state && state.page) {
    loadPage(state.page, false);
  } else {
    loadPage('home', false);
  }
});

// Initial load based on URL
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.replace('/', '') || 'home';
  loadPage(path, false);
});