import { FontEnum, LetterBehaviorEnum } from "./enum.js";
import { MessageEnum } from "./messages/general.js";

export class TextHandler {
    lines = [[]];

    constructor(lines, x, y) {
        this.lines = lines;
        this.x = x;
        this.y = y;
    }

    static forClearText(text, x, y, size, font=FontEnum.JACQUARD) {
        return new TextHandler(convert_text(text, size, font), x, y);
    }

    static forEnum(message, x, y) {
        var lines = convert_node_text(message);
        return new TextHandler(lines, x, y);
    }

    static get_width(inputtext, fontsize, fontfamily) {
        let canvas = new OffscreenCanvas(1000, 1000);
        let context = canvas.getContext("2d");
        context.font = fontsize + "px " + FontEnum.toText(fontfamily);
        let width = context.measureText(inputtext).width;
        return Math.ceil(width);
    }

    changeText(text) {
        this.text = text;
        this.lines = convert_text(text, this.size, this.font);
    }

    think() {
        this.lines.forEach(line => {
            line.forEach(letter => {
                letter.think();
            });
        });
    }

    draw(ctx) {
        for (let i = 0; i <= this.lines.length - 1; i++) {
            let cal_x = 0;
            let cal_spacing = this.x;
            for (let j = 0; j <= this.lines[i].length - 1; j++) {
                let letter = this.lines[i][j];
                cal_x = cal_spacing;
                let cal_y = this.y + (i * letter.settings.fontsize);
                letter.draw(ctx, cal_x, cal_y);
                cal_spacing = cal_spacing + letter.spacing;
            }
        }
    }
}

function convert_node_text(message) {
    let text = MessageEnum.toText(message);

    let settings = {
        fontfamily: FontEnum.JACQUARD,
        fontsize: 42,
        colour: "#333",
        behavior: LetterBehaviorEnum.NORMAL,
    };

    let lines = [[]];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "[") {
            // Read "nodes"
            if (text.substr(i+1, "set ".length) === "set ") {
                let close = text.substr(i).indexOf("]");
                if (close === -1) {
                    console.log("SOMEHTING DID DONE A FUCKUP!", [text, i]);
                    break;
                }
                let settings_node = text.substr(i+1, close-1);
                read_settings(settings_node, settings);
                i = i + settings_node.length + 1;
            } else if (text.substr(i+1, "br".length) === "br") {
                lines.push([]);
                i = i + 3;
            }
        } else {
            lines[lines.length-1].push(new Letter(
                text[i],
                settings
            ));
        }
    }

    return lines;
}

function read_settings(settings_node, settings) {
    Object.keys(settings).forEach(key => {
        let i = settings_node.indexOf(key + "=");
        if (i === -1) {
            return;
        }
        let keyless_index = i + key.length + 1;
        let end = settings_node.substr(keyless_index).indexOf(" ");
        if (end === -1) { end = settings_node.length}
        let value = settings_node.substr(keyless_index, end);
        settings[key] = value;
    });
}

function convert_text(text, size, font) {
    let settings = {
        fontfamily: font,
        fontsize: size,
        colour: "#333",
        behavior: LetterBehaviorEnum.NORMAL,
    };
    let lines = [[]];
    for (let i = 0; i <= text.length - 1; i++) {
        lines[0].push(new Letter(text[i], settings));
    }
    return lines;
}

class Letter {
    constructor(letter, settings) {
        this.settings = {...settings};

        this.spacing = settings.fontsize/2;
        this.letter = letter;
        this.definition = settings.fontsize + "px " + FontEnum.toText(settings.fontfamily);
        this.offset_x = 0;
        this.offset_y = 0;

        this.shake_padding = 1;
    }

    think() {
        if (this.settings.behavior == LetterBehaviorEnum.NORMAL) {
            return;
        } else if (this.settings.behavior == LetterBehaviorEnum.SHAKEY) {
            let rand_x = (Math.random() * 3) - 1.5;
            this.offset_x = this.offset_x + rand_x;
            if (this.offset_x < -this.shake_padding) {this.offset_x = -this.shake_padding-1}
            if (this.offset_x > this.shake_padding) {this.offset_x = this.shake_padding-1}

            let rand_y = (Math.random() * 3) - 1.5;
            this.offset_y = this.offset_y + rand_y;
            if (this.offset_y < -this.shake_padding) {this.offset_y = -this.shake_padding-1}
            if (this.offset_y > this.shake_padding) {this.offset_y = this.shake_padding-1}
            return;
        }
    }

    draw(ctx, x, y) {
        ctx.font = this.definition;
        ctx.fillStyle = this.settings.colour;
        this.spacing = ctx.measureText(this.letter).width;
        ctx.fillText(
            this.letter,
            x + this.offset_x,
            y + this.offset_y
        );
        ctx.stroke();
    }
}
