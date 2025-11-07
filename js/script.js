function switchTab(targetId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach((tab) => {
        const isActive = tab.id === targetId;
        tab.classList.toggle('active', isActive);
        if (isActive) {
            tab.focus();
        }
    });

    buttons.forEach((button) => {
        const isActive = button.dataset.tab === targetId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatInline(text) {
    let result = escapeHtml(text);
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/_(.+?)_/g, '<em>$1</em>');
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return result;
}

function markdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    let html = '';
    let inList = false;

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            return;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const level = Math.min(6, headingMatch[1].length);
            html += `<h${level}>${formatInline(headingMatch[2])}</h${level}>`;
            return;
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const content = trimmed.replace(/^[-*+]\s+/, '');
            html += `<li>${formatInline(content)}</li>`;
            return;
        }

        if (inList) {
            html += '</ul>';
            inList = false;
        }

        html += `<p>${formatInline(trimmed)}</p>`;
    });

    if (inList) {
        html += '</ul>';
    }

    return html;
}

async function renderPost(post, container, buttons) {
    buttons.forEach((btn) => btn.classList.toggle('active', btn.dataset.file === post.file));
    container.innerHTML = '<p>Loading…</p>';

    try {
        const response = await fetch(`blogs/${post.file}`);
        if (!response.ok) {
            throw new Error(`Unable to load ${post.file}`);
        }
        const text = await response.text();
        const articleTitle = `<h2>${post.title}</h2>`;
        const articleDate = post.date ? `<p class="blog-meta">${post.date}</p>` : '';

        if (post.file.endsWith('.md')) {
            container.innerHTML = `${articleTitle}${articleDate}${markdownToHtml(text)}`;
        } else {
            container.innerHTML = `${articleTitle}${articleDate}${text}`;
        }
    } catch (error) {
        container.innerHTML = `<p>Sorry, we couldn't load that post.</p>`;
        console.error(error);
    }
}

async function initialiseBlog() {
    const listElement = document.getElementById('blog-list');
    const articleElement = document.getElementById('blog-post');

    if (!listElement || !articleElement) {
        return;
    }

    try {
        const response = await fetch('blogs/posts.json');
        if (!response.ok) {
            throw new Error('Unable to fetch posts.');
        }
        const posts = await response.json();
        listElement.innerHTML = '';

        if (!Array.isArray(posts) || posts.length === 0) {
            listElement.innerHTML = '<li>No posts yet. Create a Markdown (.md) or HTML (.html) file inside the blogs folder and list it in posts.json.</li>';
            return;
        }

        const buttons = [];
        posts.forEach((post) => {
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.file = post.file;
            button.textContent = post.title;
            button.addEventListener('click', () => renderPost(post, articleElement, buttons));
            listItem.appendChild(button);
            listElement.appendChild(listItem);
            buttons.push(button);
        });

        renderPost(posts[0], articleElement, buttons);
    } catch (error) {
        listElement.innerHTML = '<li>Unable to load the post list right now.</li>';
        console.error(error);
    }
}

function initialiseTabs() {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    initialiseTabs();
    initialiseBlog();
});
