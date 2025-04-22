export function earth_year(date) {
    function is_leap_year(year) {
        return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);
    }

    const year = Math.floor(date);
    const fraction = date - year;
    const leap = is_leap_year(year);

    const months = [
        ["January", 31],
        ["February", leap ? 29 : 28],
        ["March", 31],
        ["April", 30],
        ["May", 31],
        ["June", 30],
        ["July", 31],
        ["August", 31],
        ["September", 30],
        ["October", 31],
        ["November", 30],
        ["December", 31]
    ];

    const days_in_year = leap ? 366 : 365;
    let day_of_year = Math.floor(fraction * days_in_year);

    for (const [month, days_in_month] of months) {
        if (day_of_year < days_in_month) {
            return `${month} ${day_of_year + 1}, ${year}`;
        }
        day_of_year -= days_in_month;
    }
}

export function kys(){
    console.log("fjdskl");
}
