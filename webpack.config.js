module.exports = {
  devtool: 'source-map',
  mode: 'development',

  entry: {
    GameGUI: './src/index.js',
  },

  output: {
    library: '[name]',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    filename: '[name].js',
  },

  stats: {
    warnings:false
  },
  watch: true,
};