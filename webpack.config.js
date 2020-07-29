module.exports = {
	mode: process.env.NODE_ENV === "development" ? "development" : "production",
	devtool: process.env.NODE_ENV === "development" ? "eval-source-map" : false,
	output: {
		filename: "main.js",
	},
	resolve: {
		extensions: [".js", ".jsx"],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			// {
			// 	test: /\.css$/i,
			// 	use: ["style-loader", "css-loader"],
			// },
		],
	},
};
