import { canvas, ctx, mouse, request_frame } from "./ui.js";
import { text_size, text_topleft_max_width } from "./draw_utils.js";
import { MomentElement } from "./script.js";
import { earth_year } from "./time.js";
import { Interactor } from "./interactor.js";
import { UITextEditor } from "./textbox.js";
import { keyboard } from "./keyboard.js";

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

        this.radius = 16;
        this.margin = 20;
        this.cursor_position = 0;
        /** @type {Interactor[]} **/
        this.interactors = [];

        /** @type {UITextEditor} **/
        this.input_popup = null;

        const moment_editor_border_radius = 16;
        const moment_editor_height = this.margin + 68 + this.radius + moment_editor_border_radius;
        this.moment_content_editor = new UITextEditor(
            this.margin + this.radius + moment_editor_border_radius, moment_editor_height,
            canvas.width - (this.margin + this.radius + moment_editor_border_radius) * 2, canvas.height - this.margin * 2 - moment_editor_border_radius - moment_editor_height,
            [16, 6],
            {
                text: "#bd93f9",
                background: "#282a36",
                border: "#bd93f900",
            },
            {
                cursor: -1,
                content: this.moment.contents,
                font: "24px sans-serif",
            },
            /** @param {Moment} moment **/
            function(moment) {
                moment.contents = this.content;
            },
        );
        this.moment_content_editor.enable_multiline_input();

    }
    draw() {
        const [x, y] = [this.margin, this.margin];
        const [width, height] = [
            canvas.width - 2 * this.margin,
            canvas.height - 2 * this.margin,
        ];
        ctx.beginPath();
        ctx.roundRect(
            x, y,
            width, height,
            this.radius,
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
        text_topleft_max_width(`${this.moment.title} (${this.moment.importance.toFixed(2)})`, x + this.radius, y + this.radius, x + width - this.radius * 2, "#44475a", this.radius);

        ctx.fillStyle = "#f1f88c";
        ctx.font = "24px sans-serif";
        text_topleft_max_width(`${this.moment.date.toFixed(3)} (${earth_year(this.moment.date)})`, x + this.radius, y + this.radius + 40, x + width - this.radius * 2, "#44475a", this.radius);

        // ctx.fillStyle = "#bd93f9";
        // ctx.font = "24px sans-serif";
        // text_topleft_max_width(this.moment.contents, x + radius, y + radius + 40 + 28, x + width - radius * 2, "#44475a", radius);
        this.moment_content_editor.draw(true);

        if (this.input_popup !== null) {
            this.input_popup.draw();
        } else {
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
    }
    populate_interactors() {
        this.interactors.length = 0;

        const [x, y] = [this.margin, this.margin];
        // const [width, height] = [
        //     canvas.width - 2 * this.margin,
        //     canvas.height - 2 * this.margin,
        // ];
        const RADIUS = 16;
        const SELECT_PADDING = 2;

        function editor_hover_draw(self) {
            ctx.beginPath();
            ctx.roundRect(self.x, self.y, self.width, self.height, 8);
            ctx.closePath();
            ctx.fillStyle = "#6272a450";
            ctx.fill();
            request_frame();
        }

        const title_size = text_size("36px sans-serif", this.moment.title);
        this.interactors.push(new Interactor(
            x + RADIUS - SELECT_PADDING, y + RADIUS - SELECT_PADDING,
            title_size.width + SELECT_PADDING * 2, title_size.height + SELECT_PADDING * 2,
            editor_hover_draw,
            /** @param {Moment} moment */
            function(_mouse, editor) {
                const font = "48px sans-serif";
                const height = text_size(font, "M").height;
                editor.input_popup = new UITextEditor(
                    0, (canvas.height - height) / 2, 0, height, [16, 6],
                    {
                        text: "#f8f8f8",
                        background: "#282a36",
                        border: "#50fa7b",
                    },
                    {
                        cursor: -1,
                        content: editor.moment.title,
                        font: font,
                    },
                    function(editor) {
                        const metrics = text_size(this.font, this.content);
                        this.width = metrics.width;

                        this.x = (canvas.width - this.width) / 2;

                        if (keyboard.get_key("Escape").active) {
                            editor.input_popup = null;
                        }
                        if (keyboard.get_key("Enter").active) {
                            if (this.content.length > 0) {
                                editor.moment.title = this.content;
                            }
                            editor.input_popup = null;
                            editor.populate_interactors();
                        }
                    },
                );
            },
            false,
        ));

        const importance_size = text_size("36px sans-serif", `(${this.moment.importance.toFixed(2)})`);
        const importance_offset = text_size("36px sans-serif", this.moment.title + ' ').width;
        this.interactors.push(new Interactor(
            x + RADIUS + importance_offset - SELECT_PADDING, y + RADIUS - SELECT_PADDING,
            importance_size.width + SELECT_PADDING * 2, importance_size.height + SELECT_PADDING * 2,
            editor_hover_draw,
            /** @param {Moment} moment */
            function(_mouse, editor) {
                const font = "48px sans-serif";
                const height = text_size(font, "M").height;
                editor.input_popup = new UITextEditor(
                    0, (canvas.height - height) / 2, 0, height, [16, 6],
                    {
                        text: "#f8f8f8",
                        background: "#282a36",
                        border: "#50fa7b",
                    },
                    {
                        cursor: -1,
                        content: editor.moment.importance.toString(),
                        font: font,
                    },
                    function(editor) {
                        const metrics = text_size(this.font, this.content);
                        this.width = metrics.width;

                        this.x = (canvas.width - this.width) / 2;

                        if (keyboard.get_key("Escape").active) {
                            editor.input_popup = null;
                        }
                        if (keyboard.get_key("Enter").active) {
                            const parsed = parseFloat(this.content);
                            if (!isNaN(parsed)) {
                                editor.moment.importance = parsed;
                            }
                            editor.input_popup = null;
                            editor.populate_interactors();
                        }
                    },
                );
            },
            false,
        ));

        const time_size = text_size("24px sans-serif", this.moment.date.toFixed(3).toString());
        this.interactors.push(new Interactor(
            x + RADIUS - SELECT_PADDING, y + RADIUS + 40 - SELECT_PADDING,
            time_size.width + SELECT_PADDING * 2, time_size.height + SELECT_PADDING * 2,
            editor_hover_draw,
            /** @param {Moment} moment */
            function(_mouse, editor) {
                const font = "48px sans-serif";
                const height = text_size(font, "M").height;
                editor.input_popup = new UITextEditor(
                    0, (canvas.height - height) / 2, 0, height, [16, 6],
                    {
                        text: "#f8f8f8",
                        background: "#282a36",
                        border: "#50fa7b",
                    },
                    {
                        cursor: -1,
                        content: editor.moment.date.toString(),
                        font: font,
                    },
                    function(editor) {
                        const metrics = text_size(this.font, this.content);
                        this.width = metrics.width;

                        this.x = (canvas.width - this.width) / 2;

                        if (keyboard.get_key("Escape").active) {
                            editor.input_popup = null;
                        }
                        if (keyboard.get_key("Enter").active) {
                            const parsed = parseFloat(this.content);
                            if (!isNaN(parsed)) {
                                editor.moment.date = parsed;
                            }
                            editor.input_popup = null;
                            editor.populate_interactors();
                        }
                    },
                );
            },
            false,
        ));
    }
    update() {
        if (this.input_popup !== null) {
            this.input_popup.update([this]); // pass in the editor as an argument to our custom update function
            return;
        }
        this.moment_content_editor.update([this.moment]);
        for (const interactor of this.interactors) {
            if (interactor.update(mouse, this, "screenspace")) {
                this.populate_interactors();
                break;
            }
        }
    }
}
