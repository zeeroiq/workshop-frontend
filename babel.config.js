module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: ['> 1%', 'last 2 versions'],
                },
                modules: false, // Let Webpack handle module bundling
            },
        ],
        [
            '@babel/preset-react',
            {
                runtime: 'automatic', // Automatically import React when needed (React 17+)
            },
        ],
    ],
    env: {
        development: {
            plugins: [],
        },
        production: {
            plugins: [],
        },
    },
};