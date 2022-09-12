import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Zebra',
      formats: ['es', 'umd'],
      fileName: (format) => `zebra.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          next: 'next',
        },
      },
    },
  },
});
