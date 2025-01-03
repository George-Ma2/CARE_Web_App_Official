from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, current_user_profile, CreatePackageView, get_package_details, get_packages_with_same_issue_date

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('profile/', current_user_profile, name='current_user_profile'),
    path('inventory/', views.InventoryListCreate.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroy.as_view(), name='inventory-detail'),
    path('inventory/update_quantity/<int:pk>/', views.UpdateProductQuantity.as_view(), name='update-product-quantity'),
    path('create-package/', CreatePackageView.as_view(), name='create_package'),
    path('package', get_package_details, name='get_package_details'),
    path('packages/same-issue-date/', views.get_packages_with_same_issue_date, name='packages_same_issue_date')
]

