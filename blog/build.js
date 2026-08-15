// Pomoćna skripta za blog: čita .md fajlove iz posts/, pretvara ih u HTML
// (koristeći template-e i style.css), i generiše sve u dist/ folder.
//
// Upotreba:
//   1. Napiši objavu u posts/naziv-objave.md (vidi posts/2026-08-11-dobrodoslica.md kao primjer)
//   2. Slike stavi u images/ i referenciraj ih u tekstu kao ![opis](images/slika.jpg)
//   3. Pokreni:  node build.js
//   4. Gotove HTML stranice su u dist/ — to je ono što se postavlja na hosting

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');
const IMAGES_DIR = path.join(ROOT, 'images');
const DIST_DIR = path.join(ROOT, 'dist');

// JEDINO mjesto koje treba promijeniti kad blog dobije pravi domen —
// sve OG tagove, canonical linkove i sitemap.xml koristi ovu vrijednost.
const SITE_URL = 'https://brko88.github.io/imamalergiju/blog/dist/';
const APP_URL = 'https://brko88.github.io/imamalergiju/';
const SITE_DESCRIPTION = 'Blog o razvoju aplikacije imamAlergiju, alergijama, i svakodnevnom životu s njima — savjeti, iskustva i novosti.';

function readTemplate(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Parsira frontmatter oblika:
// ---
// title: Naslov
// date: 2026-08-11
// image: images/slika.jpg
// ---
// (ostatak teksta)
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

// Minimalni Markdown → HTML: naslovi (##, ###), **podebljano**, *kurziv*,
// [tekst](link), ![opis](slika) kao poseban blok, i paragrafi.
function markdownToHtml(md) {
  const blocks = md.trim().split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed === '') return '';

      const codeBlockMatch = trimmed.match(/^```[a-z]*\n([\s\S]*?)\n?```$/);
      if (codeBlockMatch) {
        return `<pre><code>${escapeHtml(codeBlockMatch[1])}</code></pre>`;
      }

      const headingMatch = trimmed.match(/^(#{2,3})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        return `<h${level}>${inline(headingMatch[2])}</h${level}>`;
      }

      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        return `<img src="${escapeHtml(imageMatch[2])}" alt="${escapeHtml(imageMatch[1])}" />`;
      }

      // Istaknut okvir (callout), npr. za donaciju/napomenu: svaka linija bloka počinje sa "> ".
      const isCallout = trimmed.split('\n').every((line) => line.trim().startsWith('>'));
      if (isCallout) {
        const content = trimmed.split('\n').map((line) => line.replace(/^>\s?/, '')).join('\n');
        const inner = content.split('\n').map(inline).join('<br>');
        return `<blockquote>${inner}</blockquote>`;
      }

      const withBreaks = trimmed.split('\n').map(inline).join('<br>');
      return `<p>${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('bs-BA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function excerptFrom(html, maxLen = 160) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function build() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  fs.copyFileSync(path.join(ROOT, 'style.css'), path.join(DIST_DIR, 'style.css'));
  copyDir(IMAGES_DIR, path.join(DIST_DIR, 'images'));

  const postTemplate = readTemplate('post.template.html');
  const indexTemplate = readTemplate('index.template.html');

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const contentHtml = markdownToHtml(body);

    const title = meta.title || slug;
    const date = meta.date || '';
    const coverImageHtml = meta.image
      ? `<img class="cover" src="${escapeHtml(meta.image)}" alt="${escapeHtml(title)}" />`
      : '';

    return {
      slug,
      title,
      date,
      dateFormatted: date ? formatDate(date) : '',
      coverImage: meta.image || '',
      contentHtml,
      excerpt: excerptFrom(contentHtml),
      url: `${SITE_URL}${slug}.html`,
      imageUrl: meta.image ? `${SITE_URL}${meta.image}` : ''
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  for (const post of posts) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date || undefined,
      url: post.url,
      image: post.imageUrl || undefined,
      publisher: { '@type': 'Organization', name: 'imamAlergiju' }
    };

    const html = postTemplate
      .replaceAll('{{TITLE}}', escapeHtml(post.title))
      .replaceAll('{{DATE}}', escapeHtml(post.dateFormatted))
      .replaceAll('{{EXCERPT}}', escapeHtml(post.excerpt))
      .replaceAll('{{POST_URL}}', post.url)
      .replaceAll('{{OG_IMAGE_TAG}}', post.imageUrl
        ? `<meta property="og:image" content="${post.imageUrl}" />\n<meta name="twitter:image" content="${post.imageUrl}" />`
        : '')
      .replaceAll('{{JSON_LD}}', JSON.stringify(jsonLd))
      .replace('{{COVER_IMAGE_HTML}}', post.coverImage
        ? `<img class="cover" src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" />`
        : '')
      .replace('{{CONTENT}}', post.contentHtml);

    fs.writeFileSync(path.join(DIST_DIR, `${post.slug}.html`), html, 'utf8');
    console.log(`✓ ${post.slug}.html`);
  }

  const postsListHtml = posts.length
    ? posts
        .map(
          (post) => `
      <a class="post-card" href="${post.slug}.html">
        ${post.coverImage ? `<img class="cover-thumb" src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" />` : ''}
        <h2>${escapeHtml(post.title)}</h2>
        <p class="post-date">${escapeHtml(post.dateFormatted)}</p>
      </a>`
        )
        .join('\n')
    : '<p class="empty-hint">Još nema objava.</p>';

  const indexHtml = indexTemplate
    .replace('{{POSTS_LIST}}', postsListHtml)
    .replaceAll('{{SITE_URL}}', SITE_URL)
    .replaceAll('{{SITE_DESCRIPTION}}', escapeHtml(SITE_DESCRIPTION));
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`✓ index.html (${posts.length} objava)`);

  const sitemapUrls = [SITE_URL, ...posts.map((p) => p.url)]
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots, 'utf8');

  console.log('✓ sitemap.xml, robots.txt');
}

build();
