const searchInput = document.getElementById('searchInput');
const categoryBar = document.getElementById('categoryBar');
const cardGrid = document.getElementById('cardGrid');
const statsRow = document.getElementById('statsRow');
const pagination = document.getElementById('pagination');
const pageInfo = document.getElementById('pageInfo');

const categories = [
  '全部',
  'AI写作',
  'AI图像',
  'AI视频',
  'AI办公',
  'AI聊天',
  'AI开发',
  'AI音频',
  'AI内容',
  'AI学习',
  'AI搜索'
];

// 分页配置
const ITEMS_PER_PAGE = 24;
let currentPage = 1;
let totalPages = 1;

let tools = [];
let filteredTools = [];
let activeCategory = '全部';

// 从URL获取初始分类
function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || '全部';
}

// 更新URL参数
function updateURL(category) {
  const url = new URL(window.location);
  if (category && category !== '全部') {
    url.searchParams.set('category', category);
  } else {
    url.searchParams.delete('category');
  }
  window.history.replaceState({}, '', url);
}

function renderCategories() {
  categoryBar.innerHTML = '';
  categories.forEach((name, index) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'category-chip' + (name === activeCategory ? ' active' : '');
    chip.textContent = name;
    chip.setAttribute('aria-pressed', name === activeCategory ? 'true' : 'false');
    chip.addEventListener('click', () => {
      activeCategory = name;
      currentPage = 1;
      updateURL(name);
      renderCategories();
      filterAndRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    categoryBar.appendChild(chip);
  });
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function filterTools() {
  const search = normalizeText(searchInput.value);
  return tools.filter((tool) => {
    const matchesSearch =
      !search ||
      normalizeText(tool.title).includes(search) ||
      normalizeText(tool.subtitle).includes(search);

    const matchesCategory =
      activeCategory === '全部' || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });
}

function renderPagination() {
  pagination.innerHTML = '';
  totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    pageInfo.textContent = `共 ${filteredTools.length} 个工具`;
    return;
  }

  pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页 · 共 ${filteredTools.length} 个工具`;

  // 上一页
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '上一页';
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(prevBtn);
  }

  // 页码
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.className = 'pagination-btn';
    firstBtn.textContent = '1';
    firstBtn.addEventListener('click', () => {
      currentPage = 1;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(firstBtn);

    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      pagination.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      pagination.appendChild(ellipsis);
    }

    const lastBtn = document.createElement('button');
    lastBtn.className = 'pagination-btn';
    lastBtn.textContent = totalPages;
    lastBtn.addEventListener('click', () => {
      currentPage = totalPages;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(lastBtn);
  }

  // 下一页
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '下一页';
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(nextBtn);
  }
}

function renderCards() {
  cardGrid.innerHTML = '';

  // 计算当前页的工具
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageTools = filteredTools.slice(startIndex, endIndex);

  if (!pageTools.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '未找到匹配项，请尝试更换关键词或类别。';
    cardGrid.appendChild(empty);
    return;
  }

  pageTools.forEach((tool, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${index * 0.03}s`;

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

    const title = document.createElement('div');
    const titleText = document.createElement('h3');
    titleText.className = 'card-title';
    titleText.textContent = tool.title;
    const subtitle = document.createElement('p');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = tool.subtitle;
    title.appendChild(titleText);
    title.appendChild(subtitle);

    top.appendChild(avatar);
    top.appendChild(title);

    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = tool.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '查看链接';

    card.appendChild(top);
    card.appendChild(link);
    cardGrid.appendChild(card);
  });
}

function renderPage() {
  renderCards();
  renderPagination();
  statsRow.innerHTML = `<strong>显示 ${filteredTools.length} 个工具</strong>`;
}

function filterAndRender() {
  filteredTools = filterTools();
  renderPage();
}

function initialize() {
  // 从URL获取分类
  activeCategory = getCategoryFromURL();

  fetch('data.json')
    .then((response) => response.json())
    .then((data) => {
      tools = data
        .filter((item) => item.status !== 'unpublished')
        .map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
          img: item.img || 'images/placeholder.svg',
          category: item.category || '',
        }));
      renderCategories();
      filterAndRender();
    })
    .catch((error) => {
      cardGrid.innerHTML = '<div class="empty-state">加载数据失败，请刷新页面。</div>';
      console.error(error);
    });

  // 搜索输入防抖
  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      filterAndRender();
    }, 300);
  });
}

initialize();