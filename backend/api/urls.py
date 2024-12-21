from django.urls import path
from . import views

urlpatterns = [
    # path('', views.home, name=''),
    path('notes/', views.NoteListCreate.as_view(), name='note-list'),
    path('notes/delete/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),
    path('inventory/', views.InventoryListCreate.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroy.as_view(), name='inventory-detail'),
    path('inventory/update_quantity/<int:pk>/', views.UpdateProductQuantity.as_view(), name='update-product-quantity'),
]