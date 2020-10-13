import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-porter';
import pkg from './package.json';

const extensions = [
  '.js', '.jsx', '.ts', '.tsx', '.css'
];

const name = 'GMX';

export default {
    input: './src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
        {
            file: pkg.browser,
            format: 'iife',
            name,
            sourcemap: true,
        }
    ],
    external: [],
    plugins: [    
        resolve({ extensions }),
        commonjs(),            
        css({dest: 'public/main.css', minified: false}),        
        babel({
            extensions,
            babelHelpers: 'bundled',
            include: ['src/**/*'],
        }),
    ],    
};