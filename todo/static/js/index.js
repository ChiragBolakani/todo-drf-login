import { getAccessToken } from "./tokenHandler.js";


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

function displayErrorMessages(message){
    let registerErrorWrapper = document.getElementById("register-error-wrapper");
    registerErrorWrapper.innerHTML += `<div id="task-error" class="alert alert-danger" role="alert">${message}</div>`;
    setTimeout(()=>{
        document.getElementById("task-error").remove()
    }, 5000)
}

function displaySuccessMessages(message){
    let registerErrorWrapper = document.getElementById("task-success-wrapper");
    registerErrorWrapper.innerHTML += `<div id="task-success" class="alert alert-success" role="alert">${message}</div>`;
    setTimeout(()=>{
        document.getElementById("task-success").remove()
    }, 2000)
}

function displayUser(){
    let username = getCookie("user")
    document.getElementById("username").innerText = "Welcome "  + username;
}

const csrftoken = getCookie('csrftoken');
let activeItem = null;
let list_snapshot = []


if(window.location.href == "http://13.201.37.105:8000/"){
    buildList();
}
async function buildList(){
    
    const wrapper = document.getElementById('list-wrapper');
    // wrapper.innerHTML = '';
    
    var url = "http://13.201.37.105:8000/api/task-list/?"
    
    
    let access_token = getCookie('access');
    console.log(access_token);
    
    if(access_token==null){
        
        // access_token = await getAccessToken
        await getAccessToken
        .then((data)=>{
            let access_date_timestamp = Date.parse(data.access_expires);
            let access_datetime = new Date(access_date_timestamp).toUTCString();
            document.cookie = `access=${data.access};expires=${access_datetime};path=/`;
            document.cookie = `user=${data.username};expires=${access_datetime};path=/`;
            document.cookie = `user_id=${data.user_id};expires=${access_datetime};path=/`;

            access_token = getCookie('access');
            // buildList()
        }).catch((err)=>console.error(err));
    }

    let user_id = getCookie("user_id")
    console.log(user_id);
    
    let url_params = new URLSearchParams({
        "user_id" : user_id
    })

    displayUser()
    
    var options = {
        method : 'GET',
        headers : {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken,
            'Authorization' : `Bearer ${access_token}`
        }
    }
    console.log(options);
    await fetch(url + url_params, options)
    // await fetch(url, options)

    .then(async (result) => {
        const tasks = await result.json();
        var list = tasks;
        for(var i in list){
            try{
                document.getElementById(`data-row-${i}`).remove()
            }catch(err){

            }

            let title = `<span class="title">${list[i].title}</span>`

            if(list[i].completed == true){
                title = `<strike class="title">${list[i].title}</strike>`
            }

            var item = `
            <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                <div style="flex:1">
                <input type="checkbox" class="status_check" aria-label="">
                </div>
                <div style="flex:7">
                    ${title}
                </div>
                <div style="flex:1">
                    <button class="btn btn-sm btn-outline-info edit">Edit </button>
                </div>
                <div style="flex:1">
                    <button class="btn btn-sm btn-outline-dark delete">Delete</button>
                </div>
            </div>
            `
            wrapper.innerHTML += item;

        }

        if (list_snapshot.length > list.length){
            for (let i = list.length; i < list_snapshot.length; i++){
                document.getElementById(`data-row-${i}`).remove()
            }
        }

        list_snapshot = list

        for(let i in list){
            let editButton = document.getElementsByClassName('edit')[i];
            let deleteButton = document.getElementsByClassName('delete')[i];
            let status_check = document.getElementsByClassName('status_check')[i];

            editButton.addEventListener("click", function(){
                editItem(list[i]);
            })

            deleteButton.addEventListener("click", function(){
                deleteitem(list[i]);
            })

            status_check.addEventListener("click", function(){
                strikeUnstrike(list[i]);
            })
        }
    })
    .catch((err) => {
        console.log(err)
    });
}


const form_wrapper = document.getElementById('form-wrapper');

