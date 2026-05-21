from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0011_user_custom_hotkeys'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_id',
            field=models.CharField(blank=True, db_index=True, default='', help_text='IAM 系统用户 id', max_length=256, verbose_name='IAM 用户 id'),
        ),
        migrations.AddField(
            model_name='user',
            name='user_sid',
            field=models.BigIntegerField(blank=True, db_index=True, default=None, help_text='IAM 系统用户唯一标识', null=True, unique=True, verbose_name='IAM 用户 sid'),
        ),
    ]
