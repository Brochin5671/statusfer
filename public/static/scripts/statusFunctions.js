// Import requests
import {postStatus, patchStatus, deleteStatus, likeStatus, dislikeStatus} from './requests.js';

// Select important elements
const statusList = document.getElementById('statusList');

// Creates and adds a status media element to the status list
export function createStatusMedia(statusJSON, isNew){
    // Create media element
    const statusMedia = document.createElement('li');
    statusMedia.id = statusJSON._id;
    statusMedia.className = 'media position-relative border-bottom';
    // Create body element
    const statusBody = document.createElement('div');
    statusBody.className = 'media-body m-3 text-break';
    // Create link element
    const statusLink = document.createElement('a');
    statusLink.className = 'btn btn-secondary align-self-center mr-3 view';
    statusLink.href = `/status/${statusJSON._id}`;
    statusLink.innerText = 'View';
    // Create statusUser element
    const statusUser = document.createElement('a');
    statusUser.className = 'statusUser h5 text-reset';
    statusUser.href = `/user/${statusJSON.userId}`;
    statusUser.innerText = statusJSON.user;
    // Create status text element
    const statusText = document.createElement('p');
    statusText.className = 'statusText mt-2';
    statusText.innerText = statusJSON.status;
    // Get the date string of the status and create date text element
    const statusDate = document.createElement('p');
    statusDate.className = 'statusDate small';
    statusDate.innerText = createDateString(statusJSON.createdAt, statusJSON.updatedAt);
    // Create like button
    const likeBtn = document.createElement('button');
    likeBtn.innerText = `▲ ${statusJSON.likes.length}`;
    likeBtn.type = 'click';
    likeBtn.className = 'btn btn-secondary btn-sm like';
    likeBtn.addEventListener('click', likeStatus);
    // Create dislike button
    const dislikeBtn = document.createElement('button');
    dislikeBtn.innerText = `▼ ${statusJSON.dislikes.length}`;
    dislikeBtn.type = 'click';
    dislikeBtn.className = 'btn btn-secondary btn-sm dislike';
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
    statusBody.appendChild(statusUser);
    statusBody.appendChild(statusText);
    statusBody.appendChild(statusDate);
    statusBody.appendChild(feedBackDivWrap);
    statusMedia.appendChild(statusBody);
    statusMedia.appendChild(statusLink);
    // Append to beginning of list if new element, else append to end of list
    if(isNew && statusList.firstElementChild) statusList.firstElementChild.insertAdjacentElement('beforeBegin', statusMedia);
    else statusList.appendChild(statusMedia);
    // Add edit and delete buttons if owned by user
    const userInfo = localStorage.getItem('userInfo').split(',');
    if(userInfo[1] === statusJSON.userId){
        createUserStatusTools(statusBody);
    }
}

// Add edit and delete buttons to statuses owned by the user
function createUserStatusTools(statusBody){
    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.type = 'click';
    editBtn.className = 'btn btn-secondary mr-2 edit';
    statusBody.appendChild(editBtn);
    editBtn.addEventListener('click', editStatus);
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.type = 'click';
    deleteBtn.className = 'btn btn-secondary delete';
    statusBody.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', async (event) => {
        // Send delete request
        disableButtons();
        await deleteStatus(event);
        enableButtons();
    });
}

// Returns a date string based on the createdAt and updatedAt strings
export function createDateString(createdAt, updatedAt){
    // Get given date, edit date, current date, yesterday's date
    const date = new Date(createdAt);
    const editDate = (createdAt === updatedAt) ? '':`\nEdited: ${createDateString(updatedAt, updatedAt)}`;
    const now = new Date(Date.now());
    const yesterday = new Date(Date.now());
    yesterday.setDate(now.getDate() - 1);
    // Check if date is from today, yesterday, or this year, else return a full date string
    const isToday = date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate();
    const isYesterday = date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && yesterday.getDate() == date.getDate();
    const isThisYear = date.getFullYear() == now.getFullYear(); 
    if(isToday){
        return `Today at ${date.toLocaleTimeString()}${editDate}`;
    }else if(isYesterday){
        return `Yesterday at ${date.toLocaleTimeString()}${editDate}`;
    }else if(isThisYear){
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()} at ${date.toLocaleTimeString()}${editDate}`;
    }else{
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}${editDate}`;
    }
}

// Creates status to be posted
export async function createStatus(event){
    // Prevent refresh
    event.preventDefault();
    disableButtons();
    // Send post request
    await postStatus(event);
    enableButtons();
}

// Hides non-edit elements, creates text area, confirm and cancel buttons
function editStatus(event){
    // Get status id
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
    confirmBtn.className = `btn btn-secondary mr-2 confirm editDeletable${statusId}`;
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
    cancelBtn.className = `btn btn-secondary mr-2 cancel editDeletable${statusId}`;
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

// Disables all request buttons
function disableButtons(){
    $('.edit').prop('disabled', true);
    $('.delete').prop('disabled', true);
    $('.confirm').prop('disabled', true);
    $('.cancel').prop('disabled', true);
    $('#postBtn').prop('disabled', true);
}

// Enables all request buttons
function enableButtons(){
    $('.edit').prop('disabled', false);
    $('.delete').prop('disabled', false);
    $('.confirm').prop('disabled', false);
    $('.cancel').prop('disabled', false);
    $('#postBtn').prop('disabled', false);
}

// Edits the character counter of a text area
export function getTextAreaCharacters(event){
    const charCounter = event.target.nextElementSibling;
    charCounter.innerText = `${event.target.value.length}/${event.target.maxLength}`;
}