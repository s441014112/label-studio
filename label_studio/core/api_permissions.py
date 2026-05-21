from rest_framework.permissions import SAFE_METHODS, BasePermission


##
# 控制用户能不能访问 / 修改某个具体的数据对象
##

class HasObjectPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        #查单个对象的权限（比如查看 / 修改某条数据）
        return obj.has_permission(request.user)


class MemberHasOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        #SAFE_METHODS：安全方法 = GET, HEAD, OPTIONS（只查不改），这边如果是 修改、删除、新增 操作并且 用户没有自己的组织（不是管理员 / 所有者）直接拒绝！不让修改！
        if request.method not in SAFE_METHODS and not request.user.own_organization:
            return False
        ##查单个对象的权限（比如查看 / 修改某条数据）
        return obj.has_permission(request.user)





