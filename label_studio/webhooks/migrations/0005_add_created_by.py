from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('webhooks', '0004_auto_20221221_1101'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='webhook',
            name='created_by',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=models.SET_NULL, related_name='webhooks', to=settings.AUTH_USER_MODEL, verbose_name='created by'),
        ),
    ]
