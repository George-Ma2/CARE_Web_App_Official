
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Note
from rest_framework.exceptions import ValidationError

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

        # Create the profile if profile data exists
        if profile_data:
            photo = profile_data.get('photo_id')
            if photo:
                # Validate and save the profile with the uploaded file
                Profile.objects.create(user=user, photo_id=photo)
                print("Profile photo uploaded:", photo)
            else:
                raise ValidationError({"profile": "Photo upload failed."})
        
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}



