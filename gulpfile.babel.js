'use strict';
let gulp     = require( 'gulp' );
let plugins  = require( 'gulp-load-plugins' );
let yargs    = require( 'yargs' );
let yaml     = require( 'js-yaml' );
let fs       = require( 'fs' );
let through2 = require( 'through2' );

// Load all Gulp plugins into one variable
const $ = plugins();

let PRODUCTION   = !!( yargs.argv.production ); // Check for --production flag
let VERSION_BUMP = yargs.argv.release;          // Check for --release (x.x.x semver version number)

// Load settings from settings.yml
const {COMPATIBILITY, PORT, PATHS, LOCAL_PATH, BANNERS} = loadConfig();

let sassConfig = {
	mode: (PRODUCTION ? true : false)
};

// Define default webpack object
let webpackConfig = {
	mode: (PRODUCTION ? 'production' : 'development'),
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ["@babel/preset-env"],
						compact: false
					}
				}
			}
		]
	},
	externals: {
		jquery: 'jQuery',
	},
	devtool: !PRODUCTION && 'source-map'
};

/**
 * Set production mode during the build process
 *
 * @param done
 */
function setProductionMode(done) {
	PRODUCTION            = false;
	webpackConfig.mode    = 'production';
	webpackConfig.devtool = false;
	sassConfig.production = true;
	done();
}

// Build the "dist" folder by running all the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task(
	'build:release',
	gulp.series(
		setProductionMode,
		readme,
		addWrappers,
	)
);

// Generate the changelog.md from the readme.txt
gulp.task(
	'readme',
	gulp.series(
		readme,
		addWrappers,
	)
);

// Build the site, run the server, and watch for file changes
gulp.task(
	'default',
	gulp.series(
		gulp.parallel( watch )
	)
);

/**
 * Create a README.MD file for github from the WordPress.org readme
 *
 * @since 2.3.0
 */
function readme( done ) {
	return gulp.src( ['readme.txt'] )
		.pipe( $.readmeToMarkdown( {
			details: false,
			screenshot_ext: ['jpg', 'jpg', 'png'],
			extract: {
				'changelog': 'CHANGELOG',
				'Frequently Asked Questions': 'FAQ'
			}
		} ) )
		.pipe(
			gulp.dest('./')
		);
}

function addWrappers( done ) {

	let intro = [
		'<%= BANNERS.plugin %>\n\n',
		'<%= BANNERS.build_status %> ',
		'<%= BANNERS.maintain %>\n\n',
		''].join('');

	let outro = [
		'<%= BANNERS.linchpin %>\n',
		''].join('');

	return gulp.src( ['README.md'] )
		.pipe( $.header( intro, { BANNERS : BANNERS } ) )
		.pipe( $.footer( outro, { BANNERS : BANNERS } ) )
		.pipe( gulp.dest('./') )
}

/**
 * Update the what's new template with the date of the release instead of having to manually update it every release
 *
 * @since 1.2.0
 *
 * @return {*}
 */
function getReleaseDate() {
	let today = new Date();
	let dd    = String( today.getDate() ).padStart( 2, '0' );
	let mm    = String( today.getMonth() + 1 ).padStart( 2, '0' );
	let yyyy  = today.getFullYear();

	today = mm + '/' + dd + '/' + yyyy;

	return today;
}

/**
 * Watch for changes to static assets
 * readme.txt
 *
 * @since 2.3.0
 */
function watch() {
	gulp.watch( 'readme.txt', readme );
}
