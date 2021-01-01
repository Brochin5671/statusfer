// Select important elements
const statusList = document.getElementById('statusList');
const loggedInDiv = document.getElementById('loggedIn');
const loggedOutDiv = document.getElementById('loggedOut');
const logoutForm = document.getElementById('logout');
const statusForm = document.getElementById('statusForm');
const postBtn = document.getElementById('postBtn');
const statusArea = document.getElementById('statusArea');

// Listen for logout event
logoutForm.addEventListener('click', submitLogout);

// Listen for post status event
statusForm.addEventListener('submit', async (event) => {
    disableButtons();
    // Prevent refresh
    event.preventDefault();
    // Send post request
    await postStatus(event);
    enableButtons();
});

// Listen for status textarea input event
statusArea.addEventListener('input', getTextAreaCharacters);

// Setup client-side socket-io
const socket = io({
    // Use websocket transport
    transports: ['websocket'],
});

// Tries to get user info and fetches all statuses when connected
socket.on('connect', async () => {
    await getLoggedInOrOut();
    await getStatuses();
});

// Add new status media object when post event is emitted
socket.on('postStatus', statusJSON => {
    createStatusMedia(statusJSON, true);
});

// Delete specific status media object when delete event is emitted
socket.on('deleteStatus', ({_id}) => {
    document.getElementById(_id).remove();
});

// Update specific status media object when patch event is emitted
socket.on('patchStatus', ({_id, updatedAt, status}) => {
    const updatedStatus = document.getElementById(_id);
    updatedStatus.querySelector('.statusText').innerText = status;
    updatedStatus.querySelector('.statusDate').innerText = createDateString(updatedAt);
});

// Update specific status' likes
socket.on('likeStatus', ({newLikes, newDislikes, _id}) => {
    const likedStatus = document.getElementById(_id);
    likedStatus.querySelector('.like').innerText = `▲ ${newLikes}`;
    likedStatus.querySelector('.dislike').innerText = `▼ ${newDislikes}`;
});

// Update specific status' dislikes
socket.on('dislikeStatus', ({newLikes, newDislikes, _id}) => {
    const dislikedStatus = document.getElementById(_id);
    dislikedStatus.querySelector('.dislike').innerText = `▼ ${newDislikes}`;
    dislikedStatus.querySelector('.like').innerText = `▲ ${newLikes}`;
});

// Alert disconnected message
socket.on('disconnect', () => {
    alert('Lost connection! Trying to reconnect...');
});

// When reconnecting, use polling transport, and then upgrade to websocket
socket.on('reconnect_attempt', () => {
    socket.opts.transports = ['polling', 'websocket'];
});

// Get and display all statuses
async function getStatuses(){
    // Send get request
    const res = await fetch('/status');
    // Save response and fill status list on success
    if(res.status >= 200 && res.status <= 299){
        const listJSON = await res.json();
        // Refresh and append all media objects to status list
        statusList.innerHTML = '';
        for(let i in listJSON){
            createStatusMedia(listJSON[i], false);
        }
    }else{ // Send error on failure
        alert('Sorry, something went wrong.');
    }
}

