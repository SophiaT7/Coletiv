// Ícones em SVG (sem dependência externa). Recebem `tamanho`.
const props = (t) => ({
  width: t, height: t, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
})

export const IconeCasa = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
)
export const IconeEscudo = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
)
export const IconeGrafico = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
)
export const IconeMedidor = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M12 13l4-4M4 18a8 8 0 1 1 16 0z" /></svg>
)
export const IconeLivro = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM18 3v18" /></svg>
)
export const IconeMapa = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const IconeRobo = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M12 8V4M8 13h.01M16 13h.01" /></svg>
)
export const IconePessoas = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0-2-5.3M16 14a6 6 0 0 1 5 6" /></svg>
)
export const IconePerfil = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
)
export const IconeSino = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10.5 21a2 2 0 0 0 3 0" /></svg>
)
export const IconeSeta = ({ tamanho = 24 }) => (
  <svg {...props(tamanho)}><path d="M9 6l6 6-6 6" /></svg>
)
