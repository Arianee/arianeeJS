const path = require('path');

const browserConfig = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'ArianeeLib'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
  ]
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    browserConfig.watch = true;
  }

  return browserConfig;
}
