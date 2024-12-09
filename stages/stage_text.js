import { Conversation, ConversationEnum } from "../text/conversation.js";
import { PC } from "./../objects/pc.js";
import { BaseStage } from "./base_stage.js";

export class StageText extends BaseStage {
    constructor(sound_box, globals) {
        let pc = new PC(globals, 27, 27);
        super(pc, sound_box, globals);

        this.conversation = new Conversation(ConversationEnum.BEGIN, 10, 200, 500, 100);
    }

    action(controls) {
        super.action(controls);
        this.conversation.think(controls);
    }

    passive_think(controller) {
        super.passive_think(controller);
        this.conversation.passive_think(controller);
    }

    draw(ctx) {
        super.draw(ctx);
        this.conversation.draw(ctx);
    }

    get_next_stage() {
        return new StageText(this.sound_box, this.globals);
    }
}