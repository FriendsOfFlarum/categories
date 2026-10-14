const path = require('path');
const config = require('@flarum/jest-config')();

// `ext:` imports are webpack externals, so map the extensions this one uses to their vendored source for tests.
const tagsDir = path.resolve(__dirname, '../vendor/flarum/tags/js');
const realtimeDir = path.resolve(__dirname, '../vendor/flarum/realtime/js');

module.exports = {
  ...config,
  roots: [...config.roots, tagsDir, realtimeDir],
  moduleNameMapper: {
    // flarum/tags' legacy `.js` helpers, which the ESM transform can't load, whether imported via
    // `ext:` (from this extension) or by relative path (from tags' own components).
    '/common/helpers/tagLabel$': '<rootDir>/tests/stubs/tagLabel.ts',
    '/common/helpers/tagIcon$': '<rootDir>/tests/stubs/tagIcon.ts',
    '^ext:flarum/tags/(.*)$': path.join(tagsDir, 'src', '$1'),
    '^ext:flarum/realtime/(.*)$': path.join(realtimeDir, 'src', '$1'),
    ...config.moduleNameMapper,
  },
};
