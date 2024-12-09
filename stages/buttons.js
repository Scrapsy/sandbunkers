import { FontEnum } from "../text/enum.js";
import { TextHandler } from "./../text/text.js";

class Button {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.is_highlighted = false;
        this.height = 30;
        this.width = 150;
    }

    highlighted(is_highlighted) {
        this.is_highlighted = is_highlighted;
    }

    draw(ctx) {
        ctx.moveTo(this.x - this.width/2, this.y - this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y - this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y - this.height/2);
        ctx.stroke();
    }

    did_collide(x, y) {
        if (
            x > this.x - this.width/2 &&
            x < this.x + this.width/2 &&
            y > this.y - this.height/2 &&
            y < this.y + this.height/2
        ) {
            return true;
        }
        return false;
    }
}


export class GenericButton extends Button {
    constructor(x, y, width, height, text) {
        super(x, y);
        let fontsize = 32;
        let text_width = TextHandler.get_width(text, fontsize, FontEnum.JACQUARD);
        this.text = TextHandler.forClearText(text, x-text_width/2-fontsize/2, y+10, fontsize, FontEnum.JACQUARD);
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        super.draw(ctx);
        this.text.draw(ctx);
    }
}



export class Start extends Button {
    constructor(x, y) {
        super(x, y);
        this.text = TextHandler.forClearText("Start", x-45, y+10, 32, FontEnum.JACQUARD);
    }

    draw(ctx) {
        super.draw(ctx);
        this.text.draw(ctx);
    }
}