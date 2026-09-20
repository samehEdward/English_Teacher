import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function pwaFixPlugin() {
  return {
    name: 'pwa-fix-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Remove any hashed manifest links and insert clean ./manifest.json
        return html
          .replace(/<link rel="manifest"[^>]*>/g, '')
          .replace('</head>', '    <link rel="manifest" href="./manifest.json" />\n  </head>');
      }
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const docsDir = path.resolve(__dirname, 'docs');
      const assetsIconsDir = path.resolve(distDir, 'assets', 'icons');
      const distIconsDir = path.resolve(distDir, 'icons');
      const publicIconsDir = path.resolve(__dirname, 'public', 'icons');

      // 1. Copy icons to dist/assets/icons so that if any tool resolves from assets/ it also works
      if (!fs.existsSync(assetsIconsDir)) {
        fs.mkdirSync(assetsIconsDir, { recursive: true });
      }
      if (fs.existsSync(publicIconsDir)) {
        fs.cpSync(publicIconsDir, assetsIconsDir, { recursive: true });
      }

      // 2. Ensure .nojekyll in dist
      fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

      // 3. Mirror dist to docs/ so GitHub Pages works whether deployed from branch or Actions
      if (fs.existsSync(distDir)) {
        if (fs.existsSync(docsDir)) {
          fs.rmSync(docsDir, { recursive: true, force: true });
        }
        fs.mkdirSync(docsDir, { recursive: true });
        fs.cpSync(distDir, docsDir, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [pwaFixPlugin()],
  server: {
    port: 5173,
    open: false,
    host: true
  }
});

