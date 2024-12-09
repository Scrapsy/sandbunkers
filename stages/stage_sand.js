import { Conversation, ConversationEnum } from "../text/conversation.js";
import { PC } from "../objects/pc.js";
import { BaseStage } from "./base_stage.js";
import { Bunker, BunkerMissle } from "../objects/bunker.js";
import { TextHandler } from "../text/text.js";
import { FontEnum } from "../text/enum.js";

class FauxPc {
    powers = [];
    set_stage(stage) {}
    draw(ctx) {}
    think() {}
}

export class StageSand extends BaseStage {
    constructor(sound_box, globals) {
        let pc = new FauxPc();
        super(pc, sound_box, globals);

        this.controller = undefined;

        if (globals.score === undefined) {
            globals.score = {
                left: 0,
                right: 0
            }
        }

        if (globals.settings === undefined) {
            globals.settings = {
                left_ai: false,
                right_ai: true
            }
        }

        this.text = [];
        this.text.push(
            TextHandler.forClearText(
                globals.score.left.toString(),
                20, 20,
                20,
                FontEnum.JACQUARD
        ));
        this.text.push(
            TextHandler.forClearText(
                globals.score.right.toString(),
                620, 20,
                20,
                FontEnum.JACQUARD
        ));

        this.sand = [];
        // this.still = Array(640).fill(Array(480).fill(0));
        this.still = [];
        this.does_snow = false;

        this.stage_random();

        /*
        for (let i = 0; i < 5000; i++) {
            this.sand.push(new Sand(Math.round(Math.random()*639), Math.round(Math.random()*-720)));
        }*/

        this.actor_0 = new Bunker(globals, 90, 240, "0", globals.settings.left_ai);
        this.current_actor = this.actor_0;
        this.actor_1 = new Bunker(globals, 550, 240, "1", globals.settings.right_ai);

        this.reset = false;
        this.missles = [];

        this.charging = false;
        this.charge = 0;

        this.pointer = new Pointer();
    }

    stage_random() {
        let stage = Math.round(Math.random() * 5);
        if (stage == 1) {
            this.stage_sin();
        } else if (stage == 2) {
            this.stage_cos();
        } else if (stage == 3) {
            this.stage_pillars();
        //} else if (stage == 4) {
        //    this.stage_steps();
        } else if (stage == 4) {
            this.stage_soot();
        } else {
            this.stage_flatlands();
        }
    }

