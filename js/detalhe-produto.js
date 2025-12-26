// 1. Pega o ID da URL
const urlParams = new URLSearchParams(window.location.search);
let produtoId = urlParams.get('id');

async function carregarDetalhes() {
    try {
        let produtos = [];
        // Busca nos dados embutidos ou arquivos JSON
        const inlineNovo = document.getElementById('produtos-data');
        const inlineUsado = document.getElementById('produtos-usados-data');

        if (inlineNovo) produtos = produtos.concat(JSON.parse(inlineNovo.textContent));
        if (inlineUsado) produtos = produtos.concat(JSON.parse(inlineUsado.textContent));

        if (produtos.length === 0) {
            const [rNovo, rUsado] = await Promise.allSettled([
                fetch('produtoNovo.json'),
                fetch('produtoUsado.json')
            ]);
            if (rNovo.status === 'fulfilled' && rNovo.value.ok) produtos = produtos.concat(await rNovo.value.json());
            if (rUsado.status === 'fulfilled' && rUsado.value.ok) produtos = produtos.concat(await rUsado.value.json());
        }

        const produto = produtos.find(p => String(p.id) === String(produtoId));

        if (produto) {
            exibirProduto(produto);
        } else {
            document.getElementById('detalhe-container').innerHTML = "<h2>Produto não encontrado!</h2>";
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

function exibirProduto(produto) {
    // Preenchimento básico
    document.getElementById('nome-produto').innerText = produto.name;
    document.getElementById('fabricante').innerText = produto.fabricante;
    document.getElementById('descricao-produto').innerText = produto.description;
    document.getElementById('preco-produto').innerText = produto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Dimensões
    document.getElementById('altura').innerText = produto.dimensoes.altura;
    document.getElementById('largura').innerText = produto.dimensoes.largura;
    document.getElementById('profundidade').innerText = produto.dimensoes.profundidade;


    // 1. Renderizar Galeria de Imagens
    const fotoPrincipal = document.getElementById('foto-principal');
    fotoPrincipal.src = produto.imageUrl[0];

    const galeria = document.getElementById('miniaturas-container'); // Certifique-se que este ID existe no HTML
    if (galeria) {
        galeria.innerHTML = produto.imageUrl.map((img, i) => `
            <img src="${img}" class="miniatura ${i === 0 ? 'ativa' : ''}" 
                 onclick="trocarImagem(this, '${img}')" alt="Miniatura">
        `).join('');
    }

    // Exibe o nome da cor do produto atual por padrão
    const labelCor = document.getElementById('nome-da-cor');
    if (labelCor) labelCor.innerText = produto.cor; // Certifique-se que o JSON tem o campo "cor"

    const containerCores = document.getElementById('container-cores');
    if (containerCores && produto.variacoes) {
        containerCores.innerHTML = produto.variacoes.map(v => `
            <button class="botao-cor-texto ${String(v.id) === String(produtoId) ? 'ativo' : ''}" 
                    onclick="mudarCor('${v.id}')">
                ${v.cor}
            </button>
        `).join('');
    }


    // 3. Configurar Botão WhatsApp
    const btnWhats = document.querySelector('.btn-comprar');
    btnWhats.onclick = () => {
        const mensagem = encodeURIComponent(`Olá! Quero mais informações sobre o produto: ${produto.name} (ID: ${produto.id})`);
        window.open(`https://wa.me/5511999999999?text=${mensagem}`, '_blank');
    };
}

// Funções Auxiliares de Interação
function trocarImagem(el, url) {
    document.getElementById('foto-principal').src = url;
    document.querySelectorAll('.miniatura').forEach(m => m.classList.remove('ativa'));
    el.classList.add('ativa');
}

//function mudarCor(novoId) {
    // Pegamos o caminho atual da página para garantir que ficaremos na mesma pasta
    //const path = window.location.pathname;
   // const novaUrl = `${path}?id=${novoId}`;

    //console.log("Navegando para:", novaUrl);
    //window.location.href = novaUrl;
//}



carregarDetalhes();