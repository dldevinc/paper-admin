# Change Log

## [6.0.0](https://github.com/dldevinc/paper-admin/tree/v6.0.0) - 2023-03-13

### ⚠ BREAKING CHANGES

-   Migrated from Font Awesome to Bootstrap Icons.
-   `paper_admin.menu` module has been completely rewritten. The new `Item` class is used
    to create menu items. See [documentation](https://github.com/dldevinc/paper-admin/blob/master/README.md#Admin-menu)
    for details.
-   Dropped Python 3.6 support.

### Features

-   `PAPER_MENU_PERM_STAFF` setting was renamed to `PAPER_MENU_STAFF_PERMISSION`.
-   `PAPER_MENU_PERM_SUPERUSER` setting was renamed to `PAPER_MENU_SUPERUSER_PERMISSION`.
-   `PAPER_MENU_HIDE_SINGLE_CHILD` setting was renamed to `PAPER_MENU_COLLAPSE_SINGLE_CHILDS`.
-   Added `PAPER_NONE_PLACEHOLDER` constant for representing `None` value in admin filters.
-   Animations has been migrated from GSAP to AnimeJS.
-   Improved form tab user experience in admin interface.
-   Added `HierarchyFilter`, `RelatedOnlyFieldListFilter` and `EmptyFieldListFilter`.
-   Added a button to generate a new UUID value in the `UUIDField` widget.
-   The value of the `rows` attribute for the `AdminTextarea` widget has been reduced to `2`.
-   Allow the user to enter a date directly into the [flatpickr](https://flatpickr.js.org/) input field.

## [5.0.0](https://github.com/dldevinc/paper-admin/tree/v5.0.0) - 2022-11-30

### ⚠ BREAKING CHANGES

-   The `Widget` JavaScript class has been completely rewritten and now uses
    `MutationObserver`.

### Features

-   Add Python 3.11 support (no code changes were needed, but now we test this release).

## [4.4.0](https://github.com/dldevinc/paper-admin/tree/v4.4.0) - 2022-11-15

### Features

-   Add `--spacer`, `--border-radius` and `--border-radius-lg` CSS variables
    for use in plugins.
-   Update `ru` locale.

## [4.3.3](https://github.com/dldevinc/paper-admin/tree/v4.3.3) - 2022-11-02

### Features

-   Migrate to ES6 classes.
-   Remove runtime chunk.

## [4.3.2](https://github.com/dldevinc/paper-admin/tree/v4.3.2) - 2022-09-19

### Bug Fixes

-   Fix creation and deletion objects with `ForeignKeyRawIdWidget`.

## [4.3.1](https://github.com/dldevinc/paper-admin/tree/v4.3.1) - 2022-09-06

### Bug Fixes

-   Fixed "Save and continue" buttons.

## [4.3.0](https://github.com/dldevinc/paper-admin/tree/v4.3.0) - 2022-09-06

### Features

-   Added ability to change default django admin widgets via changing
    `FORMFIELD_FOR_DBFIELD_DEFAULTS`.

## [4.2.0](https://github.com/dldevinc/paper-admin/tree/v4.2.0) - 2022-09-06

### Features

-   Allowed multiple popups for self-related fields in admin.
-   Allowed admin select widgets to display new related objects.
-   Prevented double submission of admin forms.
-   Changed sorting icon.

### Bug Fixes

-   Fixed an issue with password change form widgets in admin interface.
-   Fixed an issue when deletion popup is not closing.

## [4.1.6](https://github.com/dldevinc/paper-admin/tree/v4.1.6) - 2022-08-15

### Bug Fixes

-   Fixed admin user form.

## [4.1.5](https://github.com/dldevinc/paper-admin/tree/v4.1.5) - 2022-08-15

### Features

-   Updated dependencies.

## [4.1.4](https://github.com/dldevinc/paper-admin/tree/v4.1.4) - 2022-07-04

### Bug Fixes

-   Added a space between the search block and the actions selectbox on mobile devices.

## [4.1.3](https://github.com/dldevinc/paper-admin/tree/v4.1.3) - 2022-06-23

### Bug Fixes

-   Fixed an issue with the wrong order of inline forms.

## [4.1.2](https://github.com/dldevinc/paper-admin/tree/v4.1.2) - 2022-06-21

### Bug Fixes

-   Fixed an issue where inline forms were not sortable.

## [4.1.1](https://github.com/dldevinc/paper-admin/tree/v4.1.1) - 2022-05-23

### Features

-   Added support for [search_help_text](https://docs.djangoproject.com/en/dev/ref/contrib/admin/#django.contrib.admin.ModelAdmin.search_help_text).

## [4.1.0](https://github.com/dldevinc/paper-admin/tree/v4.1.0) - 2022-05-23

### ⚠ BREAKING CHANGES

-   Renamed `ondrag` CSS class to `on-drag-file`.

### Features

-   Added `paperAdmin.dragUtils`.

## [4.0.3](https://github.com/dldevinc/paper-admin/tree/v4.0.3) - 2022-05-13

### Features

-   `post_office` patch package is now deprecated and will be removed in a future release.
    The `post-office` libarary considered too specific to be included in `paper-admin`.
-   Minor styling changes.

## [4.0.2](https://github.com/dldevinc/paper-admin/tree/v4.0.2) - 2022-04-19

### Bug Fixes

-   Update npm packages.

## [4.0.1](https://github.com/dldevinc/paper-admin/tree/v4.0.1) - 2022-03-16

### Features

-   Redirect to changelist after deleting an object with read-only permissions.
    By default, such redirect occurs only when `has_change_permission()` returned `True`.

## [4.0.0](https://github.com/dldevinc/paper-admin/tree/v4.0.0) - 2022-02-22

### Bug Fixes

-   Fixed form renderer issue with Django 4.0

## [4.0.0rc1](https://github.com/dldevinc/paper-admin/tree/v4.0.0rc1) - 2022-01-18

### ⚠ BREAKING CHANGES

-   Removed support for deprecated `NullBooleanField`.

### Features

-   Added support for Python 3.10, Django 4.0
-   Use `sass:math`.

### Bug Fixes

-   Fixed `paper_admin.patches.post_office`.
-   Fixed `autocomplete_fields` in Django 3.2

## [3.2.0](https://github.com/dldevinc/paper-admin/tree/v3.2.0) - 2021-11-26

### Features

-   Update to Bootstrap 4.6.1

## [3.1.2](https://github.com/dldevinc/paper-admin/tree/v3.1.2) - 2021-10-15

### Bug Fixes

-   Fixed "Select all" link on changelist page.

## [3.1.1](https://github.com/dldevinc/paper-admin/tree/v3.1.1) - 2021-10-15

### Bug Fixes

-   Fixed "Select all" link on changelist page.

## [3.1.0](https://github.com/dldevinc/paper-admin/tree/v3.1.0) - 2021-08-25

### Features

-   Switched from Travis CI to GitHub actions.
-   Added support for [django-tree-queries](https://github.com/matthiask/django-tree-queries).

## [3.0.4](https://github.com/dldevinc/paper-admin/tree/v3.0.4) - 2021-08-20

### Features

-   Use improved version of `multi.js`.

## [3.0.3](https://github.com/dldevinc/paper-admin/tree/v3.0.3) - 2021-08-18

### Bug Fixes

-   Fix missing translations.

## [3.0.2](https://github.com/dldevinc/paper-admin/tree/v3.0.2) - 2021-08-18

### Features

-   New `PAPER_LOCALE_PACKAGES` setting was added.
-   Added `ru-RU` translation.

## [3.0.1](https://github.com/dldevinc/paper-admin/tree/v3.0.1) - 2021-08-17

-   Update npm dependencies

## [3.0.0](https://github.com/dldevinc/paper-admin/tree/v3.0.0) - 2021-07-10

### ⚠ BREAKING CHANGES

Much of the code has been rewritten. We outline some key changes below.

-   Drop support for Django versions before 2.2.
-   `django-logentry-admin` dependency has been removed.
-   `CustomCheckboxInput` widget has been renamed to `AdminCheckboxInput`.
-   `CustomRadioSelect` widget has been renamed to `AdminRadioSelect`.
-   `CustomCheckboxSelectMultiple` widget has been renamed to `AdminCheckboxSelectMultiple`.
-   `SortableAdminBaseMixin`, `SortableInlineBaseMixin`, `SortableStackedInline`,
    `SortableTabularInline` and `SortableAdminMixin` have been removed. Just add `sortable`
    property to your regular admin models.
-   `PAPER_SUPPORT_PHONE`, `PAPER_SUPPORT_EMAIL`, `PAPER_SUPPORT_COMPANY` and
    `PAPER_SUPPORT_WEBSITE` settings have been removed. Override `paper_admin/footer.html`
    template to set your contact information.
-   Date range filter has been added.

### Features

-   Added patch for `django-logentry-admin`.
-   Added `PAPER_FAVICON` setting.
-   Added autofocus on login page.
-   Updated fonts.

## [2.0.0](https://github.com/dldevinc/paper-admin/tree/v2.0.0) - 2021-04-12

### ⚠ BREAKING CHANGES

-   Add `select2` to all select boxes.
-   Drop Django 2.0 support.

### Features

-   Added the `ModelAdmin.object_history` option to disable a "History" button on admin change forms.
-   Added custom `SimpleListFilter`.
-   Allow use of `staff` keyword in menu permissions.
-   Allow use of user-supplied callable as `perms` in `PAPER_MENU`.
-   Enlarge changelist pagination.
-   Autofocus "Yes"-button on delete confirmation pages.

### Bug Fixes

-   Use `{% trans %}` instead of `{% translate %}` for cmpatibility.
-   Removed the `capfirst` filter from changeform page title.
-   Fixed issue with missing `gettext` catalogs.

## [1.1.5](https://github.com/dldevinc/paper-admin/tree/v1.1.5) - 2021-03-06

-   Use Bootstrap v4.6.0
-   Patch `select2.js` to get rid of the jump effect after ajax load.
-   Fix leakage of menu items into internal elements.

## [1.1.4](https://github.com/dldevinc/paper-admin/tree/v1.1.4) - 2021-02-24

-   Add [django-autocomplete-light](https://github.com/yourlabs/django-autocomplete-light) patch

## [1.1.3](https://github.com/dldevinc/paper-admin/tree/v1.1.3) - 2021-02-19

-   Rollback implicit form renderer for `ActionForm`
-   Add [django-post-office](https://github.com/dldevinc/django-post_office) patch

## [1.1.2](https://github.com/dldevinc/paper-admin/tree/v1.1.2) - 2021-02-17

-   Fix for custom `FORM_RENDERER`

## [1.1.1](https://github.com/dldevinc/paper-admin/tree/v1.1.1) - 2021-02-09

-   Add "View site" link

## [1.1.0](https://github.com/dldevinc/paper-admin/tree/v1.1.0) - 2021-02-09

-   Update deps
-   Rewrite `inlines.js`
-   Check `has_delete_permission` for inline forms
-   Add "Clear all filters" button

## [1.0.4](https://github.com/dldevinc/paper-admin/tree/v1.0.4) - 2020-10-20

-   Fix form dropdowns

## [1.0.3](https://github.com/dldevinc/paper-admin/tree/v1.0.3) - 2020-10-19

-   Fix static files

## [1.0.0](https://github.com/dldevinc/paper-admin/tree/v1.0.0) - 2020-10-19

-   Enlarge form controls
-   Update `npm` deps

## [0.0.16](https://github.com/dldevinc/paper-admin/tree/v0.0.16) - 2020-09-15

-   Hotfix missing static files and templates

## [0.0.15](https://github.com/dldevinc/paper-admin/tree/v0.0.15) - 2020-09-15

-   Add Django 3.1 support
-   Update development environment
