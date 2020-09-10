// Get and display all statuses
async function getStatuses(){
    // Send get request
    const res = await fetch('/status');
    // Save response, get and fill list with media objects
    if(res.status >= 200 && res.status <= 299){
        const statusList = await res.json();
        const list = document.querySelector('#statusList');
        // Create media objects, body, username and status, and append to list
        for(let i=0;i<statusList.length;i++){
            const statusMedia = document.createElement('li');
            statusMedia.className = 'media border-bottom';
            const statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3';
            const username = document.createElement('h5');
            username.innerHTML = statusList[i].user;
            const status = document.createElement('p');
            status.innerHTML = statusList[i].status;
            statusBody.appendChild(username);
            statusBody.appendChild(status);
            statusMedia.appendChild(statusBody);
            list.appendChild(statusMedia);
        }
    }else{ // Send error
        alert('Sorry, something went wrong.');
    }
}

// Get username if logged in
async function getLoggedInInfo(){
    // Send get request with cookies
    const options = {
        method: 'GET',
        credentials: 'same-origin',
    };
    const res = await fetch('/user/loggedin',options);
    // Display loggedIn section and username if logged in
    if(res.status >= 200 && res.status <= 299){
        const data = await res.text();
        const loggedIn = document.getElementById('loggedIn');
        loggedIn.className = 'container';
        loggedIn.querySelector('p').innerHTML = 'Logged in as '+data;
    }else{ // Display loggedOut section if logged out
        const loggedOut = document.getElementById('loggedOut');
        loggedOut.className = 'container';
    }
}

// Send a delete request to logout
async function submitLogout(event){
    // Prevent refresh
    event.preventDefault();
    // Send delete request with cookies
    const options = {
        method: 'DELETE',
        credentials: 'same-origin'
    }
    const res = await fetch('/user/logout',options);
    // Refresh page on success, else send error
    if(res.status >= 200 && res.status <= 299) window.location = '/';
    else alert('Sorry, something went wrong.');
}

// Functions to be executed on load
function onLoadFunctions(){
    getStatuses();
    getLoggedInInfo();
}

// Listen for submitLogout event
const form = document.getElementById('logout');
form.addEventListener('submit',submitLogout);