// Creates and adds a status media element to the status list
function createStatusMedia(statusJSON, isNew){
    // Create media element
    const statusMedia = document.createElement('li');
    statusMedia.id = statusJSON._id;
    statusMedia.className = 'media position-relative border-bottom';
    // Create body element
    const statusBody = document.createElement('div');
    statusBody.className = 'media-body m-3 text-break';
    // Create link element
    const statusLink = document.createElement('a');
    statusLink.className = 'btn btn-primary align-self-center mr-3';
    statusLink.href = `/status/${statusJSON._id}`;
    statusLink.innerText = 'View';
    // Create username element
    const username = document.createElement('a');
    username.className = 'h5 text-reset';
    username.href = `/user/${statusJSON.userId}`;
    username.innerText = statusJSON.user;
    // Create status text element
    const statusText = document.createElement('p');
    statusText.className = 'statusText mt-2';
    statusText.innerText = statusJSON.status;
    // Get the date of latest revision of the status and create date text element
    const statusDate = document.createElement('p');
    statusDate.className = 'small statusDate';
    statusDate.innerText = createDateString(statusJSON.updatedAt);
    // Create like button
    const likeBtn = document.createElement('button');
    likeBtn.innerText = `▲ ${statusJSON.likes.length}`;
    likeBtn.type = 'click';
    likeBtn.className = 'btn btn-primary btn-sm like';
    likeBtn.addEventListener('click', likeStatus);
    // Create dislike button
    const dislikeBtn = document.createElement('button');
    dislikeBtn.innerText = `▼ ${statusJSON.dislikes.length}`;
    dislikeBtn.type = 'click';
    dislikeBtn.className = 'btn btn-primary btn-sm dislike';
    dislikeBtn.addEventListener('click', dislikeStatus);
    // Create feedback div element and add to feedback div wrap element
    const feedBackDiv = document.createElement('div');
    feedBackDiv.className = 'btn-group';
    feedBackDiv.role = 'group';
    feedBackDiv.setAttribute('aria-label', 'Feedback buttons');
    feedBackDiv.appendChild(likeBtn);
    feedBackDiv.appendChild(dislikeBtn);
    const feedBackDivWrap = document.createElement('div');
    feedBackDivWrap.className = 'mb-2';
    feedBackDivWrap.appendChild(feedBackDiv);
    // Append by linking parents
    statusBody.appendChild(username);
    statusBody.appendChild(statusText);
    statusBody.appendChild(statusDate);
    statusBody.appendChild(feedBackDivWrap);
    statusMedia.appendChild(statusBody);
    statusMedia.appendChild(statusLink);
    // Append to beginning of list if new element, else append to end of list
    if(isNew && statusList.firstElementChild) statusList.firstElementChild.insertAdjacentElement('beforeBegin', statusMedia);
    else statusList.appendChild(statusMedia);
    // If status is owned by user, add edit and delete buttons
    if(loggedInDiv.querySelector('h1').textContent == statusJSON.user){
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.innerText = 'Edit';
        editBtn.type = 'click';
        editBtn.className = 'btn btn-primary mr-2 edit';
        statusBody.appendChild(editBtn);
        editBtn.addEventListener('click', editStatus);
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.type = 'click';
        deleteBtn.className = 'btn btn-primary delete';
        statusBody.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', async (event) => {
            // Send delete request
            disableButtons();
            await deleteStatus(event);
            enableButtons();
        });
    }
}

// Returns a date string based on the time
function createDateString(dateString){
    const date = new Date(dateString);
    const nowDate = new Date(Date.now());
    // Check if date is from today or yesterday, else return a full date string
    if(date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && date.getDate() == nowDate.getDate()){
        return `Today at ${date.toLocaleTimeString()}`;
    }else if(date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && nowDate.getDate() - date.getDate() == 1){
        return `Yesterday at ${date.toLocaleTimeString()}`;
    }else{
        return date.toLocaleString();
    }
}

// Tries to get token to see if user is logged in or out
async function getLoggedInOrOut(){
    // Try to get new token
    const {error, message} = await getToken();
    // Display loggedIn section and username if logged in
    if(!error){
        loggedInDiv.className = 'container';
        loggedInDiv.querySelector('h1').innerText = message;
        loggedOutDiv.className += 'container d-none';
    }else{ // Display loggedOut section if logged out and reset elements
        loggedOutDiv.className = 'container';
        loggedInDiv.className = 'container d-none';
        loggedInDiv.querySelector('h1').innerText = '';
        statusArea.value = '';
        const charCounter = statusArea.nextElementSibling;
        charCounter.innerText = `0/${statusArea.maxLength}`;
    }
}

// Tries to generate new token for user
async function getToken(){
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch('/user/token', options);
    return await res.json();
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
async function postStatus(){
    // Try to get token if user doesn't already have one
    await getToken();
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
    }else{ // Display error tip on failure
        createErrorTip(statusForm.firstElementChild, message);
    }
}

