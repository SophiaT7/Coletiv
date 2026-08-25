import { Component } from 'react'

// Rede de segurança da árvore inteira. Sem isso, um erro de render em
// qualquer tela desmonta o app e a pessoa fica olhando uma página branca,
// sem nem saber que deu errado — e num app usado no celular, no meio do
// expediente, isso vira "o aplicativo não abre".
//
// Precisa ser classe: só componentes de classe têm componentDidCatch, e o
// React não oferece equivalente em hooks até hoje. É a única classe do
// projeto, e é por esse motivo.
//
// Importante: isto captura erros de RENDER. Falha de rede dentro de um
// evento ou de um await (salvar perfil, votar) continua sendo tratada na
// própria tela, que sabe dar uma mensagem melhor que "algo deu errado".
export default class LimiteDeErro extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('[Coletiv] Erro não tratado:', erro, info)
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 340 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Algo deu errado</p>
          <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 16, lineHeight: 1.5 }}>
            A tela não conseguiu carregar. Seus dados estão salvos — nada foi
            perdido.
          </p>
          {/* Recarrega pela raiz em vez de tentar limpar o estado: se a tela
              quebrou por causa do próprio estado, voltar para ela repetiria
              o erro em loop. */}
          <button className="btn" onClick={() => { window.location.href = '/' }}>
            Recarregar o app
          </button>
        </div>
      </div>
    )
  }
}
