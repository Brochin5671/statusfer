// Get and display all statuses
async function getStatuses(){
    // Send get request
    const res = await fetch('/status');
    // Save response, get and fill list with media objects
    if(res.status >= 200 && res.status <= 299){
        const statusList = await res.json();
        const list = document.querySelector('#statusList');
        // Create media objects and append all to list
        for(let i=0;i<statusList.length;i++){
            // Create media element
            const statusMedia = document.createElement('li');
            statusMedia.id = statusList[i]._id;
            // Add border bottom to media element unless last element
            if(i+1<statusList.length){
                statusMedia.className = 'media position-relative border-bottom';
            }else{
                statusMedia.className = 'media position-relative';
            }
            // Create body element
            const statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3 text-break';
            // Create link element
            const statusLink = document.createElement('a');
            statusLink.className = 'btn btn-primary align-self-center mr-3';
            statusLink.href = '/status/'+statusList[i]._id;
            statusLink.innerText = 'View';
            // Create user and status text
            const username = document.createElement('h5');
            username.innerText = statusList[i].user;
            const status = document.createElement('p');
            status.innerText = statusList[i].status;
            // Get the date of latest revision of the status and create date text
            const dateObj = new Date(statusList[i].updatedAt);
            const date = document.createElement('p');
            date.className = 'small';
            date.innerText = dateObj.toString().split(' (')[0];
            // Append by linking parents
            statusBody.appendChild(username);
            statusBody.appendChild(status);
            statusBody.appendChild(date);
            statusMedia.appendChild(statusBody);
            statusMedia.appendChild(statusLink);
            list.appendChild(statusMedia);
            // If status is owned by user, add edit and delete buttons
            const loggedIn = document.querySelector('#loggedIn h1');
            if(loggedIn != null && loggedIn.textContent == statusList[i].user){
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
        loggedIn.querySelector('h1').innerText = data.message;
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
    if(res.status >= 200 && res.status <= 299) window.location.reload();
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
    const data = await res.json();
    // Display error tip if failed
    if(data.error){
        $('.alert').alert('close');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning alert-dismissible fade show';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = data.message+`
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>`;
        postForm.insertBefore(errorDiv, postForm.firstChild);
    }else{ // Refresh on success
        window.location.reload();
    }
}

// Replaces text with text area and creates a confirm button
async function editStatus(event){
    // Create text area and replace text element
    const textArea = document.createElement('textarea');
    textArea.className = 'form-control mb-3';
    textArea.id = 'editedText';
    textArea.rows = 2;
    const statusText = event.composedPath()[1].children[1];
    textArea.value = statusText.innerText;
    statusText.replaceWith(textArea);
    // Create confirm button and replace edit button
    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'Confirm';
    confirmBtn.type = 'click';
    confirmBtn.className = 'btn btn-primary mr-2'; 
    const editBtn = event.composedPath()[0];
    editBtn.replaceWith(confirmBtn);
    // Add listener to trigger patchStatus()
    confirmBtn.addEventListener('click', patchStatus);
}

// Send a patch request to edit a status
async function patchStatus(event){
    // Get edit form and status id
    console.log(event);
    const editForm = event.composedPath()[1];
    const statusId = event.composedPath()[2].id;
    // Send patch request with cookies and form data
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: event.composedPath()[1].querySelector('#editedText').value,
    };
    const res = await fetch('/status/'+statusId,options);
    const data = await res.json();
    // Display error tip if failed
    if(data.error){
        $('.alert').alert('close');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning alert-dismissible fade show';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = data.message+`
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>`;
        editForm.insertBefore(errorDiv, editForm.firstChild);
    }else{ // Refresh on success
        window.location.reload();
    }
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
    if(res.status >= 200 && res.status <= 299) window.location.reload();
    else alert('Sorry, something went wrong.');
}

// Functions to be executed on load
function onLoadFunctions(){
    getLoggedInInfo();
    getStatuses();
}

// Listen for events
const logoutForm = document.getElementById('logout');
const statusForm = document.getElementById('statusForm');
logoutForm.addEventListener('click',submitLogout);
statusForm.addEventListener('submit',postStatus);