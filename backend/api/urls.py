from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, current_user_profile, get_packages_with_same_create_date, get_oldest_package_date, OrderHistoryCreateView, get_packages_details

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'care-packages', views.CarePackageViewSet, basename='care-package')


urlpatterns = [
    path('profile/', views.current_user_profile, name='current_user_profile'),
    path('inventory/', views.InventoryListCreate.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroy.as_view(), name='inventory-detail'),
    path('inventory/update_quantity/<int:pk>/', views.UpdateProductQuantity.as_view(), name='update-product-quantity'),
    path('dashboard/', views.InventoryCategorySummary.as_view(), name='inventory-category-summary'),
    path('inventory/update/<int:pk>/', views.update_product, name='update_product'),
    
    path('package', get_packages_details, name='get_package_details'),
    #path('packages/same-issue-date/', views.get_packages_with_same_issue_date, name='packages_same_issue_date'),
    # path('care-package', views.get_packages_with_same_issue_date, name='packages_same_issue_date'),
    path('care-packages/oldest-package-date/', views.get_oldest_package_date),
    path('care-packages/same-create-date/', views.get_packages_with_same_create_date, name='packages-same-create-date'),
    path('order-history/create/', OrderHistoryCreateView.as_view(), name='order-history-create'),
    path('care-packages/<int:pk>/delete/', views.CarePackageDeleteView.as_view(), name='care-package-delete'),

    # path('care-package', views.get_packages_with_same_issue_date, name='packages_same_issue_date'),
    # path('create-care-package/', views.CarePackageViewSet.as_view(), name='create-care-package'),
    path('', include(router.urls)),
]