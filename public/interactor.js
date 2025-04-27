import { UIMode, ctx, request_frame, ui_mode } from "./ui.js";

export class Interactor {
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
        request_frame();
    }
    fill_hitbox(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update(mouse, click_params=undefined, mouse_locale="worldspace") {
        let focused = false;

        if (
            mouse.state_edge.lmb && mouse.state.lmb &&
            mouse[mouse_locale].x >= this.x && mouse[mouse_locale].x < this.x + this.width &&
            mouse[mouse_locale].y >= this.y && mouse[mouse_locale].y < this.y + this.height
        ) {
            if (click_params === undefined) this.click_callback(mouse);
            else this.click_callback(mouse, click_params);
            focused = true;
            request_frame();
        }
        switch (ui_mode) {
            case UIMode.Normal: {
                break;
            }
            case UIMode.Dragging: {
                if (!this.draggable) break;

                if (mouse.state_edge.rmb && mouse.state.rmb) {
                    this.drag_origins = {
                        mouse: {
                            x: mouse.worldspace.x,
                            y: mouse.worldspace.y,
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
                    this.x = mouse.worldspace.x - this.drag_origins.mouse.x + this.drag_origins.interactor.x;
                    this.y = mouse.worldspace.y - this.drag_origins.mouse.y + this.drag_origins.interactor.y;
                    focused = true;
                    request_frame();
                }
                break;
            }
        }
        return focused;
    }
}

