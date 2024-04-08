from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . Serializers import TaskSerializer
from .models import Task
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes
from django.views.decorators.cache import never_cache
from rest_framework.exceptions import PermissionDenied

@api_view(['GET'])
@never_cache
def apiOverview(request):
    return Response("fshfhsh")

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@never_cache    
def taskList(request):
    user_id = request.GET.get("user_id")
    tasks = Task.objects.filter(user=user_id).order_by('-id')
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@never_cache
@authentication_classes([JWTAuthentication])
def taskDetail(request, id):
    task = Task.objects.get(id=id)
    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@never_cache
def taskCreate(request):
    serializer = TaskSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@never_cache
def taskUpdate(request, id):
    task = Task.objects.get(id=id)
    '''
    one way to do this is to pass in the instance and requested data to the serializer
    then check if data is valid. if yes then save() serializer instance
    '''
    serializer = TaskSerializer(instance=task,data=request.data)

    if serializer.is_valid(raise_exception=True):
        user = serializer.validated_data["user"]
        
        if user != task.user:
            raise PermissionDenied()
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@never_cache
def taskDelete(request, id):
    task = Task.objects.get(id=id)
    
    if task.user.pk == int(request.data["user"]):
        task.delete()
    else:
        raise PermissionDenied()
    
    return Response("Deleted Successfully.")

    