// Hides non-edit elements, creates text area, confirm and cancel buttons
function editStatus(event){
    // Get status body and status id
    const statusBody = event.target.parentNode;
    const statusId = event.target.parentNode.parentNode.id;
    // Create edit textarea
    const editArea = document.createElement('textarea');
    editArea.className = `form-control mb-1 editDeletable${statusId}`;
    editArea.id = 'editedText';
    editArea.rows = 2;
    editArea.maxLength = 255;
    const statusText = event.target.parentNode.querySelector('.statusText');
    editArea.value = statusText.innerText;
    editArea.addEventListener('input', getTextAreaCharacters);
    statusText.insertAdjacentElement('afterEnd', editArea);
    // Create character counter
    const charCounter = document.createElement('p');
    charCounter.className = `small text-muted mb-2 ml-1 editDeletable${statusId}`;
    charCounter.innerText = `${editArea.value.length}/${editArea.maxLength}`;
    editArea.insertAdjacentElement('afterEnd', charCounter);
    // Create confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'Confirm';
    confirmBtn.type = 'click';
    confirmBtn.className = `btn btn-primary mr-2 confirm editDeletable${statusId}`;
    const editBtn = event.target;
    editBtn.insertAdjacentElement('beforeBegin', confirmBtn);
    // Listen for confirm button event to send a patch request, un-hide non-edit elements, and remove edit elements
    confirmBtn.addEventListener('click', async () => {
        // Send patch request
        disableButtons();
        await patchStatus(event);
        enableButtons();
        // Un-hide non-edit elements and remove edit elements
        editBtn.className = editBtn.className.split(' d-none')[0];
        deleteBtn.className = deleteBtn.className.split(' d-none')[0];
        statusText.className = statusText.className.split(' d-none')[0];
        $(`.editDeletable${statusId}`).remove();
    });
    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.type = 'click';
    cancelBtn.className = `btn btn-primary mr-2 cancel editDeletable${statusId}`;
    const deleteBtn = editBtn.nextElementSibling;
    deleteBtn.insertAdjacentElement('beforeBegin', cancelBtn);
    // Hide non-edit elements
    editBtn.className += ' d-none';
    deleteBtn.className += ' d-none';
    statusText.className += ' d-none';
    // Listen for cancel button event to un-hide non-edit elements and remove edit elements
    cancelBtn.addEventListener('click', () => {
        editBtn.className = editBtn.className.split(' d-none')[0];
        deleteBtn.className = deleteBtn.className.split(' d-none')[0];
        statusText.className = statusText.className.split(' d-none')[0];
        $(`.editDeletable${statusId}`).remove();
    });
}

// Send a patch request to edit a status
async function patchStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode;
    const statusId = event.target.parentNode.parentNode.id;
    // Send patch request with cookies and form data
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: statusBody.querySelector('#editedText').value,
    };
    const res = await fetch(`/status/${statusId}`, options);
    const {error, message} = await res.json();
    // Re-enable post button, and update statuses on success
    if(!error){
        postBtn.disabled = false;
    }else{ // Display error tip on failure
        createErrorTip(statusBody.firstElementChild, message);
    }
    // Enable all buttons
    enableButtons();
}

// Send a delete request to delete a status
async function deleteStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode;
    const statusId = event.target.parentNode.parentNode.id;
    // Send patch request with cookies and form data
    const options = {
        method: 'DELETE',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}`, options);
    const {error, message} = await res.json();
    // Re-enable post button, and update statuses on success
    if(!error){
        postBtn.disabled = false;
    }else{ // Display error tip on failure
        createErrorTip(statusBody.firstElementChild, message);
    }
}

// Send a post request to like/un-like a status
async function likeStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode.parentNode.parentNode;
    const statusId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}/like`, options);
    const {error, message} = await res.json();
    // Display error tip on failure
    if(error){
        createErrorTip(statusBody.firstElementChild, message);
    }
}

// Send a post request to dislike/un-dislike a status
async function dislikeStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode.parentNode.parentNode;
    const statusId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}/dislike`, options);
    const {error, message} = await res.json();
    // Display error tip on failure
    if(error){
        createErrorTip(statusBody.firstElementChild, message);
    }
}

// Disables all request buttons
function disableButtons(){
    $('.edit').prop('disabled', true);
    $('.delete').prop('disabled', true);
    $('.confirm').prop('disabled', true);
    $('.cancel').prop('disabled', true);
    postBtn.disabled = true;
}

// Enables all request buttons
function enableButtons(){
    $('.edit').prop('disabled', false);
    $('.delete').prop('disabled', false);
    $('.confirm').prop('disabled', false);
    $('.cancel').prop('disabled', false);
    postBtn.disabled = false;
}

// Creates and inserts error div
function createErrorTip(adjElement, message){
    $('.alert').alert('close');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
    adjElement.insertAdjacentElement('beforeBegin', errorDiv);
}

// Edits the character counter of a text area
function getTextAreaCharacters(event){
    const charCounter = event.target.nextElementSibling;
    charCounter.innerText = `${event.target.value.length}/${event.target.maxLength}`;
}