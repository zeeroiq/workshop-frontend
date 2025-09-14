module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: ['> 1%', 'last 2 versions'],
                },
                modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
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
        test: {
            plugins: [
                '@babel/plugin-transform-modules-commonjs'
            ]
        },
    }
};