# Change Log

## [3.1.2](https://github.com/dldevinc/paper-admin/tree/v3.1.2) - 2021-10-15
### Bug Fixes
- Fixed "Select all" link on changelist page.

## [3.1.1](https://github.com/dldevinc/paper-admin/tree/v3.1.1) - 2021-10-15
### Bug Fixes
- Fixed "Select all" link on changelist page.

## [3.1.0](https://github.com/dldevinc/paper-admin/tree/v3.1.0) - 2021-08-25
### Features
- Switched from Travis CI to GitHub actions.
- Added support for [django-tree-queries](https://github.com/matthiask/django-tree-queries).

## [3.0.4](https://github.com/dldevinc/paper-admin/tree/v3.0.4) - 2021-08-20
### Features
- Use improved version of `multi.js`.

## [3.0.3](https://github.com/dldevinc/paper-admin/tree/v3.0.3) - 2021-08-18
### Bug Fixes
- Fix missing translations.

## [3.0.2](https://github.com/dldevinc/paper-admin/tree/v3.0.2) - 2021-08-18
### Features
- New `PAPER_LOCALE_PACKAGES` setting was added.
- Added `ru-RU` translation.

## [3.0.1](https://github.com/dldevinc/paper-admin/tree/v3.0.1) - 2021-08-17
- Update npm dependencies


## [3.0.0](https://github.com/dldevinc/paper-admin/tree/v3.0.0) - 2021-07-10
### ⚠ BREAKING CHANGES
Much of the code has been rewritten. We outline some key changes below.

- Drop support for Django versions before 2.2.
- `django-logentry-admin` dependency has been removed.
- `CustomCheckboxInput` widget has been renamed to `AdminCheckboxInput`.
- `CustomRadioSelect` widget has been renamed to `AdminRadioSelect`.
- `CustomCheckboxSelectMultiple` widget has been renamed to `AdminCheckboxSelectMultiple`.
- `SortableAdminBaseMixin`, `SortableInlineBaseMixin`, `SortableStackedInline`, 
  `SortableTabularInline` and `SortableAdminMixin` have been removed. Just add `sortable`
  property to your regular admin models.
- `PAPER_SUPPORT_PHONE`, `PAPER_SUPPORT_EMAIL`, `PAPER_SUPPORT_COMPANY` and
  `PAPER_SUPPORT_WEBSITE` settings have been removed. Override `paper_admin/footer.html`
  template to set your contact information.
- Date range filter has been added.
### Features
- Added patch for `django-logentry-admin`.
- Added `PAPER_FAVICON` setting.
- Added autofocus on login page.
- Updated fonts.

## [2.0.0](https://github.com/dldevinc/paper-admin/tree/v2.0.0) - 2021-04-12
### ⚠ BREAKING CHANGES
- Add `select2` to all select boxes.
- Drop Django 2.0 support.
### Features
- Added the `ModelAdmin.object_history` option to disable a "History" button on admin change forms.
- Added custom `SimpleListFilter`.
- Allow use of `staff` keyword in menu permissions. 
- Allow use of user-supplied callable as `perms` in `PAPER_MENU`.
- Enlarge changelist pagination.
- Autofocus "Yes"-button on delete confirmation pages.
### Bug Fixes
- Use `{% trans %}` instead of `{% translate %}` for cmpatibility.
- Removed the `capfirst` filter from changeform page title.
- Fixed issue with missing `gettext` catalogs.

## [1.1.5](https://github.com/dldevinc/paper-admin/tree/v1.1.5) - 2021-03-06
- Use Bootstrap v4.6.0
- Patch `select2.js` to get rid of the jump effect after ajax load. 
- Fix leakage of menu items into internal elements.

## [1.1.4](https://github.com/dldevinc/paper-admin/tree/v1.1.4) - 2021-02-24
- Add [django-autocomplete-light](https://github.com/yourlabs/django-autocomplete-light) patch

## [1.1.3](https://github.com/dldevinc/paper-admin/tree/v1.1.3) - 2021-02-19
- Rollback implicit form renderer for `ActionForm`
- Add [django-post-office](https://github.com/dldevinc/django-post_office) patch

## [1.1.2](https://github.com/dldevinc/paper-admin/tree/v1.1.2) - 2021-02-17
- Fix for custom `FORM_RENDERER`

## [1.1.1](https://github.com/dldevinc/paper-admin/tree/v1.1.1) - 2021-02-09
- Add "View site" link

## [1.1.0](https://github.com/dldevinc/paper-admin/tree/v1.1.0) - 2021-02-09
- Update deps
- Rewrite `inlines.js`
- Check `has_delete_permission` for inline forms
- Add "Clear all filters" button

## [1.0.4](https://github.com/dldevinc/paper-admin/tree/v1.0.4) - 2020-10-20
- Fix form dropdowns

## [1.0.3](https://github.com/dldevinc/paper-admin/tree/v1.0.3) - 2020-10-19
- Fix static files

## [1.0.0](https://github.com/dldevinc/paper-admin/tree/v1.0.0) - 2020-10-19
- Enlarge form controls
- Update `npm` deps

## [0.0.16](https://github.com/dldevinc/paper-admin/tree/v0.0.16) - 2020-09-15
- Hotfix missing static files and templates

## [0.0.15](https://github.com/dldevinc/paper-admin/tree/v0.0.15) - 2020-09-15
- Add Django 3.1 support
- Update development environment
