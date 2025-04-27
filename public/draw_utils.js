import { ctx } from "./ui.js";
import { earth_year } from "./time.js";

export function text_size(fontStyle, text) {
    ctx.font = fontStyle;
    const metrics = ctx.measureText(text);
    const actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    return {
        width: metrics.width,
        height: actualHeight,
    };
}

export function text_topleft(text, x, y) {
    const metrics = ctx.measureText(text);
    const actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const baselineY = y + actualHeight - metrics.actualBoundingBoxDescent;

    ctx.fillText(text, x, baselineY);
}

export function text_topleft_max_width(text, x, y, max_x, bg_col, fadesize) {
    const metrics = ctx.measureText(text);
    const actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const baselineY = y + actualHeight - metrics.actualBoundingBoxDescent;

    const width = max_x - x;

    const gradient = ctx.createLinearGradient(
        max_x - fadesize,
        0,
        max_x,
        0,
    );

    let faded = bg_col;
    if (faded.length == 7) { // includes '#', so length is 6 + 1 = 7
        faded += "00";
    } else {
        faded[6] = "0";
        faded[7] = "0";
    }
    gradient.addColorStop(0, faded);
    gradient.addColorStop(1, bg_col);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, actualHeight);
    ctx.clip();
    ctx.fillText(text, x, baselineY);
    ctx.fillStyle = gradient;
    ctx.fillRect(x + width - fadesize, y, fadesize, actualHeight);
    ctx.restore();
}

export function text_topcenter_max_width(text, x, y, min_x, max_x, bg_col, fadesize) {
    const metrics = ctx.measureText(text);
    const actualHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const baselineY = y + actualHeight - metrics.actualBoundingBoxDescent;

    const new_x = Math.max(min_x, x - metrics.width / 2);
    const width = max_x - new_x;

    const gradient = ctx.createLinearGradient(
        max_x - fadesize,
        0,
        max_x,
        0,
    );

    let faded = bg_col;
    if (faded.length == 7) { // includes '#', so length is 6 + 1 = 7
        faded += "00";
    } else {
        faded[6] = "0";
        faded[7] = "0";
    }
    gradient.addColorStop(0, faded);
    gradient.addColorStop(1, bg_col);

    ctx.save();
    ctx.beginPath();
    ctx.rect(new_x, y, width, actualHeight);
    ctx.clip();
    ctx.fillText(text, new_x, baselineY);
    ctx.fillStyle = gradient;
    ctx.fillRect(new_x + width - fadesize, y, fadesize, actualHeight);
    ctx.restore();
}

export function draw_event(event, x, y, width, height, radius, border) {
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

    ctx.fillStyle = "#ff5555";
    ctx.font = "36px sans-serif";
    // text_topdown_max_width(event.title, x + radius, y + radius, width - radius * 2);
    text_topcenter_max_width(`${event.title} (${event.importance.toFixed(2)})`, x + width / 2, y + radius, x + radius, x + width - radius * 2, "#44475a", radius);

    ctx.fillStyle = "#f1f88c";
    ctx.font = "24px sans-serif";
    // text_topdown_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + radius, y + radius + 40, width - radius * 2);
    text_topcenter_max_width(`${event.date.toFixed(3)} (${earth_year(event.date)})`, x + width / 2, y + radius + 40, x + radius, x + width - radius * 2, "#44475a", radius);

    ctx.fillStyle = "#bd93f9";
    ctx.font = "24px sans-serif";
    // text_topdown_max_width(event.contents, x + radius, y + radius + 40 + 28, width - radius * 2);
    text_topcenter_max_width(event.contents, x + width / 2, y + radius + 40 + 28, x + radius, x + width - radius * 2, "#44475a", radius);
}

export function draw_multiline_text_topleft(lines, x, y, padding=4) {
    let accum = 0;
    for (const line of lines) {
        text_topleft(line, x, y + accum);
        accum += text_size(ctx.font, line).height + padding;
    }
}

export function wrap_text(font, text, width) {
    const lines = [];

    let i = 0;
    let accum = {
        t: "",
        l: 0,
    };
    while (i < text.length) {
        const current = text[i];
        const current_width = text_size(font, current).width;
        if (accum.l + current_width >= width || current == '\n') {
            lines.push(accum.t);
            accum.t = "";
            accum.l = 0;
        }
        accum.t += current;
        accum.l += current_width;
        i++;
    }
    lines.push(accum.t);

    return lines;
}

export function wrap_text_by_word(font, text, width, padding=4) {
    const lines = [];
    const sizes = [];
    const offsets = [];

    const words = text.split(/(?<=\s)/);

    let i = 0;
    let accum = {
        t: "",
        l: 0,
        s: 0,
        m: 0,
    };
    while (i < words.length) {
        const current = words[i];
        const current_size = text_size(font, current);
        if (accum.l + current_size.width >= width || current == '\n') {
            lines.push(accum.t);
            sizes.push(accum.s);
            if (offsets.length)
                offsets.push(offsets[offsets.length - 1] + accum.m + padding);
            else
                offsets.push(accum.m + padding);

            accum.t = "";
            accum.l = 0;
            accum.s = 0;
            accum.m = 0;
        }
        accum.t += current;
        accum.l += current_size.width;
        accum.s += current.length;
        if (accum.m < current_size.height) {
            accum.m = current_size.height;
        }
        i++;
    }
    lines.push(accum.t);
    sizes.push(accum.s);
    offsets.push(offsets[offsets.length - 1] ?? 0 + accum.m + padding);

    offsets.unshift(0);
    offsets.pop();

    return {
        lines: lines,
        sizes: sizes,
        offsets: offsets,
    };
}
