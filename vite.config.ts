import type { UserConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tsconfigPaths from 'vite-tsconfig-paths';
import swc from 'unplugin-swc';

const path = require('path');

const config: UserConfig = {
	root: 'src/',
	publicDir: path.resolve(__dirname, 'public'),
	base: '/modules/fvtt-syrin-control/',
	server: {
		port: 9443,
		open: true,
		proxy: {
			'^(?!/modules/fvtt-syrin-control)': 'http://localhost:3000/',
			'/socket.io': {
				target: 'ws://localhost:3000',
				ws: true
			}
		}
	},
	build: {
		outDir: path.resolve(__dirname, 'dist'),
		emptyOutDir: true,
		sourcemap: true,
		lib: {
			name: 'main',
			entry: path.resolve(__dirname, 'src/main.ts'),
			formats: ['es'],
			fileName: (_format) => 'index.js'
		}
	},
	resolve: {
		alias: {
			'@lib': path.resolve(__dirname, './src/lib'),
			'@': path.resolve(__dirname, './src/syrin'),
		}
	},
	plugins: [
		tsconfigPaths(),
		swc.vite(),
		svelte({
			configFile: '../svelte.config.cjs'
		})
		// checker({
		// 	typescript: true
		// })
	]
};

export default config;
