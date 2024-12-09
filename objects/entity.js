import { FirePower, RangePower, BeastPower } from "./powers.js";

export class AnimatedEntity {
    constructor(globals, coordinate_x, coordinate_y, sprite_sheet, sprite_size_x, sprite_size_y) {
        this.sprite_size_x=sprite_size_x; this.sprite_size_y=sprite_size_y;
        this.coordinate_x=coordinate_x; this.coordinate_y=coordinate_y;
        this.globals=globals;

        this.sprite_sheet = new Image();
        this.sprite_sheet.src = "./objects/assets/items/" + sprite_sheet + ".png";

        this.current_sprite = 0;

        this.frame_speed = 3;
        this.frame_current = 0;
    }

    draw(ctx) {
        ctx.drawImage(
            this.sprite_sheet,
            this.current_sprite * this.sprite_size_x,
            0,
            this.sprite_size_x, this.sprite_size_y,
            (this.coordinate_x*this.sprite_size_x-this.globals.world_x) * this.globals.zoom,
            (this.coordinate_y*this.sprite_size_y-this.globals.world_y) * this.globals.zoom,
            this.sprite_size_x * this.globals.zoom, this.sprite_size_y * this.globals.zoom
        );

        this.frame_current = this.frame_current + 1;
        if (this.frame_current >= this.frame_speed) {
            this.frame_current = 0;
        }

        if (this.frame_current === 0) {
            this.current_sprite = this.current_sprite + 1;
            if (this.current_sprite >= this.sprite_sheet.width / this.sprite_size_x) {
                this.current_sprite = 0;
            }
        }
    }
}

export class FirePickupable extends AnimatedEntity {
    constructor(globals, coordinate_x, coordinate_y) {
        super(globals, coordinate_x, coordinate_y, "glyph_fire_anim", 70, 70);
    }

    interact(pc) {
        pc.powers.push(new FirePower(this.globals, pc));
    }
}

export class RangePickupable extends AnimatedEntity {
    constructor(globals, coordinate_x, coordinate_y) {
        super(globals, coordinate_x, coordinate_y, "glyph_range_anim", 70, 70);
    }

    interact(pc) {
        pc.powers.push(new RangePower(this.globals, pc));
    }
}

export class BeastPickupable extends AnimatedEntity {
    constructor(globals, coordinate_x, coordinate_y) {
        super(globals, coordinate_x, coordinate_y, "glyph_beast_anim", 70, 70);
    }

    interact(pc) {
        pc.powers.push(new BeastPower(this.globals, pc));
    }
}
