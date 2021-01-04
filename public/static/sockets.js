// Import
import {createErrorTip} from './misc.js';
import {createStatusMedia, createDateString} from './statusFunctions.js';

// Setup client-side socket-io
export const socket = io({
    // Use websocket transport
    transports: ['websocket'],
});

// Add new status media object when postStatus event is emitted
export function socketPostStatus(statusJSON){
    createStatusMedia(statusJSON, true);
}

// Delete specific status media object when delete event is emitted
export function socketDeleteStatus(statusId){
    document.getElementById(statusId).remove();
}

// Update specific status media object when patch event is emitted
export function socketPatchStatus({_id, createdAt, updatedAt, status}){
    const updatedStatus = document.getElementById(_id);
    updatedStatus.querySelector('.statusText').innerText = status;
    updatedStatus.querySelector('.statusDate').innerText = createDateString(createdAt, updatedAt);
}

// Alert disconnected message at top of page
socket.on('disconnect', () => {
    createErrorTip(document.querySelector('main').firstElementChild, 'Lost connection! Trying to reconnect...');
});

// When reconnecting, use polling transport, and then upgrade to websocket
socket.on('reconnect_attempt', () => {
    socket.opts.transports = ['polling', 'websocket'];
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