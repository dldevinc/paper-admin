# Generated by Django 2.1.15 on 2021-05-21 10:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sortables', '0003_company_order'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanyIndustry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0, editable=False, verbose_name='order')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='industry', to='sortables.Company')),
            ],
        ),
        migrations.CreateModel(
            name='Industry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='title')),
            ],
        ),
        migrations.AddField(
            model_name='companyindustry',
            name='industry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='companies', to='sortables.Industry'),
        ),
    ]