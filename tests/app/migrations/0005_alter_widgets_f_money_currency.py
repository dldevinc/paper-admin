# Generated by Django 4.2.6 on 2023-11-09 11:13

from django.db import migrations
import djmoney.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_alter_pet_options_widgets_f_money_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='widgets',
            name='f_money_currency',
            field=djmoney.models.fields.CurrencyField(choices=[('EUR', 'EUR €'), ('USD', 'USD $')], default='USD', editable=False, max_length=3, null=True),
        ),
    ]
