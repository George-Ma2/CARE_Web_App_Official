
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Note
from rest_framework.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['photo_id']
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)  # Include nested profile serializer

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print("Validated Data:", validated_data)
        profile_data = validated_data.pop('profile', None)
        print("Profile Data:", profile_data)

        # Create the user
        user = User.objects.create_user(**validated_data)

        # Handle profile creation or update with photo_id if it exists
        if profile_data and profile_data.get('photo_id'):
            # Check if user already has a profile
            if not hasattr(user, 'profile'):
                # Ensure the file gets saved to the proper location
                photo = profile_data['photo_id']
                # Save the image file to the correct location
                photo_path = default_storage.save('media/' + photo.name, ContentFile(photo.read()))
                profile_data['photo_id'] = photo_path

                # Create the profile
                Profile.objects.create(user=user, **profile_data)
            else:
                # Optionally, you could update the existing profile if needed
                profile = user.profile
                profile.photo_id = profile_data['photo_id']
                profile.save()

        return user



class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}