    stage_soot() {
        this.does_snow = true;

        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                if (y > 300) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    stage_steps() {
        let step_size = 20;
        let step = 0;
        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                if (x > step_size * step) {
                    step++;
                }
                let line = 400 - step_size/4 * step;
                if (y > line) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    stage_pillars() {
        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                let line = x < 100 && 80 < x || x < 330 && 310 < x || x < 560 && 540 < x ? 120 : 400;
                if (y > line) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    stage_sin() {
        let range = Math.random() * 30 + 20;
        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                if (y > Math.sin(x/range)*range + 300) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    stage_cos() {
        this.does_snow = true;

        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                if (y > Math.cos(x/50)*50 + 300) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    stage_flatlands() {
        for (let x = 0; x < 640; x++) {
            let column = [];
            for (let y = 0; y < 480; y++) {
                if (y > 400) {
                    column.push(new Sand(x, y));
                } else {
                    column.push(undefined);
                }
            }
            this.still.push(column);
        }
    }

    remove_still(ox, oy) {
        if (
            ox < 0 ||
            oy < 0 ||
            639 < ox ||
            479 < oy
        ) {
            return;
        }
        this.still[ox][oy] = undefined;
        for (let y = oy - 1; y > 0; --y) {
            if (this.still[ox][y] == undefined) {
                break;
            }
            this.sand.push(this.still[ox][y]);
            this.still[ox][y] = undefined;
        }
    }

    soft_remove_still(ox, oy) {
        if (
            ox < 0 ||
            oy < 0 ||
            639 < ox ||
            479 < oy
        ) {
            return;
        }
        this.still[ox][oy] = undefined;
    }

    fire_missle(actor, controls, charge) {
        let theta = this.angle(actor.x, actor.y-10, controls.mouse_x, controls.mouse_y);
        this.missles.push(
            new BunkerMissle(actor.x, actor.y-10, theta, charge)
        );
        this.sound_box.play_once("s_shoot");
    }

    angle(cx, cy, ex, ey) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        //if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }

    change_actor() {
        if (this.current_actor.name === this.actor_0.name) {
            this.current_actor = this.actor_1; 
        }
         else if (this.current_actor.name === this.actor_1.name) {
             this.current_actor = this.actor_0; 
        }
    }

    action(controls) {
        super.action(controls);

        if (this.current_actor.is_automatic) {
            return;
        }

        if (controls.is_mouse_left_down) {
            this.charging = true;
        }

        if (controls.did_mouse_left_release && this.charging) {
            this.fire_missle(this.current_actor, controls, this.charge);

            this.change_actor();
 
            this.charging = false;
            this.charge = 0;
        }
    }

    boom_square(ox, oy, size) {
        for(let x = ox - size; x < ox + size; x++) {
            for(let y = oy - size; y < oy + size; y++) {
                this.remove_still(x, y);
            }
        }
    }

    boom_circle(ox, oy, radius) {
        for(let x = ox - radius; x < ox + radius; x++) {
            for(let y = oy - radius; y < oy + radius; y++) {
                let a = ox - x;
                let b = oy - y;
                let c = Math.sqrt( a*a + b*b );
                if (c < radius) {
                    this.remove_still(x, y);
                }
            }
        }
    }

    passive_think(controller) {
        super.passive_think(controller);
        this.controller = controller;

        if (this.charging) {
            if (this.charge < 60) {
                this.charge++;
            }
        }

        if (this.does_snow) {
            this.sand.push(new Sand(Math.round(Math.random()*639), Math.round(Math.random()*-10)));
        }

        for (let i = 0; i < this.sand.length; i++) {
            this.sand[i].think();
            if (
                this.sand[i].y > 478 ||
                this.still[this.sand[i].x][this.sand[i].y + 1] != undefined
            ) {
                if (this.sand[i].y > 479 || this.sand[i].x > 639) {
                    this.sand.splice(i, 1);
                    i--;
                    continue;
                }
                this.still[this.sand[i].x][this.sand[i].y] = this.sand[i];
                this.sand.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.missles.length; i++) {
            this.missles[i].think();
            var ox = Math.round(this.missles[i].x);
            var oy = Math.round(this.missles[i].y);

            if (0 < ox && ox < 640 &&
                0 < oy && oy < 480) {
                if (this.still[ox][oy] != undefined) {
                    this.missles[i].is_spent = true;
                }
            }

            if (this.missles[i].is_spent) {
                this.boom_circle(ox, oy, 75);
                this.missles.splice(i, 1);
                i--;
                this.sound_box.play_once("s_explosion");
            }
        }

        this.moving_actors = false;
        this.think_actor(this.actor_0, controller);
        this.think_actor(this.actor_1, controller);
        if (this.moving_actors) {
            this.sound_box.music("s_moving");
        } else {
            this.sound_box.music("");
        }

        if (this.current_actor.is_automatic && !this.moving_actors && this.missles.length == 0) {
            let height = Math.random() * 20 + 120;
            let theta = this.angle(
                this.current_actor.x,
                this.current_actor.y-10,
                320,
                height
            );
            let charge = Math.random() * 20 + 35;
            this.missles.push(
                new BunkerMissle(this.current_actor.x, this.current_actor.y-10, theta, charge)
            );
            this.sound_box.play_once("s_shoot");

            this.change_actor();
        }

        if (this.actor_0.y > 480) {
            this.globals.score.right += 1;
            this.reset = true;
        } else if (this.actor_1.y > 480) {
            this.globals.score.left += 1;
            this.reset = true;
        }

        this.pointer.think(controller);
    }

    think_actor(actor, controller) {
        if (
            this.still[actor.x][actor.y + 1] != undefined &&
            this.still[actor.x][actor.y] != undefined
        ) {
            actor.y--;
            this.moving_actors = true;
        }

        if (
            this.still[actor.x][actor.y + 1] == undefined &&
            this.still[actor.x][actor.y] == undefined
        ) {
            actor.y++;
            this.moving_actors = true;
        }

        actor.think(controller);
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.strokeStyle = "black";
        ctx.fillRect(0, 0, 640, 480);

        ctx.beginPath();
        this.actor_0.draw(ctx);
        ctx.closePath();

        ctx.beginPath();
        this.actor_1.draw(ctx);
        ctx.closePath();

        for (let i = 0; i < this.missles.length; i++) {
            ctx.beginPath();
            this.missles[i].draw(ctx);
            ctx.closePath();
        }

        for (let i = 0; i < this.sand.length; i++) {
            this.sand[i].draw(ctx);
        }

        for (let x = 0; x < this.still.length; x++) {
            let column = this.still[x];
            let line = {start: 0, end: 0, drawing: false};
            for (let y = 0; y < column.length; y++) {
                let element = column[y];
                if (element != undefined && !line.drawing) {
                    line.start = y;
                    line.drawing = true;
                }
                else if (
                    y + 1 == column.length && line.drawing ||
                    element == undefined && line.drawing
                ) {
                    line.end = y;
                    line.drawing = false;

                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.fillRect(x, line.start, 1, line.end - line.start);
                    ctx.closePath();
                }
            }
        }


        if (this.controller != undefined && !this.current_actor.is_automatic) {
            ctx.moveTo(this.current_actor.x, this.current_actor.y - 10);
            ctx.lineTo(this.controller.mouse_x, this.controller.mouse_y);
            ctx.stroke();

            let theta = this.angle(
                this.current_actor.x, this.current_actor.y-10,
                this.controller.mouse_x, this.controller.mouse_y
            );
            let angle = (theta) / 180 * Math.PI;
            let cx = this.current_actor.x + this.charge * Math.cos(angle);
            let cy = this.current_actor.y + this.charge * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(this.current_actor.x, this.current_actor.y);
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.moveTo(0, 480);
        ctx.lineTo(640, 480);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();

        for (let i = 0; i < this.text.length; i++) {
            this.text[i].draw(ctx);
        }

        this.pointer.draw(ctx);
    }

    change_stage() {
        if (this.reset) {
            return new StageSand(this.sound_box, this.globals);
        }
        return false;
    }

    get_next_stage() {
        return new StageText(this.sound_box, this.globals);
    }
}

class Sand {
    constructor(x, y, still) {
        this.x = x;
        this.y = y;
        this.still = still;
    }

    think() {
        this.y += 1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, 1, 1);
        ctx.closePath();
    }
}

export class Pointer {
    think(controller) {
        this.controller = controller;
        this.x = controller.mouse_x;
        this.y = controller.mouse_y;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "red";
        // ctx.fillRect(this.x, this.y, 1, 1);
        ctx.moveTo(this.x-2, this.y-2);
        ctx.lineTo(this.x+2, this.y+2);
        ctx.moveTo(this.x-2, this.y+2);
        ctx.lineTo(this.x+2, this.y-2);
        ctx.stroke();
        ctx.closePath();
    }
}