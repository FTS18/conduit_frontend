const { override, addBabelPlugin } = require('customize-cra');

module.exports = override(
    addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
    (config) => {
        // Add .mjs to the list of extensions webpack should process
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto'
        });
        return config;
    }
);
