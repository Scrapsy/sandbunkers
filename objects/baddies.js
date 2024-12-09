import { Charge, BeastPower } from "./powers.js";


class Creature {
    constructor(globals, stage, coordinate_x, coordinate_y, sprite_sheet) {
        this.coordinate_x = coordinate_x;
        this.coordinate_y = coordinate_y;
        this.stage = stage;
        this.speed = 4;
        this.alliance = "unknown";
        this.damage = 0;
        this.hp = 1;
        this.is_dead = false;
        this.harm = 2;
        this.globals = globals;
        this.size=globals.tile_size;
        this.sprite_sheet = sprite_sheet;

        this.icon = new Image();
        this.icon.src = "./objects/assets/creatures/" + sprite_sheet + ".png";

        this.powers = [];
        this.powers_stack = [];
    }

    draw(ctx) {
        ctx.drawImage(
            this.icon,
            0,
            0,
            this.size, this.size,
            (this.coordinate_x*this.size-this.globals.world_x) * this.globals.zoom,
            (this.coordinate_y*this.size-this.globals.world_y) * this.globals.zoom,
            this.size * this.globals.zoom, this.size * this.globals.zoom
        );
        this.powers_stack.forEach(
            (power, index) => {
                power.draw(ctx,
                    this.coordinate_x*this.size-this.globals.world_x + index * 16,
                    this.coordinate_y*this.size-this.globals.world_y
                );
            }
        );
    }

    think() {
        // TODO: Add thought
        if (this.has_line_of_sight(this.stage.pc)) {
            console.log("I SEE YOU!");
        }
        // TODO: Add line of sight to other creatures
    }

    has_line_of_sight(target) {
        let m_x = this.coordinate_x;
        let m_y = this.coordinate_y;

        let t_x = target.coordinate_x;
        let t_y = target.coordinate_y;

        let radians = Math.atan2(m_y - t_y, m_x - t_x);

        let c_x = m_x;
        let c_y = m_y;

        let step = 0;
        while(this.stage.can_enter(c_x, c_y, c_x, c_y) && step < 10) {
            c_x = m_x - Math.round(step * Math.cos(radians));
            c_y = m_y - Math.round(step * Math.sin(radians));
            step = step + 1;
            if (c_x === t_x && c_y === t_y) {
                break;
            }
        }
        return c_x === t_x && c_y === t_y;
    }

    deal_damage(damage, types) {
        // TODO: add support for resistances
        this.damage += damage;
        if (this.hp < this.damage) {
            this.is_dead = true;
        }
    }

    deal_effect(pc) {
        pc.damage += this.harm;
        this.damage = this.hp;
    }

    toString() {
        return this.constructor.name + " (globals, " + this.coordinate_x + ", " + this.coordinate_y + this.extraToString() + ")";
    }

    extraToString() {
        return "";
    }
}

export class WoinkCreature extends Creature {
    constructor(globals, stage, coordinate_x, coordinate_y) {
        super(globals, stage, coordinate_x, coordinate_y, "woink");
        this.alliance = "vermin";
        this.powers = [new BeastPower(globals)];
    }
}

export class PriestCreature extends Creature {
    constructor(globals, stage, coordinate_x, coordinate_y) {
        super(globals, stage, coordinate_x, coordinate_y, "priest");
        this.alliance = "cultist";
    }
}

export class SaintCreature extends Creature {
    constructor(globals, stage, coordinate_x, coordinate_y) {
        super(globals, stage, coordinate_x, coordinate_y, "saint");
        this.alliance = "cultist";
    }
}
