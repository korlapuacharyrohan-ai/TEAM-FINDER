from django.shortcuts import render
from django.http import HttpResponse


def home(request):

    peoples = [
        {'name' : 'rohan_1' , 'age' : 23},
        {'name' : 'achary' , 'age' : 45}
    ]

    for people in peoples:
        print(people)

        
    return render(request, "home/index.html" , context = {'peoples': peoples})

def about(request):
     context = {'page':'about'}
     return render(request, "home/about.html", context)

def contact(request):
     context = {'page' : 'contact'}
     return render(request, "home/contact.html", context)

def success_page(request):
    print("*" * 10)
    return HttpResponse("<h1>Hey this is a success page</h1>")

