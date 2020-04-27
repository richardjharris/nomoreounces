const path = require('path');

module.exports = {
    mode: "development",
    entry: path.join(__dirname, '/lib/entry.ts'),
    output: {
        filename: "convert.bundle.js",
        path: path.resolve(__dirname, "app"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: "source-map"
}
