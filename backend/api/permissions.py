from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """
    Custom permission to only allow staff users to edit inventory.
    """

    def has_permission(self, request, view):
        # Allow access only if the user is authenticated and is staff
        return request.user and request.user.is_authenticated and request.user.is_staff