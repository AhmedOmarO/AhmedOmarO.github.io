document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const blogListEl = document.getElementById('blog-list');
    const blogContentEl = document.getElementById('blog-content');
    const yearEl = document.getElementById('year');

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.dataset.tab;
            switchTab(target);
        });
    });

    function switchTab(targetId) {
        tabLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === targetId);
        });

        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === targetId);
        });

        const activePanel = document.getElementById(targetId);
        if (activePanel) {
            activePanel.focus();
        }
    }

    async function loadPosts() {
        try {
            const response = await fetch('blogs/posts.json');
            if (!response.ok) {
                throw new Error(`Unable to load posts (${response.status})`);
            }
            const posts = await response.json();
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderPostList(posts);
        } catch (error) {
            blogListEl.innerHTML = '<li>Unable to load posts right now.</li>';
            blogContentEl.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    function renderPostList(posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
            blogListEl.innerHTML = '<li>No posts published yet.</li>';
            return;
        }

        blogListEl.innerHTML = '';

        posts.forEach(post => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.file = post.file;
            button.dataset.title = post.title;
            button.dataset.date = post.date;
            button.innerHTML = `
                <span class="title">${post.title}</span>
                <span class="meta">${post.date}</span>
            `;

            button.addEventListener('click', () => loadPost(post));
            item.appendChild(button);
            blogListEl.appendChild(item);
        });
    }

    async function loadPost(post) {
        const { file, title, date } = post;
        blogContentEl.innerHTML = '<p>Loading…</p>';

        try {
            const response = await fetch(`blogs/${file}`);
            if (!response.ok) {
                throw new Error('Unable to load this post.');
            }
            const rawContent = await response.text();
            const extension = file.split('.').pop().toLowerCase();
            const content = extension === 'md'
                ? convertMarkdownToHtml(rawContent)
                : rawContent;

            blogContentEl.innerHTML = `
                <header class="post-header">
                    <h2>${title}</h2>
                    <p class="meta">${date}</p>
                </header>
                <hr />
                <div class="post-body">${content}</div>
            `;
        } catch (error) {
            blogContentEl.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    function convertMarkdownToHtml(markdown) {
        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();

            if (trimmed.startsWith('### ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h3>${parseInline(trimmed.slice(4))}</h3>`;
            } else if (trimmed.startsWith('## ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h2>${parseInline(trimmed.slice(3))}</h2>`;
            } else if (trimmed.startsWith('# ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h1>${parseInline(trimmed.slice(2))}</h1>`;
            } else if (trimmed.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${parseInline(trimmed.slice(2))}</li>`;
            } else if (trimmed === '') {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<p>${parseInline(trimmed)}</p>`;
            }
        });

        if (inList) {
            html += '</ul>';
        }

        return html;
    }

    function parseInline(text) {
        return text
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    loadPosts();
});
