function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatInline(text) {
    let result = escapeHtml(text);
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
        const safeAlt = alt.replace(/"/g, '&quot;');
        const safeSrc = src.replace(/"/g, '&quot;');
        return `<img src="${safeSrc}" alt="${safeAlt}" loading="lazy">`;
    });
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/(^|[\s.,;:!?()[\]{}'"-])_(.+?)_(?=$|[\s.,;:!?()[\]{}'"-])/g, (_match, lead, content) => {
        return `${lead}<em>${content}</em>`;
    });
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return result;
}

function isTableDivider(line) {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseTableRow(line) {
    const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map((cell) => formatInline(cell.trim()));
}

function isHtmlBlockStart(line) {
    return /^<([a-zA-Z][\w-]*)(\s|>)/.test(line.trim());
}

function markdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (!trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const level = Math.min(6, headingMatch[1].length);
            html += `<h${level}>${formatInline(headingMatch[2])}</h${level}>`;
            continue;
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const content = trimmed.replace(/^[-*+]\s+/, '');
            html += `<li>${formatInline(content)}</li>`;
            continue;
        }

        if (isHtmlBlockStart(trimmed)) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            const blockLines = [];
            let j = i;
            while (j < lines.length) {
                const current = lines[j];
                blockLines.push(current);
                j++;
                if (!current.trim()) {
                    break;
                }
            }
            i = j - 1;
            html += blockLines.join('\n');
            continue;
        }

        const looksLikeTable = trimmed.startsWith('|') && trimmed.includes('|');
        if (looksLikeTable) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            const tableLines = [];
            let j = i;
            while (j < lines.length) {
                const candidateRaw = lines[j];
                const candidate = candidateRaw.trim();

                if (!candidate) {
                    j++;
                    continue;
                }

                if (!candidate.startsWith('|') || !candidate.includes('|')) {
                    break;
                }

                tableLines.push(candidate);
                j++;
            }

            if (!tableLines.length) {
                html += `<p>${formatInline(trimmed)}</p>`;
                continue;
            }

            i = j - 1;

            if (tableLines.length) {
                let tableHtml = '<table>';
                let bodyStartIndex = 0;
                const hasHeader = tableLines.length > 1 && isTableDivider(tableLines[1]);

                if (hasHeader) {
                    const headerCells = parseTableRow(tableLines[0]);
                    tableHtml += '<thead><tr>';
                    headerCells.forEach((cell) => {
                        tableHtml += `<th>${cell}</th>`;
                    });
                    tableHtml += '</tr></thead>';
                    bodyStartIndex = 2;
                }

                tableHtml += '<tbody>';
                for (let rowIndex = bodyStartIndex; rowIndex < tableLines.length; rowIndex++) {
                    if (hasHeader && rowIndex === 1) {
                        continue;
                    }
                    const cells = parseTableRow(tableLines[rowIndex]);
                    tableHtml += '<tr>';
                    cells.forEach((cell) => {
                        tableHtml += `<td>${cell}</td>`;
                    });
                    tableHtml += '</tr>';
                }
                tableHtml += '</tbody></table>';
                html += tableHtml;
            }

            continue;
        }

        if (inList) {
            html += '</ul>';
            inList = false;
        }

        html += `<p>${formatInline(trimmed)}</p>`;
    }

    if (inList) {
        html += '</ul>';
    }

    return html;
}

async function fetchPosts() {
    const response = await fetch('posts.json');
    if (!response.ok) {
        throw new Error('Unable to fetch posts.');
    }
    return response.json();
}

function normaliseFilePath(file) {
    if (typeof file !== 'string') {
        return '';
    }
    if (file.includes('..')) {
        return '';
    }
    return file.trim();
}

async function loadBlogIndex() {
    const listElement = document.getElementById('post-list');
    if (!listElement) {
        return;
    }

    try {
        const posts = await fetchPosts();
        listElement.innerHTML = '';

        if (!Array.isArray(posts) || posts.length === 0) {
            listElement.classList.add('empty');
            listElement.innerHTML = '<li>No posts yet. Add an entry to <code>blogs/posts.json</code> to publish one.</li>';
            return;
        }

        posts.forEach((post) => {
            const safeFile = normaliseFilePath(post.file);
            if (!safeFile) {
                return;
            }

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `post.html?file=${encodeURIComponent(safeFile)}`;
            link.textContent = post.title || safeFile;
            listItem.appendChild(link);

            if (post.date) {
                const date = document.createElement('span');
                date.className = 'post-date';
                date.textContent = ` — ${post.date}`;
                listItem.appendChild(date);
            }

            listElement.appendChild(listItem);
        });
    } catch (error) {
        listElement.classList.add('empty');
        listElement.innerHTML = '<li>Unable to load posts right now.</li>';
        console.error(error);
    }
}

async function loadBlogPost() {
    const articleElement = document.getElementById('post-content');
    if (!articleElement) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get('file');
    const safeFile = normaliseFilePath(fileParam);

    if (!safeFile) {
        articleElement.innerHTML = '<p>Choose a story from the <a href="./">blog index</a>.</p>';
        return;
    }

    try {
        const [posts, fileResponse] = await Promise.all([
            fetchPosts().catch(() => []),
            fetch(safeFile)
        ]);

        if (!fileResponse.ok) {
            throw new Error(`Unable to load ${safeFile}`);
        }

        const text = await fileResponse.text();
        const metadata = Array.isArray(posts) ? posts.find((post) => normaliseFilePath(post.file) === safeFile) : null;

        let articleHtml = '';
        if (metadata) {
            articleHtml += `<h1>${escapeHtml(metadata.title || safeFile)}</h1>`;
            if (metadata.date) {
                articleHtml += `<p class="blog-meta">${escapeHtml(metadata.date)}</p>`;
            }
        }

        if (safeFile.endsWith('.md')) {
            articleHtml += markdownToHtml(text);
        } else {
            articleHtml += text;
        }

        articleElement.innerHTML = articleHtml;
    } catch (error) {
        articleElement.innerHTML = '<p>Sorry, that post could not be loaded.</p>';
        console.error(error);
    }
}

async function loadAboutSection() {
    const aboutContainer = document.getElementById('about-body');
    if (!aboutContainer) {
        return;
    }

    const source = aboutContainer.dataset.source || 'content/about.md';
    const resolvedUrl = source.startsWith('http')
        ? source
        : new URL(source, window.location.href).toString();

    try {
        const response = await fetch(resolvedUrl);
        if (!response.ok) {
            throw new Error('Unable to fetch about content.');
        }
        const markdown = await response.text();
        aboutContainer.innerHTML = markdownToHtml(markdown);
    } catch (error) {
        aboutContainer.innerHTML = '<p>Unable to load the about section right now.</p>';
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    loadBlogIndex();
    loadBlogPost();
    loadAboutSection();
});
