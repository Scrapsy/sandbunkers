import { Framing } from "./../bg/frame.js";
import { HealthBar } from "./../objects/pc.js";
import { TextHandler } from "./../text/text.js";
import { MainMenu } from "./main_menu.js";
import { PowerEnum } from "./../objects/powers.js";

export class BaseStage {
    constructor(pc, sound_box, globals) {
        this.pc = pc;
        this.pc.set_stage(this);
        this.tiles = [[]];
        this.bullets = [];
        this.creatures = [];
        this.effects = [];
        this.items = [];
        this.hp = new HealthBar(this.pc);
        this.frame = new Framing();
        this.failed = 100;
        this.failing = 0;
        this.failed_text = new TextHandler(" broke down", 215, 200, 4);
        this.won = 100;
        this.winning = 0;
        this.won_text = new TextHandler(" victory", 235, 200, 4);
        this.new_stage = false;
        this.timer = 0;
        this.sound_box = sound_box;
        this.globals = globals;
    }

    can_enter(ox, oy, dx, dy) {
        if (dy < 0) { return false; }
        if (dy > this.tiles.length - 1) { return false; }
        if (dx < 0) { return false; }
        if (dx > this.tiles[dy].length - 1) { return false; }
        return this.tiles[dy][dx].can_enter(ox, oy);
    }

    interact(coordinate_x, coordinate_y) {
        let collected = -1;
        this.items.forEach((item, index) => {
            if (
                coordinate_x === item.coordinate_x && 
                coordinate_y === item.coordinate_y
            ) {
                item.interact(this.pc);
                collected = index;
            }
        });
        if (collected != -1) {
            this.items.splice(collected, 1);
        }
    }

    get_globals() {
        return this.globals;
    }

    draw(ctx) {
        ctx.beginPath();
        this.frame.draw_background(ctx);
        ctx.closePath();

        for (let x = this.tiles.length - 1; x >= 0; x-- ) {
            for (let y = this.tiles[x].length - 1; y >= 0; y-- ) {
                ctx.beginPath();
                this.tiles[x][y].draw(ctx);
                ctx.closePath();
            }
        }

        ctx.beginPath();
        this.pc.draw(ctx);
        ctx.closePath();

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            ctx.beginPath();
            this.bullets[i].draw(ctx);
            ctx.closePath();
        }

        this.creatures.forEach(
            (creature) => {
                ctx.beginPath();
                creature.draw(ctx);
                ctx.closePath();
            }
        );

        this.items.forEach(
            (item) => {
                ctx.beginPath();
                item.draw(ctx);
                ctx.closePath();
            }
        );

        for (let i = this.effects.length - 1; i >= 0; i--) {
            ctx.beginPath();
            this.effects[i].draw(ctx);
            ctx.closePath();
        }

        ctx.beginPath();
        this.frame.draw_foreground(ctx);
        ctx.closePath();

        ctx.beginPath();
        this.hp.draw(ctx);
        ctx.closePath();

        this.pc.powers.forEach((power, index) => {
            // TODO: Add number before the glyph to make it clearer that they
            // Can be used by a keypress
            ctx.beginPath();
            power.draw(
                ctx,
                this.globals.c_width / 2 + power.size * index + 5,
                this.globals.c_height - 33
            );
            ctx.closePath();
        });

        if (this.failing >= 1) {
            ctx.beginPath();
            ctx.strokeStyle = "#FF00FF";
            this.failed_text.draw(ctx);
            ctx.closePath();
        }

        if (this.winning >= 1) {
            ctx.beginPath();
            ctx.strokeStyle = "#FF00FF";
            this.won_text.draw(ctx);
            ctx.closePath();
        }

        ctx.beginPath();
        this.sound_box.draw(ctx);
        ctx.closePath();
    }

    action(controls) {
        this.tiles.forEach((row) => {
            row.forEach((tile) => {
                tile.think();
            });
        });

        if (this.pc.think(controls)) {
            this.failing += 1;
        } else {
            this.failing = 0;
        }

        for (let i = this.creatures.length - 1; i >= 0; i--) {
            this.creatures[i].think();
            if (this.creatures[i].is_dead) {
                this.creatures.splice(i, 1);
            }
        }
    }

    passive_think(controller) {
        this.effects.forEach((effect, index) => {
            effect.think();
            if (effect.is_done) {
                this.effects.splice(index, 1);
            }
        });
    }

    attack_at(origin_x, origin_y, dis_x, dis_y, size, damage, types, target_tiles) {
        let target = this.get_actual_target(origin_x, origin_y, dis_x, dis_y);

        target_tiles.push(target);
        if (size > 0) {
            this.add_targets_to_area(target_tiles, target.x, target.y, size-1);
        }

        this.creatures.forEach((creature) => {
            if (target_tiles.find(e => e.x === creature.coordinate_x && e.y === creature.coordinate_y)) {
                creature.deal_damage(damage, types);
            }
        })

        if (target_tiles.find(e => e.x === this.pc.coordinate_x && e.y === this.pc.coordinate_y)) {
            this.pc.deal_damage(damage, types);
        }
    }

    add_target(targets, target_x, target_y, size) {
        if (this.can_enter(target_x, target_y, target_x, target_y)) {
            if (!targets.find(e => e.x === target_x && e.y === target_y)) {
                targets.push({x: target_x, y: target_y});
                this.add_targets_to_area(targets, target_x, target_y, size-1);
            }
        }
    }

    add_targets_to_area(targets, origin_x, origin_y, size) {
        if (size > 0) {
            this.add_target(targets, origin_x+1, origin_y, size);
            this.add_target(targets, origin_x-1, origin_y, size);
            this.add_target(targets, origin_x, origin_y+1, size);
            this.add_target(targets, origin_x, origin_y-1, size);
        }
    }

    get_actual_target(origin_x, origin_y, dis_x, dis_y) {
        let tar_x = origin_x;
        let tar_y = origin_y;
        let abs_x = Math.abs(dis_x);
        let abs_y = Math.abs(dis_y);
        let comp_x = 0;
        if (dis_x != 0) {
            comp_x = dis_x < 0 ? -1 : 1;
        }
        let comp_y = 0;
        if (dis_y != 0) {
            comp_y = dis_y < 0 ? -1 : 1;
        }
        let i = 0;
        while(
            this.can_enter(
                tar_x, tar_y,
                tar_x+i*comp_x, tar_y+i*comp_y
            ) && (
                i <= abs_x || i <= abs_y
            )
        ) {
            i++;
        }
        i--;
        tar_x = tar_x + i*comp_x;
        tar_y = tar_y + i*comp_y;

        let theta = Math.atan2(dis_y, dis_x);
        theta *= 180 / Math.PI

        return {x: tar_x, y: tar_y, theta: theta};
    }

    spawn_effect(target, effect) {
        this.effects.push(PowerEnum.as_effect(this.globals, effect, target));
    }

    change_stage() {
        return this.new_stage;
    }

    play_sound(sound_title) {
        this.sound_box.play(sound_title);
    }

    play_sound_once(sound_title) {
        this.sound_box.play_once(sound_title);
    }

    play_music(sound_title) {
        this.sound_box.music(sound_title);
    }
}