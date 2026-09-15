import { test as base, expect } from '@playwright/test';
import { runCLI } from '@wp-playground/cli';
import type { RunCLIServer } from '@wp-playground/cli';
import { mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

type PlaygroundOptions = {
	wpVersion: string;
};

type PlaygroundFixtures = {
	playgroundServer: RunCLIServer;
	wpBaseUrl: string;
	screenshotDir: string;
	runPhp: ( code: string ) => Promise< string >;
};

export const test = base.extend< PlaygroundFixtures & PlaygroundOptions >( {
	// Overridden per project by playwright.config.ts. Must stay at or above the
	// plugin's `Requires at least`, or the blueprint cannot activate it and
	// every spec fails before it reaches an assertion.
	wpVersion: [ '7.1', { option: true } ],

	playgroundServer: [
		async ( { wpVersion }, use ) => {
			const blueprintPath = resolve(
				__dirname,
				'../../../blueprint.json'
			);
			const blueprint = JSON.parse(
				readFileSync( blueprintPath, 'utf8' )
			);
			const pluginRoot = resolve( __dirname, '../../../' );

			const server: RunCLIServer = await runCLI( {
				command: 'server',
				wp: wpVersion,
				php: '8.2',
				mount: [
					{
						hostPath: pluginRoot,
						vfsPath:
							'/wordpress/wp-content/plugins/post-type-spotlight',
					},
				],
				blueprint,
				quiet: true,
			} );

			await use( server );

			await server.server.close();
		},
		/*
		 * Generous because the first boot of a run downloads WordPress and the
		 * PHP-WASM runtime before it serves anything. A warm boot takes two or
		 * three seconds; a cold one was measured at 125 seconds on a laptop and
		 * is slower again on a loaded machine. At 90 seconds the first test of a
		 * run failed on the fixture while every test after it passed in under
		 * four, which reads as a broken feature rather than a cold cache.
		 *
		 * This is a ceiling, not a reservation: a boot that finishes in two
		 * seconds still takes two.
		 */
		{ timeout: 300_000 },
	],

	wpBaseUrl: async ( { playgroundServer }, use ) => {
		await use( playgroundServer.serverUrl );
	},

	/*
	 * Run PHP inside the Playground instance with WordPress loaded.
	 *
	 * Lets a spec assert on real WordPress state — which posts carry the
	 * hidden `pts_feature_tax` term, say — rather than on what a screen
	 * happens to render.
	 */
	runPhp: async ( { playgroundServer }, use ) => {
		await use( async ( code: string ) => {
			const result = await playgroundServer.playground.run( {
				code: `<?php require_once '/wordpress/wp-load.php'; ${ code }`,
			} );

			return result.text;
		} );
	},

	screenshotDir: async ( {}, use, testInfo ) => {
		const dir = resolve(
			__dirname,
			`../../../test-results/screenshots/${ testInfo.project.name }`
		);
		mkdirSync( dir, { recursive: true } );
		await use( dir );
	},
} );

export { expect };
