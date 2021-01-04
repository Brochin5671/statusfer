// Import
import {createErrorTip} from './misc.js';
import {createStatusMedia, createDateString} from './statusFunctions.js';

// Select important elements
const title = document.querySelector('h1');

// Setup client-side socket-io
export const socket = io({
    // Use websocket transport
    transports: ['websocket'],
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
socket.on('patchStatus', ({_id, createdAt, updatedAt, status}) => {
    const updatedStatus = document.getElementById(_id);
    updatedStatus.querySelector('.statusText').innerText = status;
    updatedStatus.querySelector('.statusDate').innerText = createDateString(createdAt, updatedAt);
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
    createErrorTip(title, 'Lost connection! Trying to reconnect...');
});

// When reconnecting, use polling transport, and then upgrade to websocket
socket.on('reconnect_attempt', () => {
    socket.opts.transports = ['polling', 'websocket'];
});