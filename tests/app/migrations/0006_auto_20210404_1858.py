# Generated by Django 3.0.13 on 2021-04-04 18:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_auto_20210224_0924'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='SubCategory',
            new_name='Tree',
        ),
        migrations.AlterModelOptions(
            name='tree',
            options={'ordering': ['order'], 'verbose_name': 'tree', 'verbose_name_plural': 'tree'},
        ),
    ]
