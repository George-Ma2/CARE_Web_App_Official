from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Inventory, CarePackage, CarePackageItem, OrderHistory, CarePackageStatus
import base64


class ProfileSerializer(serializers.ModelSerializer):
    photo_base64 = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = ['photo_base64']

    def create(self, validated_data):
        return Profile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def get_photo_base64(self, obj):
        if obj.photo_id:
            return base64.b64encode(obj.photo_id).decode('utf-8')
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        validated_data['email'] = validated_data.get('email', '').lower()
        user = User.objects.create_user(**validated_data)
        if profile_data:
            Profile.objects.create(user=user, **profile_data)
        return user


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ['id', 'name', 'category', 'quantity', 'expiration_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

class CarePackageItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(), write_only=True, source='product'
    )
    product = InventorySerializer(read_only=True)

    class Meta:
        model = CarePackageItem
        fields = ['id', 'care_package', 'product', 'product_id', 'quantity']
        extra_kwargs = {
            'id': {'read_only': True},
            'care_package': {'read_only': True},
        }
class CarePackageSerializer(serializers.ModelSerializer):
    items = CarePackageItemSerializer(many=True)

    class Meta:
        model = CarePackage
        fields = [
            'id',
            'name',
            'description',
            'items',
            'quantity',
            'initial_quantity',  # Include the new field
            'delivery_date',
            'status',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'initial_quantity': {'read_only': True},  # Make this field read-only
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

    def create(self, validated_data):
        # Extract nested 'items' data
        items_data = validated_data.pop('items', [])

        # Create the CarePackage instance
        care_package = CarePackage.objects.create(**validated_data)

        # Set of products to keep track of what has already been added
        created_products = set()

        # Create related CarePackageItem instances
        for item_data in items_data:
            product = item_data.pop('product')  # Extract the product
            quantity = item_data.get('quantity')

            # Ensure stock is sufficient
            if product.quantity < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for product {product.name}. Available: {product.quantity}, Requested: {quantity}."
                )

            # Reserve stock for the product
            product.reserve_stock(quantity)

            # Check if the product has already been added to this CarePackage
            if product.id not in created_products:
                created_products.add(product.id)
                # Create the CarePackageItem
                CarePackageItem.objects.create(
                    care_package=care_package,
                    product=product,
                    quantity=quantity
                )
                
        return care_package


class OrderHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderHistory
        fields = ['id', 'user', 'package', 'order_date', 'status']

    def create(self, validated_data):
        # Get the associated package
        package = validated_data.get('package')

        # Validate the package's current quantity
        if package.quantity <= 0:
            raise serializers.ValidationError({
                "detail": f"Package {package.name} is out of stock. Current quantity: {package.quantity}."
            })

        # Reduce the quantity
        package.quantity -= 1

        # Update the status if quantity is 0
        if package.quantity == 0:
            package.status = CarePackageStatus.OUTOFSTOCK

        # Save the package changes
        package.save()

        # Create the order
        order = OrderHistory.objects.create(**validated_data)
        return order
