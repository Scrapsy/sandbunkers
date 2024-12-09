import { Enum } from "./../utilities/enum.js";
import { FireEffect, RangeEffect, BeastEffect } from "./../objects/effects.js";


class Power {
    constructor(globals, sprite) {
        this.globals = globals;

        this.sprite = new Image();
        this.sprite.src = "./objects/assets/icons/" + sprite + ".png";
        this.size = 14;
    }

    draw(ctx, x, y) {
        ctx.drawImage(
            this.sprite,
            0,
            0,
            this.size, this.size,
            x, y,
            this.size, this.size
        );
    }
}


export class FirePower extends Power {
    constructor(globals) {
        super(globals, "glyph_fire_icon");
    }

    charge(charge) {
        charge.add_effect(PowerEnum.FIRE);
        charge.damage += 1;
        charge.types.push(PowerEnum.FIRE);
        charge.last_power = PowerEnum.FIRE;
    }
}


export class RangePower extends Power {
    constructor(globals) {
        super(globals, "glyph_range_icon");
    }

    charge(charge) {
        charge.add_effect(PowerEnum.RANGE);
        // Elements
        if ([PowerEnum.FIRE].indexOf(charge.last_power) >= 0) {
            charge.size += 1;
        // Range
        } else if (charge.last_power == PowerEnum.RANGE) {
            charge.distance += 1;
            charge.damage += 1;
        }
        charge.distance += 1;
        charge.last_power = PowerEnum.RANGE;
    }
}

export class BeastPower extends Power {
    constructor(globals) {
        super(globals, "glyph_beast_icon");
    }

    charge(charge) {
        charge.add_effect(PowerEnum.BEAST);
        charge.damage += 1;
        charge.types.push(PowerEnum.BEAST);
        charge.last_power = PowerEnum.BEAST;
    }
}

export class PowerEnum extends Enum {
    static values = ["FirePower", "RangePower", "BeastPower"];
    static FIRE = 0;
    static RANGE = 1;
    static BEAST = 2;

    static as_effect(globals, effect, target) {
        if (effect === PowerEnum.FIRE) {
            return new FireEffect(globals, target.x, target.y);
        }
        if (effect === PowerEnum.RANGE) {
            return new RangeEffect(globals, target.x, target.y, target.theta);
        }
        if (effect === PowerEnum.BEAST) {
            return new BeastEffect(globals, target.x, target.y);
        }
    }
}

/**
 * A charge is the culmination of the stacked powers.
 * @classdesc
 * @param {int} distance - The distance from origo the effect will occur at
 * @param {int} size - The size of the effect, as in how many tiles from target it reaches
 * @param {Array{string}} effect - Which visual effect is to be used
 * @param {int} damage - How much damage will the creatures affected take
 * @param {Array{string}} types - Which types of damage are involved, to calculate any resistances and whatnot 
 * @param {Power} last_power - The last power from the stack added to the charge
 */
export class Charge {
    constructor() {
        this.distance = 1;
        this.size = 0;
        this.effects = [];
        this.damage = 0;
        this.types = [];
        this.last_power = undefined;
    }

    release(stage, origin_x, origin_y, dir_x, dir_y) {
        let dis_x = dir_x * this.distance;
        let dis_y = dir_y * this.distance;

        let target_tiles = [];

        stage.attack_at(origin_x, origin_y, dis_x, dis_y, this.size, this.damage, this.types, target_tiles);
        for (let e = 0; e < this.effects.length; e++) {
            for (let t = 0; t < target_tiles.length; t++) {
                stage.spawn_effect(target_tiles[t], this.effects[e]);
            }
        }
    }

    add_effect(effect) {
        if (this.effects.indexOf(effect) === -1) {
            this.effects.push(effect);
        }

        let range_index = this.effects.indexOf(PowerEnum.RANGE);
        if (range_index > -1 && this.effects.length > 1) {
            this.effects.splice(range_index, 1);
        }
    }
}
