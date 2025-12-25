import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Bind to all interfaces so the dev server can accept connections
    // for your domain (requires DNS/port-forwarding to point to this machine)
    host: '0.0.0.0',
    port: 5174,
    hmr: {
      // Ensure HMR client connects to the correct host when using the domain
      host: 'gloriously-sensuous-marten.cloudpub.ru',
      protocol: 'wss'
    }
  },
  plugins: [react()],
})
