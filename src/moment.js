import { set_mode } from "./ui.js";
import { ui_elements } from "./script.js";

export class Moment {
    constructor(title, contents, date, importance) {
        this.title = title;
        this.contents = contents;
        this.date = date; // year (use decimals to decide how far into year)
        this.importance = importance;
    }
}

export class MomentEditor {
    constructor(moment) {
        this.moment = moment;
    }
}

close_moment();
