from django.shortcuts import render
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view

from .serializers import UserSerializer, ProfileSerializer, InventorySerializer, CarePackageSerializer, CarePackageItemSerializer
from .models import Inventory, Package, CarePackage, CarePackageItem

import base64
from rest_framework.views import APIView
from .permissions import IsStaffUser
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

class CreatePackageView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            # Extract data from the request
            pickup_location = data.get("pickup_location")
            contents = data.get("contents")

            # Validate input
            if not pickup_location or not contents:
                return Response({"error": "Missing pickup_location or contents"}, status=status.HTTP_400_BAD_REQUEST)

            # Create the package
            package = Package.objects.create(
                pickup_location=pickup_location,
                contents=contents
            )

            # Return the created package's data
            return Response({
                "id": package.id,
                "issue_date": package.issue_date,
                "pickup_location": package.pickup_location,
                "contents": package.contents,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@csrf_exempt
def get_package_details(request):
    try:
        if request.method == "GET":
            # Get the package with the oldest issue date
            oldest_package = Package.objects.order_by('issue_date').first()
            
            if oldest_package:
                # Return the details of the oldest package
                return JsonResponse({
                    "id": oldest_package.id,
                    "issue_date": oldest_package.issue_date,
                    "pickup_location": oldest_package.pickup_location,
                    "contents": oldest_package.contents,
                }, status=200)
            else:
                return JsonResponse({"message": "No packages found"}, status=404)

        return JsonResponse({"error": "Invalid HTTP method"}, status=405)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def get_packages_with_same_issue_date(request):
    try:
        if request.method == "GET":
            # Get the oldest package by issue date
            oldest_package = Package.objects.order_by('issue_date').first()
            
            if not oldest_package:
                return JsonResponse({"message": "No packages found"}, status=404)

            # Get all packages that share the same issue date as the oldest package
            same_issue_date_packages = Package.objects.filter(issue_date=oldest_package.issue_date)

            # If no packages found with the same issue date
            if not same_issue_date_packages:
                return JsonResponse({"message": "No packages with the same issue date found."}, status=404)

            # Create a list of the package details
            packages_data = [
                {
                    "id": package.id,
                    "issue_date": package.issue_date,
                    "pickup_location": package.pickup_location,
                    "contents": package.contents,
                }
                for package in same_issue_date_packages
            ]

            # Return the packages in the response
            return JsonResponse(packages_data, safe=False, status=200)

        return JsonResponse({"error": "Invalid HTTP method"}, status=405)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Extracting user fields
        username = request.data.get("username")
        username = username.lower()
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        email = email.lower()
        photo_id = request.FILES.get("photo_id")  # Image file upload

        # Validate required fields
        if not all([username, password, first_name, last_name, email]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for username duplication
        if User.objects.filter(username__iexact=username).exists():
            return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create user and profile
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )

            # Ensure the profile is created
            if not hasattr(user, 'profile'):
                Profile.objects.create(user=user)
            
            profile = user.profile

            # Debugging: Return user and profile data for verification
            user_data = {
                "username": user.username,
                "email": user.email,
                "profile_exists": hasattr(user, 'profile'),
                "profile_photo_id": profile.photo_id if profile else None
            }
            
            if photo_id:
                # File size limit check
                if photo_id.size > 2 * 1024 * 1024:  # Limit file size to 2MB
                    return Response({"error": "File size exceeds 2MB limit."}, status=status.HTTP_400_BAD_REQUEST)

                # Ensure only image files are accepted
                if not photo_id.content_type.startswith("image/"):
                    return Response({"error": "Invalid file type. Only images are allowed."}, status=status.HTTP_400_BAD_REQUEST)

                # Save the image as binary data
                profile.photo_id = photo_id.read()  # Read binary data from uploaded image
                profile.save()

                # Return the debugging data in JSON response
                return Response({
                    "message": "User created successfully.",
                    "user_data": user_data,
                    "photo_uploaded": True
                }, status=status.HTTP_201_CREATED)

            # If no photo uploaded
            return Response({
                "message": "User created without photo.",
                "user_data": user_data,
                "photo_uploaded": False
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Return exception details as JSON
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def get_user_data(self, request):
        user = request.user

        # Handle missing profile gracefully
        try:
            user_data = {
                "username": user.username,
                "profile": {
                    "photo_base64": ProfileSerializer(user.profile).data.get("photo_base64"),
                },
            }
            return Response(user_data)
        except AttributeError:
            return Response({"error": "Profile not found for the user."}, status=status.HTTP_404_NOT_FOUND)
    
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


@api_view(['GET'])
def current_user_profile(request):
    user = request.user
    serialized_user = UserSerializer(user)
    return Response(serialized_user.data)


@api_view(['PATCH'])
def update_product(request, pk):
    try:
        product = Inventory.objects.get(pk=pk)
    except Inventory.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    # Update the fields
    serializer_product = InventorySerializer(product, data=request.data, partial=True)
    if serializer_product.is_valid():
        updated_product = serializer_product.save()

        # If quantity goes to zero, delete the product
        if updated_product.quantity == 0:
            updated_product.delete()
            return Response({'message': 'Product deleted due to quantity being 0'}, status=status.HTTP_204_NO_CONTENT)

        return Response(serializer_product.data, status=status.HTTP_200_OK)

    return Response(serializer_product.errors, status=status.HTTP_400_BAD_REQUEST)



class CarePackageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing care packages. Admins can create, update, delete, and list care packages.
    Stock is reserved upon creation, and returned if the care package is cancelled.
    """
    queryset = CarePackage.objects.all()
    serializer_class = CarePackageSerializer
    permission_classes = [IsStaffUser]

    def create(self, request, *args, **kwargs):
        """
        Create a new care package and reserve stock for the items.
        """

        care_package_quantity = request.data.get('quantity', 1)  # Default to 1 if not provided
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Transaction to ensure atomicity of stock reservation and care package creation
        with transaction.atomic():
            created_care_packages = []

            for _ in range(care_package_quantity):
                # Create CarePackage instance
                care_package = serializer.save()
                created_care_packages.append(care_package)

                # Reserve stock for each item in the care package
                for item_data in request.data.get('items', []):
                    product_id = item_data['product']
                    quantity = item_data['quantity']

                    product = Inventory.objects.get(id=product_id)

                    print (product)
                
                    if product.quantity < int(quantity):
                        raise serializers.ValidationError(
                            f"Not enough stock for {product.name}. Available: {product.quantity}, Requested: {quantity}."
                        )

                    # Create CarePackageItem
                    CarePackageItem.objects.create(
                        care_package=care_package,
                        product=product,
                        quantity=quantity
                    )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # def update(self, request, *args, **kwargs):
    #     """
    #     Update a care package and update stock quantities (reserve more or return stock).
    #     """
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)

    #     # Transaction to ensure atomicity of stock reservation or return
    #     with transaction.atomic():
    #         # Before updating, return stock for items that are no longer in the care package
    #         for old_item in instance.care_package_items.all():
    #             new_quantity = next(
    #                 (item['quantity'] for item in request.data['items'] if item['product']['id'] == old_item.product.id), 
    #                 None
    #             )
    #             if new_quantity is None:
    #                 # If item is removed, return stock
    #                 old_item.product.return_stock(old_item.quantity)
    #             elif new_quantity != old_item.quantity:
    #                 # If quantity changed, adjust stock
    #                 if new_quantity < old_item.quantity:
    #                     old_item.product.return_stock(old_item.quantity - new_quantity)
    #                 elif new_quantity > old_item.quantity:
    #                     # Reserve additional stock
    #                     old_item.product.reserve_stock(new_quantity - old_item.quantity)

    #         # Now update the care package itself
    #         self.perform_update(serializer)

    #         # Update or create CarePackageItems based on the new data
    #         new_items = {item['product']['id']: item for item in request.data['items']}
    #         for old_item in instance.care_package_items.all():
    #             if old_item.product.id in new_items:
    #                 # Update existing items
    #                 old_item.quantity = new_items[old_item.product.id]['quantity']
    #                 old_item.save()
    #                 new_items.pop(old_item.product.id)
    #             else:
    #                 # Remove the item (already handled above by returning stock)
    #                 old_item.delete()

    #         # Create any new items
    #         for new_item in new_items.values():
    #             product = Inventory.objects.get(id=new_item['product']['id'])
    #             product.reserve_stock(new_item['quantity'])
    #             CarePackageItem.objects.create(
    #                 care_package=instance,
    #                 product=product,
    #                 quantity=new_item['quantity']
    #             )

    #     return Response(serializer.data)

    # def perform_destroy(self, instance):
    #     """
    #     Delete a care package and return the reserved stock.
    #     """
    #     with transaction.atomic():
    #         # Return all reserved stock for this care package
    #         for item in instance.care_package_items.all():
    #             item.product.return_stock(item.quantity)
    #         instance.delete()

    # @action(detail=True, methods=['get'])
    # def return_stock(self, request, pk=None):
    #     """
    #     Custom action to return stock to the inventory if a care package is cancelled.
    #     """
    #     care_package = self.get_object()
    #     if care_package.status != 'Cancelled':
    #         return Response({"detail": "Care package is not cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
    #     # Return stock for all items in the care package
    #     for item in care_package.care_package_items.all():
    #         item.product.return_stock(item.quantity)

    #     return Response({"detail": "Stock successfully returned."}, status=status.HTTP_200_OK)

