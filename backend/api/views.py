from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view
from .serializers import UserSerializer, ProfileSerializer, InventorySerializer, CarePackageSerializer, CarePackageItemSerializer, OrderHistorySerializer
from .models import Inventory, CarePackage, CarePackageItem
from rest_framework.exceptions import ValidationError
import base64
from rest_framework.views import APIView
from .permissions import IsStaffUser
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum


def get_oldest_package_date(request):
    """
    View to fetch the oldest package's creation date.
    """
    try:
        # Query the oldest package based on the `create_date`
        oldest_package = CarePackage.objects.order_by('created_at').first()
        
        if oldest_package:
            # Return the date in ISO format
            return JsonResponse({'oldest_date': oldest_package.created_at.isoformat()})
        else:
            # Handle the case where no packages are found
            return JsonResponse({'oldest_date': None, 'message': 'No packages found'}, status=404)
    except Exception as e:
        # Handle unexpected errors
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_packages_with_same_create_date(request):
    """
    Get all packages with the same creation date as the oldest package.
    """
    try:
        if request.method == "GET":
            # Get the package with the earliest creation date
            oldest_package = CarePackage.objects.order_by('created_at').first()

            if not oldest_package:
                return JsonResponse({"message": "No packages found."}, status=404)

            # Find all packages created on the same date
            same_date_packages = CarePackage.objects.filter(
                created_at__date=oldest_package.created_at.date()
            )
            
            # Prepare the response data
            packages_data = [
                {
                    "id": package.id,
                    "created_at": package.created_at.isoformat(),
                    "pickup_location": package.description,
                    "contents": [
                        {
                            "item_name": item.product.name,
                            "quantity": item.quantity,
                        }
                        for item in package.care_package_items.all()
                    ],
                }
                for package in same_date_packages
            ]
            return JsonResponse(packages_data, safe=False, status=200)

        return JsonResponse({"error": "Invalid HTTP method. Only GET is allowed."}, status=405)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_packages_details(request):
    """
    Get all packages with the same creation date as the oldest package.
    """
    try:
        if request.method == "GET":
            all_packages = CarePackage.objects.all()
            # Prepare the response data
            packages_data = [
                {
                    "id": package.id,
                    "created_at": package.created_at.isoformat(),
                    "delivery_date": package.delivery_date,
                    "pickup_location": package.description,
                    "contents": [
                        {
                            "item_name": item.product.name,
                            "quantity": item.quantity,
                        }
                        for item in package.care_package_items.all()
                    ],
                }
                for package in all_packages
            ]
            return JsonResponse(packages_data, safe=False, status=200)

        return JsonResponse({"error": "Invalid HTTP method. Only GET is allowed."}, status=405)
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
        # Retrieve the latest care package
        latest_package = CarePackage.objects.latest('created_at')  # Fetch the most recently created package
        latest_package_data = {
            "name": latest_package.name,
            "quantity": latest_package.quantity,
            "description": latest_package.description,
            "status": latest_package.status,
        }
        
        response_data = {
            'category_summary': category_summary,
            'latest_package': latest_package_data,
        }
        return Response(response_data)


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
    queryset = CarePackage.objects.all()
    serializer_class = CarePackageSerializer
    permission_classes = [IsStaffUser]


class CarePackageDeleteView(APIView):
    def delete(self, request, pk):
        try:
            care_package = CarePackage.objects.get(pk=pk)
            # Iterate through each item in the care package and return stock to the inventory
            for item in care_package.care_package_items.all():
                item.product.return_stock(item.quantity)
            # Delete the care package and its items
            care_package.delete()

            return Response({"detail": "Care package deleted and stock returned."}, status=status.HTTP_204_NO_CONTENT)
        
        except CarePackage.DoesNotExist:
            return Response({"detail": "Care package not found."}, status=status.HTTP_404_NOT_FOUND)



class OrderHistoryCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = OrderHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Automatically assign the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    # def update(self, request, *args, **kwargs):
    #     """
    #     Update a care package and adjust stock quantities (reserve more or return stock).
    #     """
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)

    #     # Transaction to ensure atomicity of stock adjustments
    #     with transaction.atomic():
    #         # Return stock for removed or reduced items
    #         for old_item in instance.care_package_items():
    #             new_quantity = next(
    #                 (item['quantity'] for item in request.data.get('items', []) if item['product_id'] == old_item.product.id), 
    #                 None
    #             )
    #             if new_quantity is None:
    #                 # Item removed, return stock
    #                 old_item.product.quantity += old_item.quantity
    #                 old_item.product.save()
    #                 old_item.delete()
    #             elif new_quantity < old_item.quantity:
    #                 # Quantity reduced, return excess stock
    #                 old_item.product.quantity += (old_item.quantity - new_quantity)
    #                 old_item.product.save()
    #                 old_item.quantity = new_quantity
    #                 old_item.save()

    #         # Reserve stock for new or increased items
    #         for item_data in request.data.get('items', []):
    #             product_id = item_data['product_id']
    #             quantity = item_data['quantity']
    #             try:
    #                 product = Inventory.objects.get(id=product_id)
    #             except Inventory.DoesNotExist:
    #                 raise serializers.ValidationError(f"Product with ID {product_id} does not exist.")

    #             existing_item = instance.carepackageitem_set.filter(product_id=product_id).first()
    #             if existing_item:
    #                 # Adjust stock for increased quantity
    #                 if quantity > existing_item.quantity:
    #                     additional_stock = quantity - existing_item.quantity
    #                     if product.quantity < additional_stock:
    #                         raise serializers.ValidationError(
    #                             f"Not enough stock for {product.name}. Available: {product.quantity}, Requested: {additional_stock}."
    #                         )
    #                     product.quantity -= additional_stock
    #                     product.save()
    #                     existing_item.quantity = quantity
    #                     existing_item.save()
    #             else:
    #                 # New item, reserve stock
    #                 if product.quantity < quantity:
    #                     raise serializers.ValidationError(
    #                         f"Not enough stock for {product.name}. Available: {product.quantity}, Requested: {quantity}."
    #                     )
    #                 product.quantity -= quantity
    #                 product.save()
    #                 CarePackageItem.objects.create(
    #                     care_package=instance,
    #                     product=product,
    #                     quantity=quantity,
    #                 )

    #         # Update care package details
    #         self.perform_update(serializer)

     #   return Response(serializer.data, status=status.HTTP_200_OK)


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