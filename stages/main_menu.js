import { GenericButton } from "./buttons.js";
import { FontEnum } from "../text/enum.js";
import { TextHandler } from "./../text/text.js";
import { MenuFraming } from "./../bg/frame.js";
import { StageSand, Pointer } from "./stage_sand.js";

export class MainMenu {
    constructor(sound_box, globals) {
        this.options = [
            [
                new GenericButton(
                    globals.ctx.canvas.width/4, 200,
                    300, 40,
                    "One Player Left"
                ),
                this.set_stage_to_one_pc_left
            ],[
                new GenericButton(
                    globals.ctx.canvas.width/4*3, 200,
                    300, 40,
                    "One Player Right"
                ),
                this.set_stage_to_one_pc_right
            ],[
                new GenericButton(
                    globals.ctx.canvas.width/2, 260,
                    300, 40,
                    "Two Players"
                ),
                this.set_stage_to_two_pc
            ],[
                new GenericButton(
                    globals.ctx.canvas.width/2, 320,
                    300, 40,
                    "No Players"
                ),
                this.set_stage_to_no_pc
            ],
        ];
        this.text_title = TextHandler.forClearText("Welcome", globals.ctx.canvas.width/2-125, 130, 64, FontEnum.JACQUARD);
        this.run_stage = false;
        this.frame = new MenuFraming(globals);
        this.sound_box = sound_box;
        this.globals = globals;

        this.pointer = new Pointer();
    }

    draw(ctx) {
        ctx.beginPath();
        this.frame.draw_background(ctx);
        ctx.closePath();

        ctx.beginPath();
        for (let i = this.options.length - 1; i >= 0; i--) {
            this.options[i][0].draw(ctx);
        }
        this.text_title.draw(ctx);
        ctx.closePath();

        ctx.beginPath();
        this.frame.draw_foreground(ctx);
        ctx.closePath();

        this.pointer.draw(ctx);
    }

    action(controls) {
        this.run_stage = false;
        if (controls.is_space) {
            this.run_stage = new StageSand(this.sound_box, this.globals);
        }
        if (controls.did_mouse_left_click) {
            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i][0].did_collide(controls.mouse_x, controls.mouse_y)) {
                    this.sound_box.play("s_click");
                    this.options[i][1](this);
                }
            }
        }
    }

    passive_think(controller) {
        this.pointer.think(controller);
     }

    change_stage() {
        return this.run_stage;
    }

    set_stage_to_one_pc_left(master) {
        master.globals.settings = {
            left_ai: false,
            right_ai: true
        }
        master.run_stage = new StageSand(master.sound_box, master.globals);
    }

    set_stage_to_one_pc_right(master) {
        master.globals.settings = {
            left_ai: true,
            right_ai: false
        }
        master.run_stage = new StageSand(master.sound_box, master.globals);
    }

    set_stage_to_two_pc(master) {
        master.globals.settings = {
            left_ai: false,
            right_ai: false
        }
        master.run_stage = new StageSand(master.sound_box, master.globals);
    }

    set_stage_to_no_pc(master) {
        master.globals.settings = {
            left_ai: true,
            right_ai: true
        }
        master.run_stage = new StageSand(master.sound_box, master.globals);
    }
}
