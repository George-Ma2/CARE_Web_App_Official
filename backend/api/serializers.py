from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Inventory
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

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ['id', 'name', 'category', 'quantity', 'expiration_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
