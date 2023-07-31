const path                 = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isDevelopment        = process.env.NODE_ENV === 'development';

module.exports = {
	mode: "production",
	entry: [
		path.resolve( __dirname, './src/js/index.js' ),
		path.resolve( __dirname, './src/scss/editor.scss' ),
		path.resolve( __dirname, './src/scss/frontend.scss' )
	],
	devtool: "eval-source-map",
	module: {
		rules: [
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: '../fonts/',
							publicPath: '../fonts/',
						},
					},
				],
			},
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