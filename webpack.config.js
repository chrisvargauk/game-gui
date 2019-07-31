module.exports = {
  devtool: 'source-map',
  mode: 'development',

  entry: {
    GameGUI: './src/GameGUI.js',
  },

  output: {
    library: '[name]',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    filename: '[name].js',
  }

};