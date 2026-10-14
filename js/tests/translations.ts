import flatten from 'flat';
import jsYaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import type Translator from 'flarum/common/Translator';

/**
 * Add this extension's English translations, so tests catch keys missing from the locale.
 */
export default function loadTranslations(translator: Translator): void {
  const locale = path.resolve(process.cwd(), '../resources/locale/en.yml');
  const translations = flatten(jsYaml.load(fs.readFileSync(locale, 'utf8')) as object) as Record<string, string>;

  // `=> key` references are resolved by the backend when it compiles the locale.
  for (const [key, value] of Object.entries(translations)) {
    if (value.startsWith('=> ')) translations[key] = translations[value.slice(3)];
  }

  translator.addTranslations(translations);
}
