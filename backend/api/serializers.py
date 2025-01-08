from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Inventory, CarePackage, CarePackageItem
import base64


class ProfileSerializer(serializers.ModelSerializer):
    # Use photo_base64 for read-only Base64 encoding
    photo_base64 = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = ['photo_base64']

    def create(self, validated_data):
        return Profile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Update other fields if needed
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_photo_base64(self, obj):
        #"""Encode raw binary photo_id to Base64 for API responses."""
        if obj.photo_id:
            return base64.b64encode(obj.photo_id).decode('utf-8')  # Binary -> Base64
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)  # Include nested profile serializer

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        email = validated_data.get('email').lower()
        validated_data['email'] = email
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
    product = InventorySerializer()  # Nested InventorySerializer to represent the product details

    class Meta:
        model = CarePackageItem
        fields = ['id', 'product', 'quantity']

    def validate_quantity(self, quantity):
        """Ensure the quantity is available in stock before adding to care package."""
        # product = self.initial_data.get('product')  # Get product from data
        # product_instance = Inventory.objects.get(id=product)
        product_instance = self.validated_data['product']
        inventory_instance = Inventory.objects.get(id=product_instance['id']) # Check

        if quantity > inventory_instance.quantity:
            raise serializers.ValidationError(
                f"Not enough stock for {product_instance.name}. Available: {product_instance.quantity}, Requested: {quantity}."
            )
        return quantity


    def create(self, validated_data):
        product_data = validated_data.pop('product')
        product = Inventory.objects.get(id=product_data['id'])
        quantity = validated_data['quantity']
        product.reserve_stock(quantity)
        return CarePackageItem.objects.create(product=product, **validated_data)

    def update(self, instance, validated_data):
        product_data = validated_data.pop('product')
        instance.product = Inventory.objects.get(id=product_data['id'])
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save()
        return instance
    

class CarePackageSerializer(serializers.ModelSerializer):
    items = CarePackageItemSerializer(many=True)  # Nested CarePackageItemSerializer to represent items

    class Meta:
        model = CarePackage
        fields = ['id', 'name', 'description', 'items', 'status', 'created_at', 'updated_at']
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

    def validate_items(self, package):
        """Check that all items have sufficient stock before creating the care package."""
        # Iterate over each item and validate the stock
        for item in package:
            product = item['product']
            quantity = item['quantity']
            product_instance = Inventory.objects.get(id=product)

            if quantity > product_instance.quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for {product_instance.name}. Available: {product_instance.quantity}, Requested: {quantity}."
                )
        return package

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        care_package = CarePackage.objects.create(**validated_data)

        # Create CarePackageItems
        for item_data in items_data:
            product_data = item_data.pop('product')
            product = Inventory.objects.get(id=product_data['id'])  # Fetching product by ID
            CarePackageItem.objects.create(care_package=care_package, product=product, **item_data)

        return care_package

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update CarePackage details
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.status = validated_data.get('status', instance.status)
        instance.save()

        # Update CarePackageItems
        if items_data:
            # Delete old items first (you can also implement partial update)
            instance.care_package_items.all().delete()
            for item_data in items_data:
                product_data = item_data.pop('product')
                product = Inventory.objects.get(id=product_data['id'])
                CarePackageItem.objects.create(care_package=instance, product=product, **item_data)

        return instance
