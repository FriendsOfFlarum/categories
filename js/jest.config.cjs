const path = require('path');
const config = require('@flarum/jest-config')();

// `ext:` imports are webpack externals, so map flarum/tags to its vendored source for tests.
const tagsDir = path.resolve(__dirname, '../vendor/flarum/tags/js');

module.exports = {
  ...config,
  roots: [...config.roots, tagsDir],
  moduleNameMapper: {
    // flarum/tags' legacy `.js` helpers, which the ESM transform can't load, whether imported via
    // `ext:` (from this extension) or by relative path (from tags' own components).
    '/common/helpers/tagLabel$': '<rootDir>/tests/stubs/tagLabel.ts',
    '/common/helpers/tagIcon$': '<rootDir>/tests/stubs/tagIcon.ts',
    '^ext:flarum/tags/(.*)$': path.join(tagsDir, 'src', '$1'),
    ...config.moduleNameMapper,
  },
};
