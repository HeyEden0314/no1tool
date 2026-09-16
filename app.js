// 首页专用脚本
const categoryGrid = document.getElementById('categoryGrid');
const featuredGrid = document.getElementById('featuredGrid');

const categories = [
  { name: '全部', icon: '00', desc: '已收录工具' },
  { name: 'AI写作', icon: '01', desc: '文章、文案' },
  { name: 'AI图像', icon: '02', desc: '绘画、修图' },
  { name: 'AI视频', icon: '03', desc: '生成、剪辑' },
  { name: 'AI办公', icon: '04', desc: 'PPT、文档' },
  { name: 'AI聊天', icon: '05', desc: '对话、助手' },
  { name: 'AI开发', icon: '06', desc: '编程、代码' },
  { name: 'AI音频', icon: '07', desc: '音乐、配音' },
  { name: 'AI内容', icon: '08', desc: '检测、编辑' },
  { name: 'AI学习', icon: '09', desc: '课程、教程' },
  { name: 'AI搜索', icon: '10', desc: '检索、问答' }
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

function attachCover(container, tool, placeholder) {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = tool.img || placeholder;
  img.alt = tool.title;
  img.onerror = () => {
    img.onerror = null;
    img.src = placeholder;
  };
  container.appendChild(img);
}

function renderToolCard(tool, index) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.cat = tool.category || '';

  const main = document.createElement('a');
  main.className = 'card-main';
  main.href = toolHref(tool);

  const cover = document.createElement('div');
  cover.className = 'card-cover';
  attachCover(cover, tool, 'images/placeholder.svg');
  main.appendChild(cover);

  const body = document.createElement('div');
  body.className = 'card-body';

  if (tool.category) {
    const badge = document.createElement('span');
    badge.className = 'card-category';
    badge.textContent = tool.category;
    body.appendChild(badge);
  }

  const titleText = document.createElement('h3');
  titleText.className = 'card-title';
  titleText.textContent = tool.title;
  const subtitle = document.createElement('p');
  subtitle.className = 'card-subtitle';
  subtitle.textContent = tool.subtitle;
  body.appendChild(titleText);
  body.appendChild(subtitle);
  main.appendChild(body);

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

  categories.forEach((cat) => {
    const link = document.createElement('a');
    link.href =
      cat.name === '全部'
        ? 'list.html'
        : `list.html?category=${encodeURIComponent(cat.name)}`;
    link.className = 'category-card';
    link.dataset.cat = cat.name;
    const count = cat.name === '全部' ? tools.length : counts[cat.name] || 0;
    link.innerHTML = `
      <span class="category-index">${cat.icon}</span>
      <div class="category-info">
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-desc">${cat.desc}</p>
      </div>
      <span class="category-count">${count}</span>
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
