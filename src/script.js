import { mouse, canvas, ctx, UIMode, ui_mode, set_mode, mode_to_color } from "./ui.js";
import { Interactor } from "./interactor.js";
import { Moment, MomentEditor } from "./moment.js";
import { draw_event } from "./draw_utils.js";
import { keyboard } from "./keyboard.js";

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

export let origin_offset = {
    x: 0,
    y: 0,
};
let world_drag_origins = {
    active: false,
    mouse: {
        x: mouse.x,
        y: mouse.y,
    },
    world: {
        x: origin_offset.x,
        y: origin_offset.y,
    }
};
function process_world_drag() {
    if (ui_mode === UIMode.Normal) {
        if (mouse.state_edge.rmb && mouse.state.rmb) {
            world_drag_origins = {
                active: true,
                mouse: {
                    x: mouse.screenspace.x,
                    y: mouse.screenspace.y,
                },
                world: {
                    x: origin_offset.x,
                    y: origin_offset.y,
                },
            };
        } else if (!mouse.state.rmb) {
            world_drag_origins.active = false;
        }

        if (world_drag_origins.active) {
            origin_offset.x = world_drag_origins.mouse.x - mouse.screenspace.x + world_drag_origins.world.x;
            origin_offset.y = world_drag_origins.mouse.y - mouse.screenspace.y + world_drag_origins.world.y;
        }
    }
}

class UIElement { // the whole point is that it's positioned STATICLY, so modes don't really affect these elements, if not at all.
    constructor(x, y, width, height, draw_callback, click_callback) {
        [this.x, this.y] = [x, y];
        [this.width, this.height] = [width, height];

        this.interactor = new Interactor(x, y, width, height, draw_callback, click_callback, false);
    }
}

export let ui_elements = [
    new UIElement(canvas.width - 5, 0, 5, canvas.height,
        function(self) {
            ctx.fillStyle = mode_to_color(ui_mode);
            ctx.fillRect(self.x, self.y, self.width, self.height);
        },
    ),
];

let moments = [
    new MomentElement(100, 100, 320, 120, "Origin", "The beginning of time.", 0.0, 1.0),
    new MomentElement(400, 400, 320, 120, "Chestnut", "The chestnuts are the deciduous trees and shrubs in the genus Castanea, in the beech family Fagaceae. The name also refers to the edible nuts they produce.[1][2][3] They are native to temperate regions of the Northern Hemisphere", 0.5, 0.1),
];

function draw_moments() {
    for (let i = moments.length - 1; i >= 0; i--) {
        const moment = moments[i];
        moment.interactor.draw(moment.moment);
    }

    if (world_drag_origins.active) {
        const C_LENGTH = 20;
        const C_WIDTH = 2;

        ctx.beginPath();
        ctx.moveTo((canvas.width - C_LENGTH) / 2, canvas.height / 2);
        ctx.lineTo((canvas.width + C_LENGTH) / 2, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, (canvas.height - C_LENGTH) / 2);
        ctx.lineTo(canvas.width / 2, (canvas.height + C_LENGTH) / 2);
        ctx.closePath();
        ctx.strokeStyle = "#ffffffa0";
        ctx.lineWidth = C_WIDTH;
        ctx.stroke();
    }
}

function draw_ui() {
    ui_elements.forEach(x => {
        x.interactor.draw(x);
    });
}

function update_mode() {
    switch (ui_mode) {
        case UIMode.Normal: {
            if (keyboard.get_key("d").edge.down) {
                set_mode(UIMode.Dragging);
            }
            break;
        }
        case UIMode.Dragging: {
            if (keyboard.get_key("d").edge.down) {
                set_mode(UIMode.Normal);
            }
            break;
        }
        case UIMode.MomentOpened: {
            if (keyboard.get_key("d").edge.down) {
                set_mode(UIMode.Normal);
            }
            break;
        }
    }
}

export function open_moment(index) {
    set_mode(UIMode.MomentOpened);

    let editor = new MomentEditor(moments[0]);
    ui_elements.unshift();
}

function tick() {
    ctx.fillStyle = "#282a36";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    update_mode();
    process_world_drag();

    const ui_interact = ui_elements.some(x => {
        // x.interactor.draw_hitbox("#ff5555");
        return x.interactor.update(mouse);
    });

    if (!ui_interact) {
        for (let i = 0; i < moments.length; i++) {
            if (moments[i].interactor.update(mouse)) {
                moments.unshift(moments.splice(i, 1)[0]);
                break;
            }
        }
    }

    if (keyboard.get_key("f").edge.down) {
        open_moment(0);
    }

    draw_moments();
    draw_ui(); // drawing second ensures ui is always on top

    mouse.state_edge.lmb = false;
    mouse.state_edge.rmb = false;
    keyboard.clear_edges();

    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
