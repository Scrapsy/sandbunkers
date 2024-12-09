import { Enum } from "../utilities/enum.js";
import { MessageEnum } from "./messages/general.js";
import { TextHandler } from "./text.js";



class ConversationOption {
    text = MessageEnum.GENERAL_GREETING;
    // method? - Should return the next conversation lead OR end of the conversation
    // Should be able to send things back to the main shite if it affects anything
    consequence = undefined;
}


class ConversationLead {
    text = MessageEnum.GENERAL_GREETING;
    options = [];
}


const BEGIN = new ConversationLead();
BEGIN.options = [new ConversationOption()];


export class ConversationEnum extends Enum {
    static values = [BEGIN];
    static BEGIN = 0;
}


export class Conversation {
    constructor(which, x, y, width, height) {
        this.which = which;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.conversation_lead = ConversationEnum.toText(which);
        this.text = TextHandler.forEnum(this.conversation_lead.text, x, y);

        this.options = [];
        for (let i = 0; i < this.conversation_lead.options.length; i++) {
            this.options.push(TextHandler.forEnum(this.conversation_lead.options[i], x, y));
        }
    }

    think(controls) {
        // TODO: activate teh option and whatnot
    }

    passive_think() {
        this.text.think(controller);
    }

    draw(ctx) {
        ctx.beginPath();
        this.text.draw(ctx);
        ctx.closePath();
    }
}