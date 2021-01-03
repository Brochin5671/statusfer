// Returns a date string based on the createdAt and updatedAt strings
export function createDateString(createdAt, updatedAt){
    // Get given date, edit date, current date, yesterday's date
    const date = new Date(createdAt);
    const editDate = (createdAt === updatedAt) ? '':`\nEdited: ${createDateString(updatedAt, updatedAt)}`;
    const now = new Date(Date.now());
    const yesterday = new Date(Date.now());
    yesterday.setDate(now.getDate() - 1);
    // Check if date is from today or yesterday, else return a full date string
    const isToday = date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate();
    const isYesterday = date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && yesterday.getDate() == date.getDate();
    if(isToday){
        return `Today at ${date.toLocaleTimeString()}${editDate}`;
    }else if(isYesterday){
        return `Yesterday at ${date.toLocaleTimeString()}${editDate}`;
    }else{
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}${editDate}`;
    }
}