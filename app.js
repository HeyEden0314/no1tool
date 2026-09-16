// 首页专用脚本
const categoryGrid = document.getElementById('categoryGrid');
const featuredGrid = document.getElementById('featuredGrid');

const categories = [
  { name: '全部', icon: '🔍', desc: '已收录工具' },
  { name: 'AI写作', icon: '✍️', desc: '文章、文案' },
  { name: 'AI图像', icon: '🎨', desc: '绘画、修图' },
  { name: 'AI视频', icon: '🎬', desc: '生成、剪辑' },
  { name: 'AI办公', icon: '💼', desc: 'PPT、文档' },
  { name: 'AI聊天', icon: '💬', desc: '对话、助手' },
  { name: 'AI开发', icon: '💻', desc: '编程、代码' },
  { name: 'AI音频', icon: '🎵', desc: '音乐、配音' },
  { name: 'AI内容', icon: '📝', desc: '检测、编辑' },
  { name: 'AI学习', icon: '📚', desc: '课程、教程' },
  { name: 'AI搜索', icon: '🔎', desc: '检索、问答' }
];

const FEATURED_TITLES = [
  'ChatGPT',
  'GitHub Copilot',
  'Midjourney',
  'DeepSeek',
  'Kimi智能助手',
  '即梦',
  'Gamma',
  'Perplexity'
];

function publishedTools(data) {
  return data.filter((item) => item.status !== 'unpublished' && item.slug);
}

function toolHref(tool) {
  return `tools/${encodeURIComponent(tool.slug)}.html`;
}

function renderToolCard(tool, index) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.03}s`;

  const main = document.createElement('a');
  main.className = 'card-main';
  main.href = toolHref(tool);

  const top = document.createElement('div');
  top.className = 'card-top';

  const avatar = document.createElement('div');
  avatar.className = 'card-avatar';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = tool.img || 'images/placeholder.svg';
  img.alt = tool.title;
  img.onerror = () => {
    img.onerror = null;
    img.src = 'images/placeholder.svg';
  };
  avatar.appendChild(img);

  const copy = document.createElement('div');
  const titleText = document.createElement('h3');
  titleText.className = 'card-title';
  titleText.textContent = tool.title;
  const subtitle = document.createElement('p');
  subtitle.className = 'card-subtitle';
  subtitle.textContent = tool.subtitle;
  copy.appendChild(titleText);
  copy.appendChild(subtitle);

  top.appendChild(avatar);
  top.appendChild(copy);
  main.appendChild(top);

  if (tool.category) {
    const badge = document.createElement('span');
    badge.className = 'card-category';
    badge.textContent = tool.category;
    main.appendChild(badge);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const detail = document.createElement('a');
  detail.className = 'card-link';
  detail.href = toolHref(tool);
  detail.textContent = '查看详情';

  const official = document.createElement('a');
  official.className = 'card-link-ghost';
  official.href = tool.href;
  official.target = '_blank';
  official.rel = 'noopener noreferrer';
  official.textContent = '官网';

  actions.appendChild(detail);
  actions.appendChild(official);

  card.appendChild(main);
  card.appendChild(actions);
  return card;
}

function pickFeatured(tools) {
  const byTitle = new Map(tools.map((tool) => [tool.title, tool]));
  const picked = [];
  const used = new Set();
  FEATURED_TITLES.forEach((title) => {
    const tool = byTitle.get(title);
    if (tool && !used.has(tool.slug)) {
      picked.push(tool);
      used.add(tool.slug);
    }
  });
  const byCat = new Map();
  tools.forEach((tool) => {
    if (!byCat.has(tool.category)) byCat.set(tool.category, tool);
  });
  byCat.forEach((tool) => {
    if (picked.length >= 8) return;
    if (!used.has(tool.slug)) {
      picked.push(tool);
      used.add(tool.slug);
    }
  });
  return picked.slice(0, 8);
}

function renderFeatured(tools) {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = '';
  pickFeatured(tools).forEach((tool, index) => {
    featuredGrid.appendChild(renderToolCard(tool, index));
  });
}

function renderCategoryGrid(tools) {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = '';
  const counts = {};
  tools.forEach((tool) => {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  });

  categories.forEach((cat, index) => {
    const link = document.createElement('a');
    link.href =
      cat.name === '全部'
        ? 'list.html'
        : `list.html?category=${encodeURIComponent(cat.name)}`;
    link.className = 'category-card';
    link.style.animationDelay = `${index * 0.04}s`;
    const count = cat.name === '全部' ? tools.length : counts[cat.name] || 0;
    link.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <div class="category-info">
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-desc">${cat.desc}</p>
      </div>
      <div class="category-meta">
        <span class="category-count">${count}</span>
        <span class="category-arrow">→</span>
      </div>
    `;
    categoryGrid.appendChild(link);
  });
}

function initialize() {
  fetch('data.json')
    .then((response) => response.json())
    .then((data) => {
      const tools = publishedTools(data);
      const countEl = document.getElementById('statToolCount');
      if (countEl) countEl.textContent = String(tools.length);
      renderFeatured(tools);
      renderCategoryGrid(tools);
    })
    .catch(() => {
      renderCategoryGrid([]);
    });
}

initialize();
