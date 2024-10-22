import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ["client/src/extension.ts", "server/src/server.ts"],
  format: ['cjs'],
  shims: true,
  dts: false,
  external: [
    'vscode',
  ],
})