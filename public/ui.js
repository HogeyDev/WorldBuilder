import { mode_bar, MODE_BAR_WIDTH, origin_offset } from "./script.js";

export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mode_bar.x = canvas.width - MODE_BAR_WIDTH;
    request_frame();
}

export let mouse = {
    screenspace: {
        x: 0,
        y: 0,
    },
    worldspace: {
        x: 0,
        y: 0,
    },
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
    mouse.screenspace.x = e.clientX;
    mouse.screenspace.y = e.clientY;

    mouse.worldspace = {
        x: origin_offset.x + mouse.screenspace.x,
        y: origin_offset.y + mouse.screenspace.y,
    }
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

export let draw_frame = true;
export function request_frame() {
    draw_frame = true;
}
export function clear_frame_request() {
    draw_frame = false;
}

export const UIMode = Object.freeze({
    Normal: 0,
    Dragging: 1,
    MomentOpened: 2,
});
export let ui_mode = UIMode.Normal;
export function set_mode(mode) {
    ui_mode = mode;
}

export function mode_to_color(mode) {
    switch (mode) {
        case UIMode.Normal:         return "#50fa7b";
        case UIMode.Dragging:       return "#ff5555";
        case UIMode.MomentOpened:   return "#bd93f9";
    }
    return "#000000";
}
