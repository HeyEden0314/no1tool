// 首页专用脚本
const categoryGrid = document.getElementById('categoryGrid');

const categories = [
  { name: '全部', icon: '🔍', desc: '浏览所有AI工具' },
  { name: 'AI写作', icon: '✍️', desc: '文章、论文、文案生成' },
  { name: 'AI图像', icon: '🎨', desc: '绘画、设计、图像处理' },
  { name: 'AI视频', icon: '🎬', desc: '视频生成、编辑、处理' },
  { name: 'AI办公', icon: '💼', desc: 'PPT、文档、办公自动化' },
  { name: 'AI聊天', icon: '💬', desc: '对话、问答、智能助手' },
  { name: 'AI开发', icon: '💻', desc: '编程、代码生成、开发工具' },
  { name: 'AI音频', icon: '🎵', desc: '音乐、语音、音频处理' },
  { name: 'AI内容', icon: '📝', desc: '内容创作、编辑、管理' },
  { name: 'AI学习', icon: '📚', desc: '教育、培训、知识学习' },
  { name: 'AI搜索', icon: '🔎', desc: '搜索、发现、信息检索' }
];

// 统计信息
const stats = {
  totalTools: 0,
  totalCategories: categories.length
};

// 获取工具总数
function fetchToolCount() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      stats.totalTools = data.length;
      updateStats();
    })
    .catch(() => {
      stats.totalTools = '400+';
      updateStats();
    });
}

function updateStats() {
  const statItems = document.querySelectorAll('.stat-item strong');
  if (statItems.length >= 4) {
    statItems[0].textContent = stats.totalTools + '+';
    statItems[2].textContent = stats.totalCategories;
  }
}

// 渲染分类入口
function renderCategoryGrid() {
  if (!categoryGrid) return;

  categoryGrid.innerHTML = '';

  categories.forEach((cat, index) => {
    const link = document.createElement('a');
    link.href = `list.html?category=${encodeURIComponent(cat.name)}`;
    link.className = 'category-card';
    link.style.animationDelay = `${index * 0.05}s`;

    link.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <div class="category-info">
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-desc">${cat.desc}</p>
      </div>
      <div class="category-arrow">→</div>
    `;

    categoryGrid.appendChild(link);
  });
}

// 初始化
function initialize() {
  renderCategoryGrid();
  fetchToolCount();
}

initialize();