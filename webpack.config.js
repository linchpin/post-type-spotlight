const path                 = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isDevelopment        = process.env.NODE_ENV === 'development';

module.exports = {
	mode: "production",
	entry: [
		path.resolve( __dirname, './src/js/index.js' ),
		path.resolve( __dirname, './src/scss/editor.scss' )
	],
	devtool: "eval-source-map",
	module: {
		rules: [
			{
				test: /\.scss$/,
				include: [
					path.resolve( __dirname, 'src/scss/' )
				],
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'resolve-url-loader',
					'postcss-loader',
					{
						loader: 'sass-loader',
						options: {
							implementation: require.resolve( 'sass' ),
							sourceMap: true,
						},
					},
				],
			}
		]
	},
	resolve: {
		extensions: [ '.js', '.jsx', '.scss', '.css', '.svg' ]
	},
	output: {
		path: path.resolve( __dirname, './dist' ),
		filename: 'core.js',
	},
	devServer: {
		contentBase: path.resolve( __dirname, './dist' ),
		hot: true
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: isDevelopment ? '[name].css' : '[name].css',
			chunkFilename: isDevelopment ? '[id].css' : '[id].css'
		} )
	]
};
