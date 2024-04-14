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

    var url = "http://13.233.255.18:8000/api/register/"
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;

    const data = {
        "username" : username,
        "email": email, 
        "password" : password,
        "password2" : password2
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
    .then( (response)=>{
        if(response.ok) window.location = "http://13.233.255.18:8000/login/"
        response.json()
        .then((data)=>{
            clearPreviousErrorMessages()
            for(let field in data){
                let details = data[field];
                for(let detail in details){
                    let message = field + ": " + details[detail];
                    displayErrorMessages(message)
                    console.log(field + ": " + details[detail]);
                }
            }
        })
    })
    .catch((err)=>{
        displayErrorMessages("Something went wrong. Please try later.");
        console.log(err);
    })
});