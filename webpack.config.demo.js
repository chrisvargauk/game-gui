module.exports = {
  devtool: 'source-map',
  mode: 'development',

  entry: {
    Component: './src/Component.js',
    GameUI: './src/GameUI.js'
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'var',
    // `library` determines the name of the global variable
    library: '[name]'
  },

};