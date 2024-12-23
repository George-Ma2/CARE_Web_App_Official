from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Note
import base64

class ProfileSerializer(serializers.ModelSerializer):
    # The photo_id is handled as a Base64 string
    photo_id = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Profile
        fields = ['photo_id']

    def create(self, validated_data):
        photo_id = validated_data.pop('photo_id', None)

        # If a photo_id is provided as base64, decode it to binary and store in the database
        profile = Profile.objects.create(**validated_data)

        if photo_id:
            profile.photo_id = base64.b64decode(photo_id)  # Convert from base64 to binary
            profile.save()

        return profile

    def update(self, instance, validated_data):
        photo_id = validated_data.pop('photo_id', None)

        if photo_id:
            instance.photo_id = base64.b64decode(photo_id)  # Convert from base64 to binary
        
        # Update other fields if necessary
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_photo_id(self, obj):
        # Return the photo_id as a Base64 string for preview
        if obj.photo_id:
            return base64.b64encode(obj.photo_id).decode('utf-8')
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)  # Include nested profile serializer

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)

        # Create the user
        user = User.objects.create_user(**validated_data)

        # Handle profile creation with photo as binary data if it exists
        if profile_data and profile_data.get('photo_id'):
            # Save the photo data directly in the Profile model
            photo = profile_data['photo_id']  # Base64 data
            profile_data['photo_id'] = base64.b64decode(photo)  # Decode Base64 to binary data
            Profile.objects.create(user=user, **profile_data)

        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}
