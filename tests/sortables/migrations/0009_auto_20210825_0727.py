# Generated by Django 3.2.6 on 2021-08-25 07:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sortables', '0008_auto_20210825_0620'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='djangotreequeriesnode',
            options={'ordering': ('position',), 'verbose_name': 'Django Tree Queries', 'verbose_name_plural': 'Django Tree Queries'},
        ),
        migrations.RenameField(
            model_name='djangotreequeriesnode',
            old_name='order',
            new_name='position',
        ),
    ]