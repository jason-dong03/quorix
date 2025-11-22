
export function isMarketOpen(){
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const marketOpen = (currentHour > 9 || (currentHour === 9 && currentMinutes >=30));
    const marketClosed = currentHour >=16;

    return marketOpen && !marketClosed;
}
export function getTimeUntil930AM() {
    const now = new Date(); 

    const targetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        9, 
        30, 
        0 
    );

    if (now.getTime() > targetTime.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeDifference = targetTime.getTime() - now.getTime();

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    return {
        hours: hours,
        minutes: minutes
    };
}
export function getTimeUntil400PM(){
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);

    let timeDifference = targetTime.getTime() - now.getTime();

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };


}