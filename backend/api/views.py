from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view
from .serializers import UserSerializer, NoteSerializer, ProfileSerializer
from .models import Note
import base64


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Extracting user fields
        username = request.data.get("username")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        photo_id = request.FILES.get("photo_id")  # Image file upload

        # Validate required fields
        if not all([username, password, first_name, last_name, email]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for username duplication
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

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


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)


@api_view(['GET'])
def current_user_profile(request):
    user = request.user
    serialized_user = UserSerializer(user)
    return Response(serialized_user.data)
