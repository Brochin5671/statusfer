// Get and display all statuses
async function getStatuses(){
    // Send get request
    const res = await fetch('/status');
    // Save response, get and fill list with media objects
    if(res.status >= 200 && res.status <= 299){
        const statusList = await res.json();
        const list = document.querySelector('#statusList');
        // Create media objects, body, link to post, username, status, and append all to list
        for(let i=0;i<statusList.length;i++){
            // Create media element
            const statusMedia = document.createElement('li');
            statusMedia.className = 'media position-relative border-bottom';
            statusMedia.id = statusList[i]._id;
            // Create body element
            const statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3 text-break';
            // Create link element
            const statusLink = document.createElement('a');
            statusLink.href = '/status/'+statusList[i]._id;
            //statusLink.className = 'stretched-link'; temp disabled
            // Create user and status text
            const username = document.createElement('h5');
            username.innerText = statusList[i].user;
            const status = document.createElement('p');
            status.innerText = statusList[i].status;
            statusBody.appendChild(statusLink);
            statusBody.appendChild(username);
            statusBody.appendChild(status);
            statusMedia.appendChild(statusBody);
            list.appendChild(statusMedia);
            // If status is owned by user, add edit and delete buttons
            const loggedIn = document.querySelector('#loggedIn p');
            if(loggedIn != null && loggedIn.innerText.search(statusList[i].user) != -1){
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.innerText = 'Edit';
                editBtn.type = 'click';
                editBtn.className = 'btn btn-primary mr-2 edit';
                statusBody.appendChild(editBtn);
                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Delete';
                deleteBtn.type = 'click';
                deleteBtn.className = 'btn btn-primary delete';
                statusBody.appendChild(deleteBtn);
                // Add event listeners for edit and delete buttons
                editBtn.addEventListener('click',editStatus);
                deleteBtn.addEventListener('click',deleteStatus);
            }
        }
    }else{ // Send error
        alert('Sorry, something went wrong.');
    }
}

// Get username if logged in
async function getLoggedInInfo(){
    // Send get request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch('/user/token',options);
    const data = await res.json();
    // Display loggedIn section and username if logged in
    if(!data.error){
        const loggedIn = document.getElementById('loggedIn');
        loggedIn.className = 'container';
        loggedIn.querySelector('p').innerText = 'Logged in as '+data.message;
    }else{ // Display loggedOut section if logged out
        const loggedOut = document.getElementById('loggedOut');
        loggedOut.className = 'container';
    }
}

// Send a delete request to logout
async function submitLogout(event){
    // Send delete request with cookies
    const options = {
        method: 'DELETE',
        credentials: 'same-origin'
    }
    const res = await fetch('/user/logout',options);
    // Refresh page on success, else send error
    if(res.status >= 200 && res.status <= 299) window.location.reload(true);
    else alert('Sorry, something went wrong.');
}

// Send a post request to post a status
async function postStatus(event){
    // Prevent refresh
    event.preventDefault();
    // Send post request with cookies and form data
    const options = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
			'Content-Type': 'text/plain'
		},
		body: document.getElementById('statusMessage').value
    };
    const res = await fetch('/status',options);
    // Refresh page on success, else send error
    if(res.status >= 200 && res.status <= 299) window.location.reload(true);
    else alert('Sorry, something went wrong.');
}

// Replaces text with text area and creates a blur event listener to send request
function editStatus(event){
    // Create text area
    const textArea = document.createElement('textarea');
    textArea.className = 'form-control mb-3';
    textArea.rows = 2;
    const statusText = event.path[1].children[2];
    textArea.value = statusText.innerText;
    // Replace text with text area and remove edit button
    statusText.parentNode.replaceChild(textArea, statusText);
    textArea.focus();
    event.path[0].remove();
    // Add listener to trigger patchStatus()
    textArea.addEventListener('blur', patchStatus);
}

// Send a patch request to edit a status
async function patchStatus(event){
    // Get status id
    const statusId = event.path[2].id;
    // Send patch request with cookies and form data
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: event.srcElement.value,
    };
    const res = await fetch('/status/'+statusId,options);
    // Refresh page on success, else send error
    if(res.status >= 200 && res.status <= 299) window.location.reload(true);
    else alert('Sorry, something went wrong.');
}

// Send a delete request to delete a status
async function deleteStatus(event){
    // Get status id
    const statusId = event.toElement.offsetParent.id;
    // Send patch request with cookies and form data
    const options = {
        method: 'DELETE',
        credentials: 'same-origin',
    };
    const res = await fetch('/status/'+statusId,options);
    // Refresh page on success, else send error
    if(res.status >= 200 && res.status <= 299) window.location.reload(true);
    else alert('Sorry, something went wrong.');
}

// Functions to be executed on load
function onLoadFunctions(){
    getLoggedInInfo();
    getStatuses();
}

// Listen for events
const logoutForm = document.getElementById('logout');
const postForm = document.getElementById('postStatus');
logoutForm.addEventListener('click',submitLogout);
postForm.addEventListener('submit',postStatus);