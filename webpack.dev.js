const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
            publicPath: '/',
            watch: true,
        },
        hot: true,
        host: '0.0.0.0',
        port: 3000,
        open: true,
        historyApiFallback: {
            disableDotRule: true,
            index: '/'
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
            logging: 'info',
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
        // Add this to handle URI encoding issues
        onBeforeSetupMiddleware: function (devServer) {
            devServer.app.get('*', function (req, res, next) {
                try {
                    decodeURIComponent(req.path);
                    next();
                } catch (err) {
                    // Handle malformed URIs by serving index.html
                    res.sendFile(path.join(__dirname, 'public', 'index.html'));
                }
            });
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    plugins: [
        new Dotenv({
            path: './.env.development',
        }),
    ],
});