import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/*
 * Must satisfy the plugin's own `Requires at least`. Below it the blueprint
 * cannot activate the plugin and every spec fails on the blueprint step
 * rather than on anything it is meant to check.
 */
const wpVersions = ( process.env.WP_VERSIONS || '7.1' ).split( ',' );

export default defineConfig( {
	/*
	 * Every spec boots a whole WordPress Playground instance and then drives
	 * real page loads against PHP-WASM, which is several times slower on a
	 * hosted runner than on a laptop. Playwright's 30s default measures how
	 * busy the runner is, not whether the plugin works.
	 */
	timeout: process.env.CI ? 120_000 : 60_000,
	expect: { timeout: process.env.CI ? 30_000 : 10_000 },

	testDir: './specs',
	outputDir: path.resolve( __dirname, '../../test-results/playground' ),
	fullyParallel: false,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: process.env.CI
		? [
				[
					'html',
					{
						outputFolder: path.resolve(
							__dirname,
							'../../test-results/playwright-report'
						),
					},
				],
				[ 'github' ],
			]
		: 'line',
	use: {
		trace: 'on-first-retry',
		// Screenshots here are deliberate artifacts posted to the pull
		// request, not failure diagnostics, so the specs take them explicitly.
		screenshot: 'off',
		viewport: { width: 1280, height: 900 },
	},
	projects: wpVersions.map( ( version ) => ( {
		name: `wp-${ version.trim() }`,
		use: {
			...devices[ 'Desktop Chrome' ],
			wpVersion: version.trim(),
		},
	} ) ),
} );
