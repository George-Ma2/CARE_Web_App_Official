from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Inventory, CarePackage, CarePackageItem
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
from rest_framework.exceptions import ValidationError

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

    def validate(self, attrs):
        # Get the product instance from attrs
        product = attrs.get('product')  # This is resolved from `source='product'` in the serializer.
        quantity = attrs.get('quantity')

        # If product is None, try resolving it using product_id
        if not product:
            raise ValidationError("Product does not exist or is not provided.")

        # Check if there is enough stock
        if product.quantity < quantity:
            raise ValidationError(f"Not enough stock for product {product.name}. Available: {product.quantity}.")
        
        return attrs


    def create(self, validated_data):
        product = validated_data.get('product')
        quantity = validated_data.get('quantity')

        # Reserve stock for the product
        product.reserve_stock(quantity)
        return super().create(validated_data)

import logging

logger = logging.getLogger(__name__)
from django.db import transaction

class CarePackageSerializer(serializers.ModelSerializer):
    items = CarePackageItemSerializer(many=True)

    class Meta:
        model = CarePackage
        fields = ['id', 'name', 'description', 'items', 'quantity', 'status', 'created_at', 'updated_at']
        extra_kwargs = {
            'id': {'read_only': True},
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
                raise ValidationError(f"Not enough stock for product {product.name}. Available: {product.quantity}.")

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
            else:
                logger.debug(f"Product {product.name} already added to this care package, skipping duplication.")

        return care_package


    def update(self, instance, validated_data):
        # Extract nested items data
        items_data = validated_data.pop('items', [])

        # Dictionary of existing CarePackageItem objects, keyed by product_id
        existing_items = {item.product.id: item for item in instance.items.all()}  # Key by product.id

        # Update the parent CarePackage instance, but avoid saving it too early
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Set to track products already processed in the request
        processed_products = set()

        # First, handle updates or creations for CarePackageItem objects
        for item_data in items_data:
            product = item_data.get('product')
            product_id = product.id if isinstance(product, Inventory) else item_data.get('product_id')

            if product_id in existing_items:
                # Update existing item
                item = existing_items[product_id]
                for attr, value in item_data.items():
                    if attr != 'product_id':  # Skip updating product_id
                        setattr(item, attr, value)
                item.save()
            else:
                # Create new item if not already processed
                if product_id not in processed_products:
                    processed_products.add(product_id)
                    CarePackageItem.objects.create(
                        care_package=instance,
                        product=product,
                        quantity=item_data.get('quantity', 1)
                    )

            # Now handle deletions for items that were not included in the request
            product_ids = [item['product_id'] for item in items_data]
            for product_id, item in existing_items.items():
                if product_id not in product_ids:
                    item.delete()

            # Save the parent CarePackage instance after updating its items
            instance.save()

            return instance

