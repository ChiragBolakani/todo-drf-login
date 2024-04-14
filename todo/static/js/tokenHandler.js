function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = cookie.substring(name.length + 1);
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

export let getAccessToken = new Promise( function(resolve, reject){
    var url = "http://13.233.255.18:8000/api/token/refresh/"

    let refresh_token = getCookie('refresh');

    if(refresh_token==null){
        window.location = "http://13.233.255.18:8000/login/"
        return
    }

    const data = {
        "refresh" : refresh_token
    }

    var options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken
        },
        body : JSON.stringify(data)
    }

    fetch(url, options)
    .then(async (response)=>{

        response.json()
        .then((data)=>{
            resolve(data);
        })
    })
    .catch((err)=>{
        reject(err);
        console.log(err);
    })
});