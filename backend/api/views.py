from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import UserSerializer, ProfileSerializer, InventorySerializer, CarePackageSerializer, OrderHistorySerializer
from .models import Inventory, CarePackage, OrderHistory
from rest_framework.views import APIView
from .permissions import IsStaffUser
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum
from django.utils import timezone


class RegisteredStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter users where is_staff=False
        students = User.objects.filter(is_staff=False).values('id', 'first_name', 'last_name', 'email')
        return Response({'students': list(students)})


class OrderHistoryView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        try:
            # Fetch all orders, and count total number of orders
            orders = OrderHistory.objects.all()

            # Count the total number of orders
            total_orders = orders.count()

            # Get the most recent order (assuming orders have a 'date' field)
            latest_order = orders.order_by('order_date').first()  # You can change 'date' to the appropriate field

            # If there's no order yet
            if not latest_order:
                return Response({"total_orders": total_orders, "latest_order": None})

            # Extract relevant information about the most recent order
            latest_order_data = {
                'order_id': latest_order.id,
                'order_date': latest_order.order_date,
                'status': latest_order.status,  
            }

            # Return the total orders and the most recent order information
            return Response({
                'total_orders': total_orders,
                'latest_order': latest_order_data
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom field for is_staff in the token response
        data['is_staff'] = self.user.is_staff
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


def get_oldest_package_date(request):
    """
    View to fetch the oldest package's creation date, considering only packages
    with a quantity greater than zero. If the oldest package has a quantity of zero,
    it selects the next closest package with a valid quantity.
    """
    try:
        # Query the oldest package based on `created_at` with a quantity greater than 0
        oldest_package = CarePackage.objects.filter(quantity__gt=0).order_by('created_at').first()
        
        if oldest_package:
            # If the oldest package has a valid quantity, return its creation date
            return JsonResponse({'oldest_date': oldest_package.created_at.isoformat()})
        else:
            # If no eligible package is found, query the next closest package with quantity > 0
            next_package = CarePackage.objects.filter(quantity__gt=0).order_by('created_at').skip(1).first()

            if next_package:
                # Return the next closest package's creation date
                return JsonResponse({'oldest_date': next_package.created_at.isoformat()})
            else:
                # Handle the case where no eligible packages are found
                return JsonResponse({'oldest_date': None, 'message': 'No packages with valid quantity found'}, status=404)

    except Exception as e:
        # Handle unexpected errors
        return JsonResponse({'error': str(e)}, status=500)



from datetime import datetime

@csrf_exempt
def get_packages_with_same_create_date(request):
    """
    Get all packages with the same creation date as the oldest package.
    """
    try:
        if request.method == "GET":
            # Get the createDate from the query parameters
            createDate = request.GET.get("create_date", None)

            if not createDate:
                return JsonResponse({"error": "Missing create_date parameter."}, status=400)

            try:
                # Parse the createDate and extract the date portion
                create_date_obj = datetime.fromisoformat(createDate).date()
            except ValueError:
                return JsonResponse({"error": "Invalid date format. Use ISO 8601 format."}, status=400)

            # Query packages created on the specified date
            same_date_packages = CarePackage.objects.filter(created_at__date=create_date_obj)

            # Prepare the response data
            packages_data = [
                {
                    "id": package.id,
                    "created_at": package.created_at.isoformat(),
                    "delivery_date": package.delivery_date,
                    "pickup_location": package.description,
                    "quantity": package.quantity,
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
        # Log the error and return JSON error response
        print(f"Error in get_packages_with_same_create_date: {e}")
        return JsonResponse({"error": "An unexpected error occurred."}, status=500)

@csrf_exempt
def get_packages_details(request):
 
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
                    "quantity": package.quantity,
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

@csrf_exempt
def get_total_packages(request):
 
    try:
        if request.method == "GET":
            all_packages = CarePackage.objects.all()
               
            # Calculate the sum of all quantities
            total_quantity = sum(package.quantity for package in all_packages)

            # Prepare the response data
            response_data = {
                "total_quantity": total_quantity
            }
            
            return JsonResponse(response_data, status=200)

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
    permission_classes = [IsStaffUser]

    def get(self, request):
        # Aggregate inventory quantity by category
        category_summary = (
            Inventory.objects
            .values('category')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('category')
        )
        #Retrieve the latest care package
        latest_package = CarePackage.objects.latest('created_at')  # Fetch the most recently created package
        latest_package_data = {
            "name": latest_package.name,
            "quantity": latest_package.quantity,
            "description": latest_package.description,
            "status": latest_package.status,
            "delivery_date": latest_package.delivery_date,
        }

            
        # Retrieve the package with the nearest (earliest) delivery date
        nearest_delivery = CarePackage.objects.filter(delivery_date__gte=timezone.now()).order_by('delivery_date').first()
        nearest_delivery = {
            "delivery_date": nearest_delivery.delivery_date
        }
           
   
        response_data = {
            'category_summary': category_summary,
            'latest_package': latest_package_data,
            'nearest_delivery': nearest_delivery_data
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
def update_user_photo(request):
    """
    View to update the user's photo_id in their profile.
    """
    try:
        # Get the profile of the authenticated user
        user_profile = request.user.profile
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found for this user."}, status=status.HTTP_404_NOT_FOUND)
    
    # Ensure the user has provided a file for the photo_id
    photo_id = request.FILES.get("photo_id")
    if not photo_id:
        return Response({"error": "No photo file provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Validate the file size
    if photo_id.size > 2 * 1024 * 1024:  # 2MB limit
        return Response({"error": "File size exceeds 2MB limit."}, status=status.HTTP_400_BAD_REQUEST)

    # Validate the file type
    if not photo_id.content_type.startswith("image/"):
        return Response({"error": "Invalid file type. Only images are allowed."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update the photo_id
    user_profile.photo_id = photo_id.read()  # Read the image data
    user_profile.save()

    # Return the updated profile
    return Response({
        "message": "Profile photo updated successfully.",
        "photo_id": ProfileSerializer(user_profile).data['photo_base64']
    }, status=status.HTTP_200_OK)

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
    permission_classes = [IsStaffUser]
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
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = OrderHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Automatically assign the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserOrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the current user's ID
            user_id = request.user.id

            # Fetch all orders belonging to the current user
            user_orders = OrderHistory.objects.filter(user_id=user_id)

            # If no orders exist, return an appropriate response
            if not user_orders.exists():
                return Response({"message": "No order history found for the user."}, status=status.HTTP_404_NOT_FOUND)

            # Enrich order data with delivery_date from CarePackage
            orders_data = []
            for order in user_orders:
                # Fetch the CarePackage associated with the package_id
                care_package = CarePackage.objects.filter(id=order.package_id).first()
                delivery_date = care_package.delivery_date if care_package else None

                # Append the enriched data to the list
                orders_data.append({
                    "order_date": order.order_date.date(),
                    "status": order.status,
                    "delivery_date": delivery_date,
                })

            # Return the enriched data
            return Response({"orders": orders_data}, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
