from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, InventorySerializer
from .models import Note, Inventory
from .permissions import IsStaffUser

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated] # Allow only user authenticated to create Note

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
class InventoryListCreate(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsStaffUser]

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class InventoryRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsStaffUser]

class InventoryCategorySummary(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Aggregate inventory quantity by category
        category_summary = (
            Inventory.objects
            .values('category')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('category')
        )
        return Response(category_summary)


class UpdateProductQuantity(APIView):
    permission_classes = [IsStaffUser]
    def patch(self, request, pk):
        try:
            product = Inventory.objects.get(pk=pk)
        except Inventory.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update the quantity of the product
        product.quantity = request.data.get('quantity', product.quantity)
        product.save()

        # Return the updated product
        return Response(InventorySerializer(product).data, status=status.HTTP_200_OK)


