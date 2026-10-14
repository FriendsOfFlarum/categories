import bootstrapAdmin from '@flarum/jest-config/src/bootstrap/admin';
import app from 'flarum/admin/app';
import BasicsPage from 'flarum/admin/components/BasicsPage';
import extractText from 'flarum/common/utils/extractText';
import adminExtend from '../../../src/admin/extend';
import loadTranslations from '../../translations';
import '../../../src/admin';

beforeAll(() => {
  bootstrapAdmin();
  app.bootExtensions({ 'fof-categories': { extend: adminExtend as any } });
  loadTranslations(app.translator);
  app.boot();
});

const settings = () => app.registry.getSettings('fof-categories')!;

describe('the settings page', () => {
  it('has a switch for each setting, in order', () => {
    const switches = settings().filter((setting: any) => typeof setting !== 'function');

    expect(switches.map((setting: any) => setting.setting)).toEqual([
      'fof-categories.keep-tags-nav',
      'fof-categories.full-page-desktop',
      'fof-categories.compact-mobile',
      'fof-categories.parent-remove-icon',
      'fof-categories.parent-remove-description',
      'fof-categories.parent-remove-stats',
      'fof-categories.parent-remove-last-discussion',
      'fof-categories.child-bare-icon',
      'fof-categories.small-forum-optimized',
    ]);
    expect(switches.every((setting: any) => setting.type === 'switch')).toBe(true);
  });

  it('labels every switch from the locale', () => {
    for (const setting of settings().filter((setting: any) => typeof setting !== 'function') as any[]) {
      expect(extractText(setting.label)).not.toMatch(/^fof-categories\./);
    }
  });

  it('groups the switches under headings', () => {
    const order = settings().map((setting: any) => (typeof setting === 'function' ? extractText(setting().children) : setting.setting));

    expect(order).toEqual([
      'Navigation',
      'fof-categories.keep-tags-nav',
      'Layout',
      'fof-categories.full-page-desktop',
      'fof-categories.compact-mobile',
      'Parent Category Display',
      'fof-categories.parent-remove-icon',
      'fof-categories.parent-remove-description',
      'fof-categories.parent-remove-stats',
      'fof-categories.parent-remove-last-discussion',
      'Child Category Display',
      'fof-categories.child-bare-icon',
      'Performance',
      'fof-categories.small-forum-optimized',
    ]);
  });
});

describe('the basics page', () => {
  it('offers the categories page as the home page', () => {
    const item = BasicsPage.homePageItems().get('categories') as any;

    expect(item.path).toBe('/categories');
    expect(extractText(item.label)).toBe('Categories');
  });
});
