function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatInline(text, preserveHtml = false) {
    let result = preserveHtml ? text : escapeHtml(text);
    
    // Only process markdown if we're not preserving HTML
    if (!preserveHtml) {
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
    }
    
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
    let inTable = false;
    let inHtmlBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (!trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (inTable) {
                html += '</tbody></table>';
                inTable = false;
            }
            if (!inHtmlBlock) {
                continue;
            }
        }

        // Check for HTML block start/end
        if (isHtmlBlockStart(trimmed)) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (inTable) {
                html += '</tbody></table>';
                inTable = false;
            }
            inHtmlBlock = true;
            html += lines[i]; // Preserve original line formatting
            continue;
        }

        // Check for HTML block end
        if (inHtmlBlock && /<\/[a-zA-Z][\w-]*>/.test(trimmed)) {
            html += lines[i]; // Preserve original line formatting
            inHtmlBlock = false;
            continue;
        }

        // If we're in an HTML block, just pass through the content
        if (inHtmlBlock) {
            html += lines[i]; // Preserve original line formatting
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (inTable) {
                html += '</tbody></table>';
                inTable = false;
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

        if (isTableDivider(trimmed)) {
            if (!inTable) {
                html += '<table><tbody>';
                inTable = true;
            }
            continue;
        }

        if (inTable && trimmed.startsWith('|')) {
            const cells = parseTableRow(trimmed);
            html += '<tr>';
            cells.forEach((cell) => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
            continue;
        }

        if (inList) {
            html += '</ul>';
            inList = false;
        }

        if (inTable) {
            html += '</tbody></table>';
            inTable = false;
        }

        html += `<p>${formatInline(trimmed)}</p>`;
    }

    if (inList) {
        html += '</ul>';
    }

    if (inTable) {
        html += '</tbody></table>';
    }

    return html;
}

// Function to detect Arabic content and apply RTL styling
function detectAndApplyRTL(element) {
    if (!element) return;
    
    // Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    const textContent = element.textContent || element.innerText || '';
    
    console.log('Checking element for Arabic content:', element.className);
    console.log('Text sample:', textContent.substring(0, 100));
    
    // Count Arabic characters vs total characters
    const arabicMatches = textContent.match(/[\u0600-\u06FF\u0750-\u077F]/g);
    const arabicCharCount = arabicMatches ? arabicMatches.length : 0;
    const totalCharCount = textContent.replace(/\s/g, '').length;
    
    console.log('Arabic chars:', arabicCharCount, 'Total chars:', totalCharCount);
    
    // If more than 10% of characters are Arabic, apply RTL styling
    if (totalCharCount > 0 && (arabicCharCount / totalCharCount) > 0.1) {
        console.log('Applying RTL styling...');
        element.classList.add('arabic');
        element.setAttribute('lang', 'ar');
        element.setAttribute('dir', 'rtl');
        
        // Apply to all child elements as well
        const allChildren = element.querySelectorAll('*');
        allChildren.forEach(child => {
            if (child.textContent && /[\u0600-\u06FF\u0750-\u077F]/.test(child.textContent)) {
                child.classList.add('arabic');
                child.setAttribute('dir', 'rtl');
            }
        });
        
        // Also set direction on the parent blog post if this is within one
        const blogPost = element.closest('.blog-post');
        if (blogPost) {
            console.log('Setting RTL on blog post element');
            blogPost.classList.add('arabic');
            blogPost.setAttribute('lang', 'ar');
            blogPost.setAttribute('dir', 'rtl');
        }
        
        // Force immediate style recalculation
        element.style.direction = 'rtl';
        element.style.textAlign = 'justify';
    }
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

    const fallbackHtml = listElement.innerHTML;
    const parentElement = listElement.parentElement;

    try {
        const posts = await fetchPosts();
        if (!Array.isArray(posts) || posts.length === 0) {
            listElement.classList.add('empty');
            listElement.innerHTML = '<li>No posts yet. Add an entry to <code>blogs/posts.json</code> to publish one.</li>';
            const existingError = parentElement?.querySelector('[data-post-error]');
            if (existingError) {
                existingError.remove();
            }
            return;
        }

        const listItems = document.createDocumentFragment();
        let validPosts = 0;

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

            listItems.appendChild(listItem);
            validPosts += 1;
        });

        if (validPosts === 0) {
            listElement.classList.add('empty');
            listElement.innerHTML = '<li>No posts yet. Add an entry to <code>blogs/posts.json</code> to publish one.</li>';
            const existingError = parentElement?.querySelector('[data-post-error]');
            if (existingError) {
                existingError.remove();
            }
            return;
        }

        listElement.classList.remove('empty');
        listElement.innerHTML = '';
        listElement.appendChild(listItems);
        const existingError = parentElement?.querySelector('[data-post-error]');
        if (existingError) {
            existingError.remove();
        }
    } catch (error) {
        listElement.innerHTML = fallbackHtml;
        listElement.classList.remove('empty');
        console.error('Unable to refresh posts:', error);

        if (parentElement && !parentElement.querySelector('[data-post-error]')) {
            const message = document.createElement('p');
            message.className = 'post-error';
            message.dataset.postError = 'true';
            message.textContent = 'Latest posts could not be loaded right now.';
            listElement.insertAdjacentElement('afterend', message);
        }
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
        
        // Check if metadata specifies language as Arabic
        if (metadata && metadata.lang === 'ar') {
            console.log('Metadata indicates Arabic content');
            articleElement.classList.add('arabic');
            articleElement.setAttribute('lang', 'ar');
            articleElement.setAttribute('dir', 'rtl');
            articleElement.style.direction = 'rtl';
            articleElement.style.textAlign = 'justify';
        }
        
        // Auto-detect Arabic content and apply RTL styling
        detectAndApplyRTL(articleElement);
        
        // Setup GIF hover effect for dynamically loaded images
        setupGifHover(articleElement);
        
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

    const fallbackHtml = aboutContainer.innerHTML;
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
        const renderedHtml = markdownToHtml(markdown)
            .replace(/<h1>/g, '<h2>')
            .replace(/<\/h1>/g, '</h2>');
        aboutContainer.innerHTML = renderedHtml;
        
        // Auto-detect Arabic content and apply RTL styling
        detectAndApplyRTL(aboutContainer);
        
    } catch (error) {
        aboutContainer.innerHTML = fallbackHtml;
        console.error('Unable to refresh about section:', error);

        if (!aboutContainer.querySelector('[data-about-error]')) {
            const message = document.createElement('p');
            message.className = 'about-error';
            message.dataset.aboutError = 'true';
            message.textContent = 'Latest about details could not be loaded right now.';
            aboutContainer.appendChild(message);
        }
    }
}

