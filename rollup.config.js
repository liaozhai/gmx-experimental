import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-porter';
import pkg from './package.json';

const extensions = [
  '.js', '.jsx', '.ts', '.tsx', '.css'
];

const name = 'GMX';

export default [
    {
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
    },
    {
        input: './src/renderer.ts',
        output: [            
            {
                file: 'public/renderer.js',
                format: 'iife',
                name: 'Renderer',
                sourcemap: true,
            }
        ],
        external: [],
        plugins: [    
            resolve({ extensions }),
            commonjs(),            
            babel({
                extensions,
                babelHelpers: 'bundled',
                include: ['src/**/*'],
            }),
        ],    
    },
    {
<<<<<<< HEAD
        input: './src/filter.ts',
        output: [            
            {
                file: 'public/filter.js',
                format: 'iife',
                name: 'Filter',
=======
        input: './src/dataManager.ts',
        output: [            
            {
                file: 'public/dataManager.js',
                format: 'iife',
                name: 'DataManager',
>>>>>>> 35d70c10fd430b77e5d1e526817c813fb38641bf
                sourcemap: true,
            }
        ],
        external: [],
        plugins: [    
            resolve({ extensions }),
            commonjs(),            
            babel({
                extensions,
                babelHelpers: 'bundled',
                include: ['src/**/*'],
            }),
        ],    
    },
];