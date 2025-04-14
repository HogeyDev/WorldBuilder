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

class Moment {
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
    let color_t = Math.max(0, Math.min(1, event.importance));
    let color = [
        0x62 * (1 - color_t) + 0xff * color_t,
        0x72 * (1 - color_t) + 0xb8 * color_t,
        0xa4 * (1 - color_t) + 0x6c * color_t,
    ];
    // ctx.strokeStyle = "#6272a4";
    // ctx.strokeStyle = "#ffb86c";
    let stroke_style = '#';
    for (const channel of color) {
        stroke_style += Math.round(channel).toString(16).padStart(2, '0');
    }
    ctx.strokeStyle = stroke_style;
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
    text_topcenter_max_width(`${event.title} (${event.importance.toFixed(2)})`, x + width / 2, y + radius, x + radius, x + width - radius * 2);

    ctx.fillStyle = "#f1f88c";
    ctx.font = "24px sans-serif";
    // text_topdown_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + radius, y + radius + 40, width - radius * 2);
    text_topcenter_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + width / 2, y + radius + 40, x + radius, x + width - radius * 2);

    ctx.fillStyle = "#bd93f9";
    ctx.font = "24px sans-serif";
    // text_topdown_max_width(event.contents, x + radius, y + radius + 40 + 28, width - radius * 2);
    text_topcenter_max_width(event.contents, x + width / 2, y + radius + 40 + 28, x + radius, x + width - radius * 2);
}

function draw_events(events) {
    const sorted = events.toSorted((a, b) => a.date - b.date);
}

let mouse = {
    x: -1,
    y: -1,
    state: {
        lmb: false,
        rmb: false,
    },
    state_edge: {
        lmb: false,
        rmb: false,
    },
};
document.oncontextmenu = (e) => {
    e.preventDefault();
}
document.onmousemove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}
document.onmousedown = (e) => {
    switch (e.button) {
        case 0: {
            mouse.state_edge.lmb = true;
            mouse.state.lmb = true;
            break;
        }
        case 2: {
            mouse.state_edge.rmb = true;
            mouse.state.rmb = true;
            break;
        }
    }
}
document.onmouseup = (e) => {
    switch (e.button) {
        case 0: {
            mouse.state_edge.lmb = true;
            mouse.state.lmb = false;
            break;
        }
        case 2: {
            mouse.state_edge.rmb = true;
            mouse.state.rmb = false;
            break;
        }
    }
}

class Interactor {
    constructor(x, y, width, height, draw_callback=function(){}, click_callback=function(_){}, draggable=false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.draw = draw_callback;
        this.click_callback = click_callback;
        this.draggable = draggable;
        this.dragging = false;
    }
    draw_hitbox(color) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    fill_hitbox(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update(mouse) {
        switch (ui_mode) {
            case UIMode.Normal: {
                if (
                    mouse.state_edge.lmb && mouse.state.lmb &&
                    mouse.x >= this.x && mouse.x < this.x + this.width &&
                    mouse.y >= this.y && mouse.y < this.y + this.height
                ) {
                    this.click_callback(mouse);
                    return true;
                }
                break;
            }
            case UIMode.Dragging: {
                if (!this.draggable) break;

                if (mouse.state_edge.rmb && mouse.state.rmb) {
                    this.drag_origins = {
                        mouse: {
                            x: mouse.x,
                            y: mouse.y,
                        },
                        interactor: {
                            x: this.x,
                            y: this.y,
                        },
                    };
                } else if (!mouse.state.rmb) {
                    this.dragging = false;
                }

                if (
                    this.dragging ||
                    (
                        mouse.state.rmb &&
                        this.drag_origins.mouse.x >= this.x && this.drag_origins.mouse.x < this.x + this.width &&
                        this.drag_origins.mouse.y >= this.y && this.drag_origins.mouse.y < this.y + this.height
                    )
                ) {
                    this.dragging = true;
                    this.x = mouse.x - this.drag_origins.mouse.x + this.drag_origins.interactor.x;
                    this.y = mouse.y - this.drag_origins.mouse.y + this.drag_origins.interactor.y;
                    return true;
                }
                break;
            }
        }
        return false;
    }
}

class MomentElement {
    constructor(x, y, width, height, title, contents, date, importance) {
        this.moment = new Moment(title, contents, date, importance);
        this.interactor = new Interactor(x, y, width, height,
            function(moment) {
                draw_event(moment, this.x - origin_offset.x, this.y - origin_offset.y, this.width, this.height, 16, 6);
            },
            () => {},
            true,
        );
    }
}

let origin_offset = {
    x: 0,
    y: 0,
};

const moments = [
    new MomentElement(100, 100, 320, 120, "Origin", "The beginning of time.", 0.0, 1.0),
    new MomentElement(400, 400, 320, 120, "Chestnut", "The chestnuts are the deciduous trees and shrubs in the genus Castanea, in the beech family Fagaceae. The name also refers to the edible nuts they produce.[1][2][3] They are native to temperate regions of the Northern Hemisphere", 0.5, 0.1),
];

const UIMode = Object.freeze({
    Normal: 0,
    Dragging: 1,
});
let ui_mode = UIMode.Normal;

function tick() {
    // set background color;
    ctx.fillStyle = "#282a36";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // process interacting with each MomentElement and move it to the front if necessary
    for (let i = 0; i < moments.length; i++) {
        if (moments[i].interactor.update(mouse)) {
            moments.unshift(moments.splice(i, 1)[0]);
            break;
        }
    }

    // draw each MomentElement (in reverse to preserve front-to-back order)
    for (let i = moments.length - 1; i >= 0; i--) {
        const moment = moments[i];

        moment.interactor.draw(moment.moment);
        // moment.interactor.draw_hitbox("#ff555580");
    }

    // mouse edge is a single frame event, so clear it for the next frame
    mouse.state_edge.lmb = false;
    mouse.state_edge.rmb = false;

    // request to update the window as soon as the browser can
    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
