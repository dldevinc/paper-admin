# Generated by Django 3.2.19 on 2023-08-21 10:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_person'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, verbose_name='name')),
                ('breed', models.CharField(max_length=128, verbose_name='breed')),
                ('gender', models.CharField(choices=[('male', 'Male'), ('female', 'Female')], default='male', max_length=16, verbose_name='gender')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.person', verbose_name='owner')),
            ],
        ),
    ]