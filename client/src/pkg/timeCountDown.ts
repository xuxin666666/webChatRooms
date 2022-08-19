/**
 * 倒计时，把时间转换为年月日时分秒的格式
 * @param timestamp 
 * @returns 
 */
const timeCountDown = (timestamp: number | string) => {
    let time = Math.floor((
        typeof timestamp === 'number' ? timestamp : parseInt(timestamp)
    ) / 1000)

    let years: number, 
        months: number, 
        days: number, 
        hours: number, 
        minutes: number, 
        seconds: number;

    seconds = time % 60

    time = (time - seconds) / 60
    minutes = time % 60

    time = (time - minutes) / 60
    hours = time % 24

    time = (time - hours) / 24
    days = time % 30

    time = (time - days) / 30
    months = time % 12

    years = (time - months) / 12

    const YDisplay = years ? years + 'Y-' : '';
    const MDisplay = months ? years + 'M-' : '';
    const DDisplay = days ? days + 'd ' : '';
    const hDisplay = hours + 'h ';
    const mDisplay = minutes + 'm ';
    const sDisplay = seconds + 's';

    return YDisplay + MDisplay + DDisplay + hDisplay + mDisplay + sDisplay;
}

export default timeCountDown