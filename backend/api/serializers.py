
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Note
from rest_framework.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import BytesIO


class ProfileSerializer(serializers.ModelSerializer):
    photo_id = serializers.ImageField(required=False, write_only=True)
   
    class Meta:
        model = Profile
        fields = ['photo_id']

    def get_photo_id(self, obj):
        if obj.photo_id:
            import base64
            return base64.b64encode(obj.photo_id.read()).decode('utf-8')  # Convert binary to Base64 string
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
            photo = profile_data['photo_id']
            profile_data['photo_id'] = photo.read()  # Store the file data as binary
            Profile.objects.create(user=user, **profile_data)

        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}



