from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.list, name = "list"),
    path('register/', view=views.register, name = "register"),
    path('login/', view=views.login, name = "login")
]