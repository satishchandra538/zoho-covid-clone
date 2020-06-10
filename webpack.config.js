module.exports = {
    mode: 'production',
    entry: './script.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    devtool: "#eval-source-map",
    watch: false
}