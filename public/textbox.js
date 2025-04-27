import { draw_multiline_text_topleft, text_size, text_topleft, wrap_text_by_word } from "./draw_utils.js";
import { keyboard } from "./keyboard.js";
import { ctx } from "./ui.js";

export class UITextEditor {
    constructor(x, y, width, height, radius=[16, 6], colors={background: "#000000ff", text: "#ffffffff", border: "#ff0000ff"}, text={font: "24px sans-serif", content: "", cursor: 0}, post_update=function(){}) {
        [this.radius, this.border_size] = radius;
        [this.x, this.y] = [x, y];
        [this.width, this.height] = [width, height];

        this.font = text.font;
        this.content = text.content;
        this.wrapped_text = wrap_text_by_word(this.font, this.content, this.width);
        this.cursor_index = text.cursor; // index/position of cursor
        if (this.cursor_index < 0) {
            this.cursor_index = this.content.length + this.cursor_index + this.wrapped_text.lines.length; // -1 -> at the end of the text
        }
        this.cursor_size = {
            width: 2,
            height: text_size('M').height,
        }
        this.calculate_cursor_pos();

        this.colors = colors;

        this.multiline_input = false;

        this.post_update = post_update;
    }
    draw(do_cursor=true) {
        ctx.beginPath();
        ctx.roundRect(
            this.x - this.radius, this.y - this.radius,
            this.width + 2 * this.radius, this.height + 2 * this.radius,
            this.radius,
        );
        ctx.closePath();
        ctx.fillStyle = this.colors.background;
        ctx.fill();
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = this.border_size;
        ctx.stroke();

        ctx.font = this.font;
        ctx.fillStyle = this.colors.text;
        if (this.multiline_input) {
            draw_multiline_text_topleft(this.wrapped_text.lines, this.x, this.y);
        } else {
            text_topleft(this.content, this.x, this.y);
        }

        if (do_cursor) this.draw_cursor();
    }
    draw_cursor() {
        const text_left = text_size(this.font, this.wrapped_text.lines[this.cursor_pos.y].slice(0, this.cursor_pos.x)).width;
        const offset = this.wrapped_text.offsets[this.cursor_pos.y];
        // console.log(this.wrapped_text.offsets, this.cursor_pos.y, offset);

        ctx.fillStyle = this.colors.text;
        if (ctx.fillStyle.length == 7) { // includes '#', so length is 6 + 1 = 7
            ctx.fillStyle += "a0";
        } else {
            ctx.fillStyle[6] = "a";
            ctx.fillStyle[7] = "0";
        }
        ctx.fillRect(this.x + text_left, this.y + offset, this.cursor_size.width, this.cursor_size.height);
    }
    update(post_update_args=[]) {
        const typeable = [
            // Lowercase letters
            "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
            // Uppercase letters
            "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
            // Numbers
            "0","1","2","3","4","5","6","7","8","9",
            // Symbols
            "`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+",
            "[", "{", "]", "}", "\\", "|", ";", ":", "'", "\"", ",", "<", ".", ">", "/", "?",
            // Space
            " ",
        ];
        let text_edited = false;
        if (keyboard.get_key("ArrowLeft").edge.down) {
            this.cursor_index = Math.max(0, this.cursor_index - 1);
            this.calculate_cursor_pos();
        } else if (keyboard.get_key("ArrowRight").edge.down) {
            this.cursor_index = Math.min(this.content.length + this.wrapped_text.lines.length - 1, this.cursor_index + 1);
            this.calculate_cursor_pos();
        } else if (keyboard.get_key("Backspace").edge.down) {
            if (keyboard.get_key("Control").active) {
                this.content = "";
                this.cursor_index = 0;
            } else {
                this.content = this.content.slice(0, (this.cursor_index - (this.wrapped_text.lines.length - 1)) - 1) + this.content.slice(this.cursor_index - (this.wrapped_text.lines.length - 1));
                this.cursor_index = Math.max(0, this.cursor_index - 1);
            }
            text_edited = true;
        } else for (const c of typeable) {
            if (keyboard.get_key(c).edge.down) {
                this.cursor_index++;
                this.content = this.content.slice(0, this.cursor_index - (this.wrapped_text.lines.length - 1) - 1) + c + this.content.slice(this.cursor_index - (this.wrapped_text.lines.length - 1) - 1);
                text_edited = true;
            }
        }

        if (text_edited && this.multiline_input) {
            const old_line_count = this.wrapped_text.lines.length;
            this.wrapped_text = wrap_text_by_word(this.font, this.content, this.width);
            if (this.wrapped_text.lines.length > old_line_count) {
                this.cursor_index++;
            }
            this.calculate_cursor_pos();
        }

        this.post_update(...post_update_args);
    }
    calculate_cursor_pos() {
        let index = this.cursor_index;
        for (let i = 0; i < this.wrapped_text.lines.length; i++) {
            const size = this.wrapped_text.sizes[i];
            if (index <= size) {
                this.cursor_pos = {
                    x: index,
                    y: i,
                };
                return;
            } else {
                index -= size + 1;
            }
        }

        this.cursor_pos = {
            x: 52,
            y: 0,
        };
    }
    enable_multiline_input() {
        this.multiline_input = true;
    }
}