form_wrapper.addEventListener('submit', async (e)=>{
    e.preventDefault();
    console.log('form submitted');

    var url = "http://13.201.37.105:8000/api/task-create/"
    var title = document.getElementById('title').value;
    const form = document.getElementById('form');

    if(activeItem!=null){
       var url = `http://13.201.37.105:8000/api/task-update/${activeItem.id}/`
       activeItem = null;
    }

    let access_token = getCookie('access');
    console.log(access_token);

    
    if(access_token==null){

        await getAccessToken
        .then((data)=>{
            let access_date_timestamp = Date.parse(data.access_expires);
            let access_datetime = new Date(access_date_timestamp).toUTCString();
            document.cookie = `access=${data.access};expires=${access_datetime};path=/`;
            document.cookie = `user=${data.username};expires=${access_datetime};path=/`;
            document.cookie = `user_id=${data.user_id};expires=${access_datetime};path=/`;

            access_token = getCookie('access');
        }).catch((err)=>console.error(err));
    }

    let user_id = getCookie("user_id")

    const data = {
        'title' : title,
        'completed' : false,
        'user' : user_id
    }
    

    var options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken,
            'Authorization' : `Bearer ${access_token}`
        },
        body : JSON.stringify(data)
    }

    await fetch(url, options)
    .then(async (response)=>{
        if(response.ok){
            buildList();
            displaySuccessMessages("Task Added!")
            form.reset();
        }else{
            response.json().then((data)=>{
                for(let field in data){
                    let details = data[field];
                    for(let detail in details){
                        let message = field + ": " + details[detail];
                        displayErrorMessages(message)
                        console.log(field + ": " + details[detail]);
                    }
                }
            })
        }
    }).catch((err)=>{
        displayErrorMessages("Something went wrong. Please try later.");
        console.log(err);
    })
})

function editItem(item){
    console.log(item);
    activeItem = item;
    document.getElementById('title').value = activeItem.title;
}

async function deleteitem(item){
    console.log("delete clicked");
    console.log(item);

    let access_token = getCookie('access');
    console.log(access_token);

    var title = document.getElementById('title').value;

    if(access_token==null){

        await getAccessToken
        .then((data)=>{
            let access_date_timestamp = Date.parse(data.access_expires);
            let access_datetime = new Date(access_date_timestamp).toUTCString();
            document.cookie = `access=${data.access};expires=${access_datetime};path=/`;
            document.cookie = `user=${data.username};expires=${access_datetime};path=/`;
            document.cookie = `user_id=${data.user_id};expires=${access_datetime};path=/`;

            access_token = getCookie('access');
        }).catch((err)=>console.error(err));
    }

    var url = `http://13.201.37.105:8000/api/task-delete/${item.id}/`

    let user_id = getCookie("user_id")

    const data = {
        'user' : user_id
    }

    var options = {
        method : 'DELETE',
        headers : {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken,
            'Authorization' : `Bearer ${access_token}`,
        },
        body : JSON.stringify(data)
    }

    await fetch(url, options)
    .then(async (response)=>{
        if(response.ok){
            buildList();
            form.reset();
            // alert(`Task "${item.title}" deleted successfully!`);
            displaySuccessMessages("Deleted Successfully!")
        }else{
            response.json().then((data)=>{
                for(let field in data){
                    let details = data[field];
                    for(let detail in details){
                        let message = field + ": " + details[detail];
                        displayErrorMessages(message)
                        console.log(field + ": " + details[detail]);
                    }
                }
            })
        }
        
    }).catch((err)=>{
        displayErrorMessages("Something went wrong. Please try later.")
        console.log(err);
    })
}

async function strikeUnstrike(item){
    console.log("striked/unstriked");
    console.log(item);

    var url = `http://13.201.37.105:8000/api/task-update/${item.id}/`
    item.completed = !item.completed;

    let user_id = getCookie("user_id")    

    
    const data = {
        'title' : item.title,
        'completed' : item.completed,
        'user' : user_id
    }

    console.log("updating user " + data);

    let access_token = getCookie('access');
    console.log(access_token);

    if(access_token==null){

        await getAccessToken
        .then((data)=>{
            let access_date_timestamp = Date.parse(data.access_expires);
            let access_datetime = new Date(access_date_timestamp).toUTCString();
            document.cookie = `access=${data.access};expires=${access_datetime};path=/`;

            document.cookie = `user=${data.username};expires=${access_datetime};path=/`;
            document.cookie = `user_id=${data.user_id};expires=${access_datetime};path=/`;

            access_token = getCookie('access');
        }).catch((err)=>console.error(err));
    }

    var options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrftoken,
            'Authorization' : `Bearer ${access_token}`
        },
        body : JSON.stringify(data)
    }

    await fetch(url, options)
    .then(async (response)=>{
        if(response.ok){
            buildList();
            // document.getElementById(`data-row-${}`)
            form.reset();
        }else{
            response.json().then((data)=>{
                // for(let field in data){
                //     let details = data[field];
                //     let message = details;
                //     // displayErrorMessages(message)
                //     console.log(details);
                // }
            })
        }
        
    }).catch((err)=>{
        displayErrorMessages("Something went wrong. Please try later.")
        console.log(err);
    })
}

document.getElementById('logout').addEventListener('click', (e)=>{
    e.preventDefault()
    document.cookie = `access=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    document.cookie = `refresh=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    document.cookie = `user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    document.cookie = `user_id=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    window.location = "http://13.201.37.105:8000/login/";
})

