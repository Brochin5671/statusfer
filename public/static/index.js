// Get all statuses and return a list
async function getStatuses(){
    const res = await fetch('/status');
    const statusList = await res.json();
    return statusList;
}

// Show statuses
function showStatuses(){
    const statusList = getStatuses();
    statusList.then( (list) => {
        let listElement = document.querySelector('#statusList');
        for(let i=0;i<list.length;i++){
            // Create media object, body, username and status, and append to list
            let statusMedia = document.createElement('li');
            statusMedia.className = 'media border-bottom';
            let statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3';
            let user = document.createElement('h5');
            user.innerHTML = list[i].user;
            let status = document.createElement('p');
            status.innerHTML = list[i].status;
            statusBody.appendChild(user);
            statusBody.appendChild(status);
            statusMedia.appendChild(statusBody);
            listElement.appendChild(statusMedia);
        }
    });
}

// Get username if logged in
async function getLoggedIn(){
    // Send get request
    const options = {
        method: 'GET',
        credentials: 'same-origin',
    };
    // Check if logged in
    try{
        const res = await fetch('/user/loggedin',options);
        const data = await res.json();
        // Display loggedIn section with username
        const loggedIn = document.getElementById('loggedIn');
        loggedIn.className = 'container';
        loggedIn.querySelector('p').innerHTML = 'Logged in as '+data.message;
    }catch(err){ // Display loggedOut section
        const loggedOut = document.getElementById('loggedOut');
        loggedOut.className = 'container';
    }
}

// Check if user is logged in
function checkLoggedIn(){
    getLoggedIn();
}
checkLoggedIn();

// Send a delete request to logout
async function submitLogout(event){
    event.preventDefault();
    // Send delete request
    const options = {
        method: 'DELETE',
        credentials: 'same-origin'
    }
    const res = await fetch('/user/logout',options);
    const data = await res.json();
    if(data.message){
        window.location = '/';
    }else{
        alert('Something went wrong');
    }
}

// Listen for submit event
const form = document.getElementById('logout');
form.addEventListener('submit',submitLogout);