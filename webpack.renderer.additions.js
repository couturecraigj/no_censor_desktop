const TodoWebpackPlugin = require('todo-webpack-plugin');

module.exports = {
  resolve: {
    extensions: [
      '.webpack.js',
      '.web.js',
      '.js',
      '.ts',
      '/index.ts',
      '/index.tsx',
      '.tsx',
      '.json',
      '.jsx'
    ]
  },
  // entry: "src/renderer/index.jsx",
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'eslint-loader'
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new TodoWebpackPlugin({
      console: true,
      reporter: 'markdown',
      filename: 'TODO.RENDERER.md'
    })
  ]
};
