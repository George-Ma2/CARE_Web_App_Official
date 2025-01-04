from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('profile/', views.current_user_profile, name='current_user_profile'),
    path('inventory/', views.InventoryListCreate.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroy.as_view(), name='inventory-detail'),
    path('inventory/update_quantity/<int:pk>/', views.UpdateProductQuantity.as_view(), name='update-product-quantity'),
    path('inventory/update/<int:pk>/', views.update_product, name='update_product')
]

