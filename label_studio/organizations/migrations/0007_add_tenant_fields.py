from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('organizations', '0006_alter_organizationmember_deleted_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='tenant_sid',
            field=models.BigIntegerField(blank=True, db_index=True, default=None, help_text='IAM 系统租户唯一标识', null=True, unique=True, verbose_name='租户 sid'),
        ),
        migrations.AddField(
            model_name='organization',
            name='tenant_id',
            field=models.CharField(blank=True, db_index=True, default='', max_length=256, verbose_name='租户 id'),
        ),
        migrations.AddField(
            model_name='organization',
            name='tenant_name',
            field=models.CharField(blank=True, default='', max_length=256, verbose_name='租户名称'),
        ),
    ]
