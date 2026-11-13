import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import svgr from 'vite-plugin-svgr'

// Same shim the app build uses (see app/vite.config.ts): the private
// `@higgsfield-ai/icons` package isn't on public npm, so tests resolve it
// to the Material Symbols shim too.
const QUANTA_ICONS_SHIM = fileURLToPath(
  new URL('../../src/lib/quanta-material-icons.ts', import.meta.url),
)

// Same svgr options as app/vite.config.ts: Material Symbols SVGs become inline
// <svg> React components sized 1em with fill=currentColor.
const svgrPlugin = svgr({
  svgrOptions: {
    icon: true,
    svgProps: { fill: 'currentColor' },
    svgoConfig: {
      plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
    },
  },
})

// vitest 4 runs on its own Vite 8 (Rolldown), while vite-plugin-svgr does
// `import('vite')` and gets the app's Vite 7, which has no `transformWithOxc`.
// svgr picks the Oxc path when `this.meta.rolldownVersion` is set, so hide it
// and let svgr compile the JSX with Vite 7's `transformWithEsbuild` instead.
type SvgrLoad = (this: unknown, id: string) => Promise<unknown>
const svgrForVitest = {
  ...svgrPlugin,
  load(id: string) {
    return (svgrPlugin.load as unknown as SvgrLoad).call({ meta: {} }, id)
  },
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'codegen',
          environment: 'node',
          include: ['scripts/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'runtime',
          environment: 'happy-dom',
          include: ['src/runtime/**/*.test.ts'],
        },
      },
      {
        // The shim imports Material Symbols SVGs as React components (`?react`),
        // exactly like the app build does.
        plugins: [svgrForVitest],
        resolve: {
          alias: [{ find: /^@higgsfield-ai\/icons(\/.*)?$/, replacement: QUANTA_ICONS_SHIM }],
        },
        test: {
          name: 'components',
          environment: 'happy-dom',
          include: ['src/components/**/*.test.tsx'],
          setupFiles: ['./src/test/setup-components.ts'],
          alias: {
            'use-sync-external-store/shim/with-selector':
              'use-sync-external-store/shim/with-selector.js',
            'use-sync-external-store/shim': 'use-sync-external-store/shim/index.js',
            'use-sync-external-store/with-selector': 'use-sync-external-store/with-selector.js',
          },
          server: {
            deps: {
              inline: [/use-sync-external-store/, /@base-ui\/react/],
            },
          },
        },
      },
    ],
  },
})
