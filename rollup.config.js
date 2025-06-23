import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
export default [
  {
    input: 'src/index.ts',
    output: [
      //  CommonJS格式 (Node.js)
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      // ES模块格式 (浏览器/现代Node.js)
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      nodeResolve(), // 解析第三方依赖
      commonjs(),    // 转换CommonJS为ES模块
      typescript(),  // 处理TypeScript
      // terser()       // 压缩代码（生产环境）
    ]
  },
];