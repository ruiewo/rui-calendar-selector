module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  length: 150,
  overrides: [
    {
      files: ['*.md'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
