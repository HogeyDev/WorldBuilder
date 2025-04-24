export let keyboard = {
    state: {},
    get_key: function(key) {
        let raw = get_clean_key_obj(keyboard.state[key]);

        return raw;
    },
    clear_edges: function() {
        Object.keys(keyboard.state).forEach(key => { // lol key actually has the same meaning in both cases here
            keyboard.state[key].edge = {
                down: false,
                up: false,
            };
        });
    },
};

function get_clean_key_obj(dirty) {
    return Object.assign(
        {
            active: false,
            edge: {
                up: false,
                down: false,
            }
        },
        dirty,
    );
}

document.onkeydown = (e) => {
    e.preventDefault();
    if (e.repeat) return; // prevent auto repeat from bullying our custom stuff
    keyboard.state[e.key] = get_clean_key_obj(keyboard.state[e.key]);
    keyboard.state[e.key].active = true;
    keyboard.state[e.key].edge.down = true;
}
document.onkeyup = (e) => {
    e.preventDefault();
    if (e.repeat) return; // prevent auto repeat from bullying our custom stuff
    keyboard.state[e.key] = get_clean_key_obj(keyboard.state[e.key]);
    keyboard.state[e.key].active = false;
    keyboard.state[e.key].edge.up = true;
}
