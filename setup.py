#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Note: To use the 'upload' functionality of this file, you must:
#   $ pip install twine

import io
import os
import sys
from shutil import rmtree

from setuptools import setup, Command

# Package meta-data.
NAME = 'paper-admin'
DESCRIPTION = 'A django app that provides suggestions while you type into the field.'
URL = 'https://github.com/dldevinc/paper-admin'
EMAIL = 'x896321475@gmail.com'
AUTHOR = 'Mihail Mishakin'
VERSION = '0.0.4'

# What packages are required for this module to be executed?
REQUIRED = [
    'django>2.1,<3.0',
]

# What packages are optional?
EXTRAS = {
    'solo': 'django-solo>1.1,<2.0',
    'mptt': 'django-mptt>1.9,<2.0',
}

KEYWORDS = [
    'django',
    'admin',
]

# The rest you shouldn't have to touch too much :)
# ------------------------------------------------
# Except, perhaps the License and Trove Classifiers!
# If you do change the License, remember to change the Trove Classifier for that!

here = os.path.abspath(os.path.dirname(__file__))

# Import the README and use it as the long-description.
# Note: this will only work if 'README.md' is present in your MANIFEST.in file!
try:
    with io.open(os.path.join(here, 'README.md'), encoding='utf-8') as f:
        long_description = '\n' + f.read()
except FileNotFoundError:
    long_description = DESCRIPTION

# Load the package's __version__.py module as a dictionary.
about = {}
if not VERSION:
    with open(os.path.join(here, NAME, '__version__.py')) as f:
        exec(f.read(), about)
else:
    about['__version__'] = VERSION


class UploadCommand(Command):
    """Support setup.py upload."""

    description = 'Build and publish the package.'
    user_options = []

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(os.path.join(here, 'dist'))
        except OSError:
            pass

        self.status('Building Source and Wheel (universal) distribution…')
        os.system('{0} setup.py sdist bdist_wheel --universal'.format(sys.executable))

        self.status('Uploading the package to PyPI via Twine…')
        os.system('twine upload dist/*')

        self.status('Pushing git tags…')
        os.system('git tag v{0}'.format(about['__version__']))
        os.system('git push --tags')
        
        sys.exit()


# Where the magic happens:
setup(
    name=NAME,
    version=about['__version__'],
    description=DESCRIPTION,
    long_description=long_description,
    long_description_content_type='text/markdown',
    author=AUTHOR,
    author_email=EMAIL,
    url=URL,
    license='BSD',
    packages=[
        'paper_admin',
        'paper_admin.admin',
        'paper_admin.templatetags',
        'paper_admin.patches.django_solo',
        'paper_admin.patches.mptt',
        'paper_admin.patches.mptt.templatetags',
    ],
    package_data={
        'paper_admin': [
            'static/admin/*/*',
            'static/paper_admin/dist/*',
            'static/paper_admin/dist/*/*',
            'static/paper_admin/dist/*/*/*',
            'templates/*',
            'templates/*/*',
            'templates/*/*/*',
            'templates/*/*/*/*',
        ],
        'paper_admin.patches.django_solo': [
            'templates/admin/*/*',
        ],
        'paper_admin.patches.mptt': [
            'templates/admin/*',
        ],
    },
    # If your package is a single module, use this instead of 'packages':
    # py_modules=['mypackage'],

    # entry_points={
    #     'console_scripts': ['mycli=mymodule:cli'],
    # },
    install_requires=REQUIRED,
    extras_require=EXTRAS,
    tests_require=[
        'tox',
    ],
    keywords=KEYWORDS,
    include_package_data=True,
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Framework :: Django :: 2.1',
        'Framework :: Django :: 2.2',
        'Framework :: Django',
    ],
    cmdclass={
        'upload': UploadCommand,
    },
)
