from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0012_add_iam_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='user_sid',
            field=models.BigIntegerField(blank=True, db_index=True, default=None, help_text='IAM 系统用户唯一标识', null=True, verbose_name='IAM 用户 sid'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['user_sid', 'active_organization_id'], name='htx_user_sid_organization_idx'),
        ),
    ]
