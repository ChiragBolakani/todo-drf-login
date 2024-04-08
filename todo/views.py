from django.shortcuts import render

# Create your views here.
def list(request):
    return render(request=request, template_name='frontend/list.html')

def register(request):
    return render(request=request, template_name='frontend/register.html')

def login(request):
    return render(request=request, template_name='frontend/login.html')
