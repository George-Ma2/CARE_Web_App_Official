from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer, NoteSerializer, ProfileSerializer
from .models import Note
from rest_framework.response import Response
from rest_framework.decorators import action



# Create a User view
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
        if not username or not password or not first_name or not last_name or not email:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for username duplication
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and profile
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )

        # Update the profile with binary image data
        profile = user.profile  # Assuming a OneToOne relation between User and Profile
        if photo_id:
            profile.photo_id = photo_id.read()  # Read binary data from uploaded image
            profile.save()

        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def get_user_data(self, request):
        user = request.user

        user_data = {
            "username": user.username,
            "profile": {
                # Optionally encode binary data as Base64 for preview
                "photo_preview": None,
            }
        }

        if user.profile.photo_id:
            import base64
            user_data["profile"]["photo_preview"] = base64.b64encode(user.profile.photo_id).decode("utf-8")

        return Response(user_data)


# View to handle the creation of notes
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

# View to handle deleting notes
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


from django.shortcuts import render, redirect


def upload_photo(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = form.save(commit=False)
            # Read the image as binary data
            profile.photo_data = request.FILES['photo_data'].read()
            profile.save()
            return redirect('success')
    else:
        form = ProfileForm()
    return render(request, 'upload_photo.html', {'form': form})


from rest_framework.decorators import api_view
@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'User registered successfully'}, status=201)
    return Response(serializer.errors, status=400)
    
    
@api_view(['GET'])
def current_user_profile(request):
    user = request.user  # Automatically fetched from the token
    serialized_user = UserSerializer(user)  # Use your serializer
    return Response(serialized_user.data)
