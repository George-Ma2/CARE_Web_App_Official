from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderHistoryCreateView, get_packages_details, RegisteredStudentsView, OrderHistoryView, get_total_packages, UserOrderHistoryView, OrderConfirmationView, OrderStatusView

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'care-packages', views.CarePackageViewSet, basename='care-package')


urlpatterns = [
    path('profile/', views.current_user_profile, name='current_user_profile'),
    path('profile/update/', views.update_user_photo, name='update_photo'),
    path('inventory/', views.InventoryListCreate.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroy.as_view(), name='inventory-detail'),
    path('inventory/update_quantity/<int:pk>/', views.UpdateProductQuantity.as_view(), name='update-product-quantity'),
    path('dashboard/', views.InventoryCategorySummary.as_view(), name='inventory-category-summary'),
    path('students/', RegisteredStudentsView.as_view(), name='registered-students'),
    path('inventory/update/<int:pk>/', views.update_product, name='update_product'),
    path('package/', get_packages_details, name='get_package_details'),
    path('total-packages/', get_total_packages, name='total_packages'), 
    path('care-packages/oldest-package-date/', views.get_oldest_package_date),
    path('care-packages/same-create-date/', views.get_packages_with_same_create_date, name='packages-same-create-date'),
    path('orderhistory/', OrderHistoryView.as_view(), name='order-history'),
    path('order-history/create/', OrderHistoryCreateView.as_view(), name='order-history-create'),
    path('orderhistory/<int:pk>/status/', OrderStatusView.as_view(), name='orderhistory-status'),
    # path('order-status/', OrderStatusView.as_view(), name= 'order-status'),
    path('user/order-history/', UserOrderHistoryView.as_view(), name='user-order-history'),
    path('care-packages/<int:pk>/delete/', views.CarePackageDeleteView.as_view(), name='care-package-delete'),
    path('order-receipt/', OrderConfirmationView.as_view(), name='order-receipt'),
    path('', include(router.urls)),
    
]