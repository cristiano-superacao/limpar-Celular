import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    // Railway serve em *.up.railway.app; o Vite preview bloqueia hosts desconhecidos por padrão.
    // Permitimos o domínio do Railway para produção.
    allowedHosts: ['.up.railway.app', '.railway.app'],
  },
})
