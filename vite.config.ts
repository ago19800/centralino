import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Property 'cwd' does not exist on type 'Process'. 
  // We cast to any to ensure we can access the Node.js cwd() method in the Vite configuration context, which is necessary for loadEnv.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    },
    server: {
      host: '0.0.0.0', // Fondamentale per LXC/Proxmox
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true, // Necessario se il filesystem è su mount di rete o container particolari
      },
      hmr: {
        host: '0.0.0.0'
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'esnext'
    }
  };
});