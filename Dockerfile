FROM python:3.9-alpine

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "manage.py", "makemigrations"]

CMD ["python", "manage.py", "migrate"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]

