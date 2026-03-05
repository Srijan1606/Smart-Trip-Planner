import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

function frontedJsAsJsx() {
  return {
    name: 'fronted-js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('/fronted.js') || id.endsWith('/frontend.js')) {
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    frontedJsAsJsx(),
    react({
      include: /\.[jt]sx?$/,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
