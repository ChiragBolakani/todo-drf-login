from rest_framework.decorators import api_view
from . Serializers import RegisterSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

@api_view(['POST'])
def registerUser(request):
    print(request.data)
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()    
    
    return Response(serializer.data)

'''extending drf jwt views to customise'''
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class MyTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer