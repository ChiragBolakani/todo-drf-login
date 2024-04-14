from rest_framework import serializers
from .models import Task
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

# importing modules required for overriding default serializers of drf simplejwt
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login
from typing import Any, Dict
from rest_framework_simplejwt.tokens import RefreshToken
import datetime
from django.contrib.auth import get_user_model



class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        
        
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
            required=True,
            validators=[UniqueValidator(queryset=User.objects.all())]
            )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'password' : {'write_only' : True},
            'password2' : {'write_only' : True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        
        if validated_data.get("first_name", None) is not None:
            user.first_name = validated_data["first_name"]
        if validated_data.get("last_name", None) is not None:
            user.last_name = validated_data["last_name"]
        
        user.set_password(validated_data['password'])
        user.save()

        return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # token_class = RefreshToken
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        
        '''
        get epoch time for refresh token from payload and add to response data
        '''
        refresh_exp_time = refresh.payload["exp"]
        # refresh_exp_time_utc = datetime.datetime.fromtimestamp(refresh_exp_time)
        # refresh_exp_time_iso_format = refresh_exp_time_utc.isoformat()
        # data.update({"refresh_expires" : refresh_exp_time_iso_format})
        data.update({"refresh_expires" : refresh_exp_time})
        
        '''
        get epoch time for refresh token from payload and add to response data
        '''
        access_exp_time = refresh.access_token.payload["exp"]
        # access_exp_time_utc = datetime.datetime.fromtimestamp(access_exp_time)
        # access_exp_time_iso_format = access_exp_time_utc.isoformat()
        # data.update({"access_expires" : access_exp_time_iso_format})
        data.update({"access_expires" : access_exp_time})
        
        User = get_user_model()
        username = User.objects.get(id = refresh.access_token.payload["user_id"]).get_username()
        data.update({"username" : username})
        
        '''add user_id to response data'''
        data.update({"user_id" : refresh.payload["user_id"]})

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data
    
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField()
    access = serializers.CharField(read_only=True)
    token_class = RefreshToken

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        refresh = self.token_class(attrs["refresh"])

        data = {"access": str(refresh.access_token)}
        
        '''
        get epoch time for refresh token from payload and add to response data
        '''
        access_exp_time = refresh.access_token.payload["exp"]
        access_exp_time_utc = datetime.datetime.fromtimestamp(access_exp_time)
        access_exp_time_iso_format = access_exp_time_utc.isoformat()
        data.update({"access_expires" : access_exp_time_iso_format})
        
        
        '''
        get username of the user and add to response data
        '''
        User = get_user_model()
        username = User.objects.get(id = refresh.access_token.payload["user_id"]).get_username()
        data.update({"username" : username})
        
        '''add user_id to response data'''
        data.update({"user_id" : refresh.payload["user_id"]})
    

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    # Attempt to blacklist the given refresh token
                    refresh.blacklist()
                except AttributeError:
                    # If blacklist app not installed, `blacklist` method will
                    # not be present
                    pass

            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()

            data["refresh"] = str(refresh)

        return data