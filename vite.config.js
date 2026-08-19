import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separamos as dependências do código do app para o navegador poder
        // reaproveitar o cache entre deploys: publicar uma correção de tela
        // reinvalida só o "app", e não os ~130 kB de React e Supabase.
        //
        // São dois grupos (e não um "vendor" único) porque eles mudam em
        // ritmos diferentes: o Supabase costuma lançar versão bem mais
        // vezes que o React, e um upgrade de um não deve derrubar o cache
        // do outro.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react'
          }
        },
      },
    },
  },
})
