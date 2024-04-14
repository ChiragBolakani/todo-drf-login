
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function clearPreviousErrorMessages(){
    let messages = document.getElementsByClassName("alert-danger");
    for(let message of messages){
        message.remove();
    }
}

function displayErrorMessages(message){
    let registerErrorWrapper = document.getElementById("register-error-wrapper");
    registerErrorWrapper.innerHTML += `<div class="alert alert-danger" role="alert">${message}</div>`;
}

const csrftoken = getCookie('csrftoken');

const form_wrapper = document.getElementById('form-wrapper');

form_wrapper.addEventListener('submit', async (e)=>{
    e.preventDefault();
    console.log('form submitted');

    var url = "http://13.233.255.18:8000/api/token/"
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const data = {
        "username" : username,
        "password" : password
    }

    console.log(data);

    var options = {
        method : 'POST',
        headers : { 
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken
        },
        body : JSON.stringify(data)
    }

    await fetch(url, options)
    .then(async (response)=>{
        if(response.ok){
            response.json()
            .then((data)=>{

                let refresh_date_timestamp = data.refresh_expires;
                let refresh_datetime = new Date(refresh_date_timestamp*1000).toUTCString();

                let access_date_timestamp = data.access_expires;
                let access_datetime = new Date(access_date_timestamp*1000).toUTCString();

                let username = data.username

                console.log(data);
                console.log(refresh_datetime);
                console.log(access_datetime);

                document.cookie = `access=${data.access};expires=${access_datetime};path=/`;
                document.cookie = `refresh=${data.refresh};expires=${refresh_datetime};path=/`;
                document.cookie = `user=${data.username};expires=${access_datetime};path=/`;
                document.cookie = `user_id=${data.user_id};expires=${access_datetime};path=/`;
                window.location = "http://13.233.255.18:8000";

            });
        }else{
            response.json()
            .then((data)=>{
                clearPreviousErrorMessages()
                for(let field in data){
                    let details = data[field];
                    let message = details;
                    displayErrorMessages(message)
                    console.log(details);
                }
            })
        }
    })
    .catch((err)=>{
        displayErrorMessages("Something went wrong. Please try later.");
        console.log(err);
    })
});