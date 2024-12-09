import { Charge } from "./powers.js";

export class PC {
    constructor(globals, coordinate_x, coordinate_y) {
        this.coordinate_x=coordinate_x; this.coordinate_y=coordinate_y;
        this.size=globals.tile_size;
        this.alliance="pc"; this.color="#ff00ff";
        this.hp=3; this.damage=0;
        this.controls=false; this.stage=false;
        this.globals = globals;

        this.powers = [];
        this.powers_stack = [];

        this.icon = new Image();
        this.icon.src = "./objects/assets/creatures/wizard.png";

        globals.world_x = coordinate_x * this.size - globals.c_width / 2 + this.size / 2;
        globals.world_y = coordinate_y * this.size - globals.c_height / 2 + this.size;
    }

    set_stage(stage) {
        this.stage = stage;
    }

    deal_damage(damage, types) {
        // TODO: add support for resistances
        this.damage += damage;
        if (this.hp < this.damage) {
            this.is_dead = true;
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.icon,
            0,
            0,
            this.size, this.size,
            this.coordinate_x*this.size-this.globals.world_x,
            this.coordinate_y*this.size-this.globals.world_y,
            this.size, this.size
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

    think(controls) {
        this.controls = controls;
        if (controls.did_right) {
            this.move_to(1, 0);
        }
        if (controls.did_left) {
            this.move_to(-1, 0);
        }
        if (controls.did_down) {
            this.move_to(0, 1);
        }
        if (controls.did_up) {
            this.move_to(0, -1);
        }
        if (controls.did_one) {
            if (this.powers.length > 0) {
                this.powers_stack.push(this.powers[0]);
            }
        }
        if (controls.did_two) {
            if (this.powers.length > 1) {
                this.powers_stack.push(this.powers[1]);
            }
        }
        if (controls.did_three) {
            if (this.powers.length > 2) {
                this.powers_stack.push(this.powers[2]);
            }
        }
        if (controls.did_four) {
            if (this.powers.length > 3) {
                this.powers_stack.push(this.powers[3]);
            }
        }

        this.stage.interact(
            this.coordinate_x,
            this.coordinate_y
        );

        return false;
    }

    move_to(rel_x, rel_y) {
        if (this.powers_stack.length != 0) {
            let charge = new Charge();
            this.powers_stack.forEach((power) => {
                power.charge(charge);
            });
            this.powers_stack.splice(0, this.powers_stack.length);
            charge.release(this.stage, this.coordinate_x, this.coordinate_y, rel_x, rel_y);
            return;
        }

        if(this.stage.can_enter(
            this.coordinate_x,
            this.coordinate_y,
            this.coordinate_x+rel_x,
            this.coordinate_y+rel_y
        )) {
            this.coordinate_x += rel_x;
            this.coordinate_y += rel_y;
            this.globals.world_x += this.size * rel_x;
            this.globals.world_y += this.size * rel_y;
        }
    }
}

export class HealthBar {
    constructor(pc) {
        this.pc = pc;
        this.x = 15;
        this.y = 445;
        this.width = 75;
        this.height = 20;
    }

    draw(ctx) {
        ctx.fillStyle = "#111";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.pc.damage <= this.pc.hp) {
            ctx.fillStyle = `rgb(
                ${200*(this.pc.damage/this.pc.hp)},
                ${200*(1-(this.pc.damage/this.pc.hp))},
                0
            )`;
            ctx.fillRect(this.x, this.y, this.width*(1-(this.pc.damage/this.pc.hp)), this.height);

            ctx.fillStyle = `rgb(
                ${255*(this.pc.damage/this.pc.hp)},
                ${255*(1-(this.pc.damage/this.pc.hp))},
                0
            )`;
            ctx.fillRect(this.x, this.y, this.width*(1-(this.pc.damage/this.pc.hp)), this.height/6);

            ctx.fillStyle = `rgb(
                ${100*(this.pc.damage/this.pc.hp)},
                ${100*(1-(this.pc.damage/this.pc.hp))},
                0
            )`;
            ctx.fillRect(this.x, this.y+this.height-this.height/6, this.width*(1-(this.pc.damage/this.pc.hp)), this.height/6);
        }

        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x+this.width, this.y);
        ctx.lineTo(this.x+this.width, this.y+this.height);
        ctx.lineTo(this.x, this.y+this.height);
        ctx.lineTo(this.x, this.y);

        for (let i = this.pc.hp; i >= 0; i--) {
            ctx.moveTo(this.x+this.width*(1-(i/this.pc.hp)), this.y);
            ctx.lineTo(this.x+this.width*(1-(i/this.pc.hp)), this.y+this.height);
        }

        ctx.strokeStyle = "#777";
        ctx.stroke();
    }
}