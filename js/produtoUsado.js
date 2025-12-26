// FUNÇÃO PARA CARREGAR PRODUTOS NOVOS
function toggleMenu() {
        // Seleciona o elemento nav e adiciona/remove a classe 'active'
        const nav = document.getElementById('navMenu');
        nav.classList.toggle('active');
    }

// Navega para a página de detalhe do produto
function verDetalhes(id) {
    window.location.href = `detalhe-produto.html?id=${id}`;
}

// Função para carregar os produtos
async function carregarProdutos() {
    const vitrine = document.getElementById('vitrineUsados');
    if (!vitrine) return;

    // mostra loading
    vitrine.innerHTML = '<p class="loading">Carregando produtos…</p>';

    // fallback interno (último recurso)
   // const fallback = [
   //     { "id": 3001, "name": "Sofá 2 Lugares Usado", "categoria_grupo": "Sala", "valor": 499.90, "imageUrl": ["img/id2020.png"] },
   //     { "id": 3002, "name": "Cômoda 4 Gavetas Usada", "categoria_grupo": "Quarto", "valor": 220.00, "imageUrl": ["img/comoda1.png"] },
   //     { "id": 3003, "name": "Mesa Escrivaninha Usada", "categoria_grupo": "Escritório", "valor": 120.00, "imageUrl": ["img/mesa1.png"] }
   // ];

    try {
        // 1) dados embutidos na página
        const inline = document.getElementById('produtos-usados-data');
        if (inline) {
            try {
                const produtos = JSON.parse(inline.textContent);
                renderProdutosUsados(produtos);
                return;
            } catch (e) { console.warn('JSON embutido inválido em #produtos-usados-data', e); }
        }

        // 2) tentar fetch com diferentes caminhos
        const attempts = ['produtoUsado.json', './produtoUsado.json', 'data/produtoUsado.json'];
        for (const path of attempts) {
            try {
                const res = await fetch(path);
                if (res && res.ok) {
                    const produtos = await res.json();
                    renderProdutosUsados(produtos);
                    return;
                }
            } catch (er) {
                console.warn('Falha ao buscar', path, er);
            }
        }

        // 3) usar fallback interno
        console.warn('Usando fallback interno para produtos usados.');
        renderProdutosUsados(fallback);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        renderProdutosUsados(fallback);
    }
}

function renderProdutosUsados(produtos) {
    const vitrine = document.getElementById('vitrineUsados');
    if (!vitrine) return;

    vitrine.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        vitrine.innerHTML = '<p class="empty">Nenhum produto encontrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';

        const imgSrc = (produto.imageUrl && produto.imageUrl[0]) || produto.image || 'img/placeholder.png';
        const preco = (typeof produto.valor === 'number') ? produto.valor.toFixed(2).replace('.', ',') : produto.valor;

        card.innerHTML = `
            <a class="produto-link" href="detalhe-produto.html?id=${produto.id}" aria-label="${produto.name}">
              <img src="${imgSrc}" alt="${produto.name}">
              <div class="produto-info">
                <h3>${produto.name}</h3>
                <p class="categoria">${produto.categoria_grupo ?? ''}</p>
                <p class="preco">R$ ${preco}</p>
              </div>
            </a>
            <button onclick="verDetalhes(${produto.id})">Ver Detalhes</button>
        `;

        vitrine.appendChild(card);
    });
}

// Ensure carregarProdutos executes after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarProdutos);
} else {
    carregarProdutos();
}