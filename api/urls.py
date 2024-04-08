from django.urls import path
from . import views
from . import authViews
from rest_framework_simplejwt.views import (
    TokenBlacklistView
)

urlpatterns = [
    path('', view=views.apiOverview, name = "api-overview"),
    path('task-list/', view=views.taskList, name = 'task-list'),
    path('task-detail/<str:id>/', view=views.taskDetail, name = 'task-detail'),
    path('task-create/', view=views.taskCreate, name="task-create"),
    path('task-update/<str:id>/', view=views.taskUpdate, name="task-update"),
    path('task-delete/<str:id>/', view=views.taskDelete, name='task-delete'),
    path('register/', view=authViews.registerUser, name='register'),
    path('token/', authViews.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', authViews.MyTokenRefreshView.as_view(), name='token_refresh'),
]