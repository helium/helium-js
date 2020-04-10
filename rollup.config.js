import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: ['**/__tests__/**', '*.spec.ts'],
      clean: true,
    }),
    commonjs({
      // dynamicRequireTargets: [
      //   'src/transactions/proto/build/**/*'
      // ],
      include: ['node_modules/**', 'src/transactions/proto/build/**'],
    }),
    copy({
      targets: [
        {
          src: 'src/transactions/proto/*.proto',
          dest: 'build/transactions/proto',
        },
        {
          src: 'src/transactions/proto/defs/*.proto',
          dest: 'build/transactions/proto/defs',
        },
      ],
    }),
    json(),
  ],
}
