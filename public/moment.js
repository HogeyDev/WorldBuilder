import { canvas, ctx, mouse } from "./ui.js";
import { draw_event, text_size, text_topcenter_max_width, text_topleft_max_width } from "./draw_utils.js";
import { MomentElement } from "./script.js";
import { earth_year } from "./time.js";
import { Interactor } from "./interactor.js";

export class Moment {
    constructor(title, contents, date, importance) {
        this.title = title;
        this.contents = contents;
        this.date = date; // year (use decimals to decide how far into year)
        this.importance = importance;
    }
}

export class MomentEditor {
    /** @param {MomentElement} moment  **/
    constructor(moment_elem) {
        /** @type {Moment} **/
        this.moment = moment_elem.moment;

        this.margin = 20;
        this.cursor_position = 0;
        /** @type {Interactor[]} **/
        this.interactors = [];
    }
    draw() {
        const [x, y] = [this.margin, this.margin];
        const [width, height] = [
            canvas.width - 2 * this.margin,
            canvas.height - 2 * this.margin,
        ];
        const radius = 16;
        ctx.beginPath();
        ctx.roundRect(
            x, y,
            width, height,
            radius,
        );
        ctx.closePath();
        ctx.fillStyle = "#44475a";
        ctx.fill();
        let color_t = Math.max(0, Math.min(1, this.moment.importance));
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
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = "#ff5555";
        ctx.font = "36px sans-serif";
        text_topleft_max_width(`${this.moment.title} (${this.moment.importance.toFixed(2)})`, x + radius, y + radius, x + width - radius * 2, "#44475a", radius);

        ctx.fillStyle = "#f1f88c";
        ctx.font = "24px sans-serif";
        text_topleft_max_width(`${this.moment.date.toFixed(3)} (${earth_year(this.moment.date)})`, x + radius, y + radius + 40, x + width - radius * 2, "#44475a", radius);

        ctx.fillStyle = "#bd93f9";
        ctx.font = "24px sans-serif";
        text_topleft_max_width(this.moment.contents, x + radius, y + radius + 40 + 28, x + width - radius * 2, "#44475a", radius);

        if (this.interactors.length == 0) {
            this.populate_interactors();
        }

        for (const interactor of this.interactors) {
            if (
                mouse.screenspace.x >= interactor.x && mouse.screenspace.x < interactor.x + interactor.width &&
                mouse.screenspace.y >= interactor.y && mouse.screenspace.y < interactor.y + interactor.height
            ) {
                interactor.draw(interactor);
            }
        }
    }
    populate_interactors() {
        this.interactors = [];
        const [x, y] = [this.margin, this.margin];
        // const [width, height] = [
        //     canvas.width - 2 * this.margin,
        //     canvas.height - 2 * this.margin,
        // ];
        const radius = 16;
        const SELECT_PADDING = 2;

        const title_size = text_size("36px sans-serif", this.moment.title);
        this.interactors.push(new Interactor(
            x + radius - SELECT_PADDING, y + radius - SELECT_PADDING,
            title_size.width + SELECT_PADDING * 2, title_size.height + SELECT_PADDING * 2,
            function(self) {
                ctx.beginPath();
                ctx.roundRect(self.x, self.y, self.width, self.height, 8);
                ctx.closePath();
                ctx.fillStyle = "#6272a440";
                ctx.fill();
            },
            /** @param {Moment} moment */
            function(_mouse, moment) {
                moment.title = prompt("Enter Title Name.");
            },
            false,
        ));
    }
    update() {
        for (const interactor of this.interactors) {
            if (interactor.update(mouse, this.moment, "screenspace")) {
                this.populate_interactors();
            }
        }
    }
}
