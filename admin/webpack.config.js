/**
 * Webpack config for the admin app only.
 *
 * Kept apart from the block editor build, which runs from wp-scripts' CLI
 * flags (`--webpack-src-dir=blocks/src --output-path=blocks/build`): a config
 * file at the repository root would be picked up by that build too, and its
 * `--output-path` would then override this one's output. `npm run build:admin`
 * passes this file with `--config` instead.
 *
 * Builds into admin/build rather than build/, which is where scripts/build.sh
 * assembles the release package and is ignored by git. The plugin loads
 * admin/build at runtime, so like blocks/build it is committed.
 */
const path = require( 'path' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: {
		admin: path.resolve( __dirname, 'src/index.js' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
	plugins: [ ...defaultConfig.plugins, new RemoveEmptyScriptsPlugin() ],
};
