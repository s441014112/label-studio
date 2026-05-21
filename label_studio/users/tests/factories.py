import factory
from organizations.models import OrganizationMember
from users.models import User

#自动批量创建「测试用户 + 自动加入组织」
#专门给单元测试、开发环境造假数据用的
#这是一个「用户生成器」，一键生成假用户，并且自动加入组织、设置活跃组织
class UserFactory(factory.django.DjangoModelFactory):
    ## 自动生成假邮箱
    email = factory.Faker('email')
    # 自动生成假名字
    first_name = factory.Faker('first_name')
    # 自动生成假姓氏
    last_name = factory.Faker('last_name')
    # 用户名 = 邮箱前缀
    username = factory.LazyAttribute(lambda u: u.email.split('@')[0])
    # 自动生成假密码
    password = factory.Faker('password')

    #指定生成哪个模型
    class Meta:
        model = User

    #自动加入组织
    @factory.post_generation
    def active_organization(self, create, extracted, **kwargs):
        if not create or not extracted:
            return
        self.active_organization = extracted
        self.save(update_fields=['active_organization'])
        OrganizationMember.objects.create(user=self, organization=extracted)
