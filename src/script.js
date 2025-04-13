function earth_year(date) {
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

class Event {
    constructor(title, contents, date, importance) {
        this.title = title;
        this.contents = contents;
        this.date = date; // year (use decimals to decide how far into year)
        this.importance = importance;
    }
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function draw_events(events) {
    const sorted = events.toSorted((a, b) => a.date - b.date);
    
    function draw_event(event, x, y, width, height, radius, border) {
        ctx.beginPath();
        ctx.roundRect(
            x,
            y,
            width,
            height,
            radius,
        );
        ctx.closePath();
        ctx.fillStyle = "#44475a";
        ctx.fill();
        ctx.strokeStyle = "#6272a4";
        ctx.lineWidth = border;
        ctx.stroke();

        function text_topdown_max_width(text, x, y, width) {
            const metrics = ctx.measureText(text);
            const actualHeight =
                metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            const baselineY = y + actualHeight - metrics.actualBoundingBoxDescent;

            const gradient = ctx.createLinearGradient(
                x + width - radius,
                0,
                x + width,
                0,
            );
            gradient.addColorStop(0, "#44475a00");
            gradient.addColorStop(1, "#44475aff");

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width, actualHeight);
            ctx.clip();
            ctx.fillText(text, x, baselineY);
            ctx.fillStyle = gradient;
            ctx.fillRect(x + width - radius, y, radius, actualHeight);
            ctx.restore();
        }
        
        function text_topcenter_max_width(text, x, y, min_x, max_x) {
            const metrics = ctx.measureText(text);
            const actualHeight =
                metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            const baselineY = y + actualHeight - metrics.actualBoundingBoxDescent;

            const new_x = Math.max(min_x, x - metrics.width / 2);
            const width = max_x - new_x;

            const gradient = ctx.createLinearGradient(
                new_x + width - radius,
                0,
                new_x + width,
                0,
            );
            gradient.addColorStop(0, "#44475a00");
            gradient.addColorStop(1, "#44475aff");

            ctx.save();
            ctx.beginPath();
            ctx.rect(new_x, y, width, actualHeight);
            ctx.clip();
            ctx.fillText(text, new_x, baselineY);
            ctx.fillStyle = gradient;
            ctx.fillRect(new_x + width - radius, y, radius, actualHeight);
            ctx.restore();
        }

        ctx.fillStyle = "#ff5555";
        ctx.font = "36px sans-serif";
        // text_topdown_max_width(event.title, x + radius, y + radius, width - radius * 2);
        text_topcenter_max_width(event.title, x + width / 2, y + radius, x + radius, x + width - radius * 2);

        ctx.fillStyle = "#f1f88c";
        ctx.font = "24px sans-serif";
        // text_topdown_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + radius, y + radius + 40, width - radius * 2);
        text_topcenter_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + width / 2, y + radius + 40, x + radius, x + width - radius * 2);

        ctx.fillStyle = "#bd93f9";
        ctx.font = "24px sans-serif";
        // text_topdown_max_width(event.contents, x + radius, y + radius + 40 + 28, width - radius * 2);
        text_topcenter_max_width(event.contents, x + width / 2, y + radius + 40 + 28, x + radius, x + width - radius * 2);
    }

    const WIDTH = 320;
    const HEIGHT = 120;
    const MARGIN = 20;

    ctx.fillStyle = "#282a36";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < sorted.length; i++) {
        draw_event(sorted[i], (canvas.width - WIDTH) / 2, (HEIGHT + MARGIN) * i + MARGIN / 2, WIDTH, HEIGHT, 16, 6);
    }
}

const convergent_time = new Event("Origin", "The beginning of time.", 0.0, 1.0);
const apple = new Event("Chestnut", "Chestnut.", 0.5, 0.1);
draw_events([convergent_time, apple]);
