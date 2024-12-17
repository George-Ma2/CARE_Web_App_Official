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
   #queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

  

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
              "photo_id": request.build_absolute_url(user.profile.photo_id.url)
                }
            }
  
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

