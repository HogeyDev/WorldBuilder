export let keyboard = {
    state: {},
    get_key: function(key) {
        let raw = keyboard.state[key];

        if (raw === undefined) {
            raw = {
                active: false,
                edge: {
                    down: false,
                    up: false,
                },
            };
        }

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


document.onkeydown = (e) => {
    if (e.repeat) return; // prevent auto repeat from bullying our custom stuff
    keyboard.state[e.key] = {
        active: true,
        edge: {
            down: true,
            up: false,
        },
    };
}
document.onkeyup = (e) => {
    if (e.repeat) return; // prevent auto repeat from bullying our custom stuff
    keyboard.state[e.key] = {
        active: false,
        edge: {
            down: false,
            up: true,
        },
    };
}
