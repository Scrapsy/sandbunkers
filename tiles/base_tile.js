export class BaseTile {
    constructor(globals, tile_x, tile_y, tileset_x, tileset_y, tileset) {
        this.tile_x = tile_x;
        this.tile_y = tile_y;
        this.size = 70;
        this.tile_set = new Image();
        this.tile_set.src = "./tiles/sets/" + tileset;
        this.tileset_x = tileset_x;
        this.tileset_y = tileset_y;

        this.is_solid = true;
        this.globals = globals;
    }

    draw(ctx) {
        ctx.drawImage(
            this.tile_set,
            this.tileset_x*this.size,
            this.tileset_y*this.size,
            this.size, this.size,
            (this.tile_x*this.size-this.globals.world_x) * this.globals.zoom,
            (this.tile_y*this.size-this.globals.world_y) * this.globals.zoom,
            this.size * this.globals.zoom, this.size * this.globals.zoom
        );
     }

    think() { }

    can_enter(ox, oy) { return !this.is_solid }

    toString() {
        return this.constructor.name + " (globals, " + this.tile_x + ", " + this.tile_y + ", " + this.tileset_x + ", " + this.tileset_y + this.extraToString() + ")";
    }

    extraToString() {
        return "";
    }
}

export class WallTile extends BaseTile {
    constructor(globals, tile_x, tile_y, tileset_x, tileset_y) {
        super(globals, tile_x, tile_y, tileset_x, tileset_y, "tileset_walls.png");
    }
}

export class OpenTile extends BaseTile {
    constructor(globals, tile_x, tile_y, tileset_x, tileset_y) {
        super(globals, tile_x, tile_y, tileset_x, tileset_y, "tileset_floor.png");
        this.is_solid = false;
    }
}