// FUNÇÃO PARA CARREGAR PRODUTOS NOVOS
function toggleMenu() {
        // Seleciona o elemento nav e adiciona/remove a classe 'active'
        const nav = document.getElementById('navMenu');
        nav.classList.toggle('active');
    }

/*
  Renderiza produtos em #vitrineNovos a partir de data/produtos.json,
  adiciona busca com debounce e tratamento de erro/fallback.
*/
(() => {
  const container = document.getElementById('vitrineNovos');
  const placeholder = document.getElementById('vitrine-placeholder');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  const debounce = (fn, wait = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  async function fetchProducts() {
    // Se houver dados embutidos no HTML, use-os (útil ao abrir via file://)
    const inline = document.getElementById('produtos-data');
    if (inline) {
      try {
        return JSON.parse(inline.textContent);
      } catch (err) {
        console.warn('JSON embutido inválido em #produtos-data', err);
      }
    }
    try {
      const res = await fetch('produtoNovo.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar produtos');
      return await res.json();
    } catch (err) {
      console.warn('Fetch produtos falhou, usando fallback.', err);
      // fallback minimal: array vazio para não quebrar
      return [];
    }
  }

  function formatPrice(ptBrPrice) {
    // aceitar número ou string
    const n = Number(ptBrPrice);
    if (Number.isFinite(n)) {
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return ptBrPrice;
  }

  function renderProducts(list) {
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<p class="empty">Nenhum produto encontrado.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach(prod => {
      const article = document.createElement('article');
      article.className = 'produto-card';
      article.setAttribute('tabindex', '0');

      article.innerHTML = `
        <a class="produto-link" href="detalhe-produto.html?id=${prod.id}" aria-label="${(prod.title || prod.name) ?? ''}">
          <div class="produto-thumb">
            <img src="${prod.image || (prod.imageUrl && prod.imageUrl[0]) || ''}" alt="${prod.imageAlt ?? prod.title ?? prod.name ?? ''}" loading="lazy" width="320" height="240">
          </div>
          <div class="produto-info">
            <h2 class="produto-title">${prod.title ?? prod.name ?? ''}</h2>
            <p class="produto-desc">${prod.description ?? ''}</p>
            <div class="produto-meta">
              <span class="produto-price">${formatPrice(prod.price ?? prod.valor)}</span>
              <span class="produto-condition">${prod.condition ?? prod.categoria_grupo ?? ''}</span>
            </div>
          </div>
        </a>
      `;
      fragment.appendChild(article);
    });

    container.appendChild(fragment);
  }

  function applySearchFilter(products, term) {
    if (!term) return products;
    const q = term.trim().toLowerCase();
    return products.filter(p => {
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (String(p.price ?? p.valor) && String(p.price ?? p.valor).toLowerCase().includes(q))
      );
    });
  }

  async function init() {
    placeholder && placeholder.remove();
    if (!container) return; // evita erros se o elemento não existir
    container.innerHTML = '<p class="loading">Carregando produtos…</p>';
    const products = await fetchProducts();

    // estado atual visível
    let visibleProducts = products.slice();

    renderProducts(visibleProducts);

    const onSearch = debounce((ev) => {
      const term = (searchInput && searchInput.value) || '';
      visibleProducts = applySearchFilter(products, term);
      renderProducts(visibleProducts);
      container.setAttribute('aria-live', 'polite');
      // opcional: rolar para vitrine ao buscar
      if (term && visibleProducts.length) container.scrollIntoView({ behavior: 'smooth' });
    }, 250);

    if (searchInput) searchInput.addEventListener('input', onSearch);
    if (searchForm) searchForm.addEventListener('submit', (e) => { e.preventDefault(); onSearch(); });
  }

  // inicializa
  document.addEventListener('DOMContentLoaded', init);
})();