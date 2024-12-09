import { AnimatedEntity } from "./entity.js";


export class Bunker extends AnimatedEntity {
    constructor(globals, x, y, name, is_automatic) {
        super(globals, x / 40, y / 40, "bunker", 40, 40);
        this.x = x;
        this.y = y;
        this.name = name;
        this.is_automatic = is_automatic;
    }

    draw(ctx) {
        super.draw(ctx);
    }

    think(controller) {
        this.coordinate_x = (this.x - 20) / 40;
        this.coordinate_y = (this.y - 20) / 40;
    }
}

export class BunkerMissle {
    constructor(x, y, dir, charge) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.speed = charge / 5;
        this.grav = 0;
        this.weight = 0.2;

        this.is_spent = false;
        this.has_struck = false;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255, 0, 0, 1)";
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    think() {
        let angle = (this.dir) / 180 * Math.PI;
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
        this.y += this.grav;
        this.grav += this.weight;

        this.is_spent = this.has_struck ||
            0 > this.x || this.x > 640 ||
            // 0 > this.y ||
            this.y > 480;
    }
}