function setupGifHover(container) {
    const root = container || document;
    let images = root.querySelectorAll("img");
    
    images.forEach((img) => {
        if (img.src.endsWith(".gif")) {
            const gifSrc = img.src;
            
            const applyGifPlayer = () => {
                // Capture first frame to canvas
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const firstFrameSrc = canvas.toDataURL('image/png');
                
                // Create wrapper container
                const wrapper = document.createElement('div');
                wrapper.className = 'gif-player';
                wrapper.style.display = 'inline-block';
                wrapper.style.maxWidth = '100%';
                wrapper.style.textAlign = 'center';
                
                // Lock image dimensions
                const originalWidth = img.width;
                img.style.width = originalWidth + 'px';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.cursor = 'zoom-in';
                img.style.transition = 'transform 0.3s ease';
                
                // Create button container
                const btnContainer = document.createElement('div');
                btnContainer.style.cssText = `
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                `;
                
                // Create play button
                const playBtn = document.createElement('button');
                playBtn.className = 'gif-play-btn';
                playBtn.innerHTML = '▶ Play';
                playBtn.setAttribute('aria-label', 'Play GIF');
                playBtn.style.cssText = `
                    padding: 8px 20px;
                    border-radius: 20px;
                    border: none;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                `;
                
                // Create zoom button
                const zoomBtn = document.createElement('button');
                zoomBtn.className = 'gif-zoom-btn';
                zoomBtn.innerHTML = '🔍 Zoom';
                zoomBtn.setAttribute('aria-label', 'Zoom GIF');
                zoomBtn.style.cssText = `
                    padding: 8px 20px;
                    border-radius: 20px;
                    border: none;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                `;
                
                // Button hover effects
                [playBtn, zoomBtn].forEach(btn => {
                    btn.addEventListener('mouseenter', () => {
                        btn.style.background = 'rgba(0, 0, 0, 0.9)';
                        btn.style.transform = 'scale(1.05)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.background = 'rgba(0, 0, 0, 0.7)';
                        btn.style.transform = 'scale(1)';
                    });
                });
                
                let isPlaying = false;
                let isZoomed = false;
                
                playBtn.addEventListener('click', () => {
                    isPlaying = !isPlaying;
                    if (isPlaying) {
                        // Force reload GIF to restart animation
                        img.src = gifSrc + '?t=' + Date.now();
                        playBtn.innerHTML = '⏹ Stop';
                        playBtn.setAttribute('aria-label', 'Stop GIF');
                    } else {
                        img.src = firstFrameSrc;
                        playBtn.innerHTML = '▶ Play';
                        playBtn.setAttribute('aria-label', 'Play GIF');
                    }
                });
                
                // Zoom functionality
                const openZoomModal = () => {
                    const overlay = document.createElement('div');
                    overlay.className = 'gif-zoom-overlay';
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        cursor: zoom-out;
                    `;
                    
                    const zoomedImg = document.createElement('img');
                    zoomedImg.src = img.src;
                    zoomedImg.style.cssText = `
                        max-width: 95%;
                        max-height: 95%;
                        object-fit: contain;
                    `;
                    
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '✕';
                    closeBtn.style.cssText = `
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        border: none;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                        transition: background 0.2s;
                    `;
                    closeBtn.addEventListener('mouseenter', () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.4)';
                    });
                    closeBtn.addEventListener('mouseleave', () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    const closeOverlay = () => {
                        overlay.remove();
                        document.body.style.overflow = '';
                    };
                    
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) closeOverlay();
                    });
                    closeBtn.addEventListener('click', closeOverlay);
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            closeOverlay();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                    
                    overlay.appendChild(zoomedImg);
                    overlay.appendChild(closeBtn);
                    document.body.appendChild(overlay);
                    document.body.style.overflow = 'hidden';
                };
                
                zoomBtn.addEventListener('click', openZoomModal);
                img.addEventListener('click', openZoomModal);
                
                // Wrap image
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
                btnContainer.appendChild(playBtn);
                btnContainer.appendChild(zoomBtn);
                wrapper.appendChild(btnContainer);
                
                // Show first frame initially (paused state)
                img.src = firstFrameSrc;
            };
            
            if (img.complete) {
                applyGifPlayer();
            } else {
                img.addEventListener('load', applyGifPlayer, { once: true });
            }
        }
    });
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
