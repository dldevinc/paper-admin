# Generated by Django 2.1.15 on 2021-05-10 05:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_item_age'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='created_at',
            field=models.DateTimeField(blank=True, help_text='Lorem ipsum <b>dolor</b> sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua', null=True, verbose_name='date'),
        ),
    ]
