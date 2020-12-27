// Select reusable elements
const statusList = document.getElementById('statusList');
const loggedInDiv = document.getElementById('loggedIn');
const loggedOutDiv = document.getElementById('loggedOut');
const logoutForm = document.getElementById('logout');
const statusForm = document.getElementById('statusForm');
const statusArea = document.getElementById('statusArea');

// Add event listeners
logoutForm.addEventListener('click', submitLogout);
statusForm.addEventListener('submit', postStatus);
statusArea.addEventListener('input', getTextAreaCharacters);

// Get and display all statuses
async function getStatuses(){
    // Send get request
    const res = await fetch('/status');
    // Save response and fill status list on success
    if(res.status >= 200 && res.status <= 299){
        const listJSON = await res.json();
        // Delete inner html contents to refresh list
        statusList.innerHTML = '';
        // Create media objects and append all to status list
        for(let i in listJSON){
            // Create media element
            const statusMedia = document.createElement('li');
            statusMedia.id = listJSON[i]._id;
            // Add border bottom to media element unless last element
            if(i < listJSON.length - 1) statusMedia.className = 'media position-relative border-bottom';
            else statusMedia.className = 'media position-relative';
            // Create body element
            const statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3 text-break';
            // Create link element
            const statusLink = document.createElement('a');
            statusLink.className = 'btn btn-primary align-self-center mr-3';
            statusLink.href = `/status/${listJSON[i]._id}`;
            statusLink.innerText = 'View';
            // Create username element
            const username = document.createElement('h5');
            username.innerText = listJSON[i].user;
            // Create status text element
            const statusText = document.createElement('p');
            statusText.innerText = listJSON[i].status;
            // Get the date of latest revision of the status and create date text element
            const date = new Date(listJSON[i].updatedAt);
            const statusDate = document.createElement('p');
            statusDate.className = 'small';
            statusDate.innerText = date.toString().split(' (')[0];
            // Append by linking parents
            statusBody.appendChild(username);
            statusBody.appendChild(statusText);
            statusBody.appendChild(statusDate);
            statusMedia.appendChild(statusBody);
            statusMedia.appendChild(statusLink);
            statusList.appendChild(statusMedia);
            // If status is owned by user, add edit and delete buttons
            if(loggedInDiv.querySelector('h1').textContent == listJSON[i].user){
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.innerText = 'Edit';
                editBtn.type = 'click';
                editBtn.className = 'btn btn-primary mr-2 edit';
                editBtn.addEventListener('click', editStatus);
                statusBody.appendChild(editBtn);
                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Delete';
                deleteBtn.type = 'click';
                deleteBtn.className = 'btn btn-primary delete';
                deleteBtn.addEventListener('click', deleteStatus);
                statusBody.appendChild(deleteBtn);
            }
        }
    }else{ // Send error on failure
        alert('Sorry, something went wrong.');
    }
}

// Tries to get token to see if user is logged in or out
async function getLoggedInOrOut(){
    // Send get request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch('/user/token', options);
    const {error, message} = await res.json();
    // Display loggedIn section and username if logged in
    if(!error){
        loggedInDiv.className = 'container';
        loggedInDiv.querySelector('h1').innerText = message;
    }else{ // Display loggedOut section if logged out
        loggedOutDiv.className = 'container';
    }
}

// Send a delete request to logout
async function submitLogout(event){
    // Send delete request with cookies
    const options = {
        method: 'DELETE',
        credentials: 'same-origin'
    }
    const res = await fetch('/user/logout', options);
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
		body: statusArea.value
    };
    const res = await fetch('/status', options);
    const {error, message} = await res.json();
    // Reset status textarea and character counter, and update status list
    if(!error){
        statusArea.value = '';
        const charCounter = statusArea.nextElementSibling;
        charCounter.innerText = `0/${statusArea.maxLength}`;
        await getStatuses();
    }else{ // Display error tip on failure
        statusForm.firstElementChild.insertAdjacentElement('beforeBegin', createErrorTip(message));
    }
}

// Replaces text with text area and creates a confirm button
function editStatus(event){
    // Create edit textarea
    const editArea = document.createElement('textarea');
    editArea.className = 'form-control mb-1';
    editArea.id = 'editedText';
    editArea.rows = 2;
    editArea.maxLength = 255;
    const statusText = event.composedPath()[1].children[1];
    editArea.value = statusText.innerText;
    editArea.addEventListener('input', getTextAreaCharacters);
    statusText.insertAdjacentElement('beforeBegin', editArea);
    // Create character counter
    const charCounter = document.createElement('p');
    charCounter.className = 'small text-muted mb-2 ml-1';
    charCounter.innerText = `${editArea.value.length}/${editArea.maxLength}`;
    editArea.insertAdjacentElement('afterEnd', charCounter);
    // Create confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'Confirm';
    confirmBtn.type = 'click';
    confirmBtn.className = 'btn btn-primary mr-2';
    const editBtn = event.target;
    confirmBtn.addEventListener('click', patchStatus);
    editBtn.insertAdjacentElement('beforeBegin', confirmBtn);
    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.type = 'click';
    cancelBtn.className = 'btn btn-primary mr-2';
    confirmBtn.insertAdjacentElement('afterEnd', cancelBtn);
    // Hide non-edit elements
    editBtn.className += ' d-none';
    statusText.className += 'd-none';
    // Listen for cancel button event to un-hide non-edit elements and remove edit elements
    cancelBtn.addEventListener('click', () => {
        editBtn.className = editBtn.className.split(' d-none')[0];
        statusText.removeAttribute('class');
        editArea.remove();
        charCounter.remove();
        confirmBtn.remove();
        cancelBtn.remove();
    });
}

// Send a patch request to edit a status
async function patchStatus(event){
    // Get status body and status id
    const statusBody = event.composedPath()[1];
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
    const res = await fetch(`/status/${statusId}`, options);
    const {error, message} = await res.json();
    // Update statuses on success
    if(!error){
        await getStatuses();
    }else{ // Display error tip on failure
        statusBody.firstElementChild.insertAdjacentElement('beforeBegin', createErrorTip(message));
    }
}

// Send a delete request to delete a status
async function deleteStatus(event){
    // Get status body and status id
    const statusBody = event.composedPath()[1];
    const statusId = event.composedPath()[2].id;
    // Send patch request with cookies and form data
    const options = {
        method: 'DELETE',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}`, options);
    const {error, message} = await res.json();
    // Update statuses on success
    if(!error){
        event.target.disabled = true;
        await getStatuses();
    }else{ // Display error tip on failure
        statusBody.firstElementChild.insertAdjacentElement('beforeBegin', createErrorTip(message));
    }
}

// Creates and return error div
function createErrorTip(message){
    $('.alert').alert('close');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
    return errorDiv;
}

// Edits the character counter of a text area
function getTextAreaCharacters(event){
    const charCounter = event.target.nextElementSibling;
    charCounter.innerText = `${event.target.value.length}/${event.target.maxLength}`;
}

// Functions to be executed on load
function onLoadFunctions(){
    getLoggedInOrOut();
    getStatuses();
}