import { defineConfig, loadEnv } from 'vite';
import { InlineConfig } from "vitest";
import assets from 'vite-plugin-assets';
import { createHtmlPlugin } from 'vite-plugin-html';
import { manualChunksPlugin } from 'vite-plugin-webpackchunkname';
import vue from '@vitejs/plugin-vue';

const hash = Math.random().toString(36).substring(2, 12);

declare type VitestInlineConfig = InlineConfig;
declare module 'vite' {
  interface UserConfig {
    test?: VitestInlineConfig;
  }
}

// https://vitejs.dev/config/
export default (config) => {
  const env = { ...process.env, ...loadEnv(config.mode, process.cwd()) };

  if (env.NODE_ENV !== 'test') {
    process.env = env;
  }

  return defineConfig({
    base: env.VITE_BASE,
    server: {
      proxy: {
        '/graphql': env.VITE_SERVER_PROXY,
        '/config': env.VITE_SERVER_PROXY,
        '/auth': env.VITE_SERVER_PROXY,
        '/pre-matricula-export': env.VITE_SERVER_PROXY,
        '/pre-matricula-report': env.VITE_SERVER_PROXY,
      },
      port: Number(env.VITE_APP_PORT),
    },
    plugins: [
      vue(),
      assets({
        replaces: ['/resources/ts/assets/', '/node_modules/'],
      }),
      createHtmlPlugin({
        minify: true,
        entry: '/resources/ts/main.ts',
        inject: {
          data: {},
        },
      }),
      manualChunksPlugin(),
    ],
    resolve: {
      alias: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        '@': require('path').resolve(__dirname, './resources/ts'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        /**
         * According to these issues below,
         * Vite not change the hash every time when build. Here is the problem, because
         * the hash is not changed, so the browser cache thinks it's the old file.
         * With the randomized hash, the browser automatically fetches the new file and displays the site
         * with all the new changes.
         *
         * https://stackoverflow.com/questions/68046410/how-to-force-vite-clearing-cache-in-vue3
         * https://github.com/vitejs/vite/issues/2944
         */
        output: {
          entryFileNames: `assets/[name].${hash}.js`,
          chunkFileNames: `assets/[name].${hash}.js`,
          assetFileNames: `assets/[name].${hash}.[ext]`,
        },
      },
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      clearMocks: true,
      mockReset: true,
      setupFiles: ['./tests/frontend/setupVitestMock.ts'],
    },
  });
};
