import { Framing } from "./../bg/frame.js";
import { TextHandler } from "./../text/text.js";
import { OpenTile, WallTile } from "./../tiles/base_tile.js";
import { WoinkCreature, PriestCreature, SaintCreature } from "./../objects/baddies.js";
import { Enum } from "./../utilities/enum.js";

export class CreateStage {
    constructor(sound_box, globals) {
        this.sound_box = sound_box;
        this.globals = globals;
        this.frame = new Framing(globals);

        this.tiles = [[new OpenTile(this.globals, 0, 0, 1, 1)]];
        this.creatures = [];

        this.text = new TextHandler("open", 10, 440, 6);
        this.tile_selection = TileEnum.open;
        this.creature_selection = CreatureEnum.woink;
        this.current_tool = ToolEnum.tiles;
    }

    draw(ctx) {
        ctx.beginPath();
        this.frame.draw_background(ctx);
        ctx.closePath();

        for (let y = this.tiles.length - 1; y >= 0; y--) {
            for (let x = this.tiles[y].length - 1; x >= 0; x--) {
                if (typeof this.tiles[y][x] !== "undefined") {
                    this.tiles[y][x].draw(ctx);
                }
            }
        }

        this.creatures.forEach((creature) => {
            creature.draw(ctx);
        });

        this.drawLines(ctx);

        ctx.beginPath();
        this.frame.draw_foreground(ctx);
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = "#F00";
        this.text.draw(ctx);
        ctx.closePath();
    }

    drawLines(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "#000";

        let rows = this.tiles.length;
        let columns = this.tiles[0].length;
        let tile_size = this.globals.tile_size * this.globals.zoom;
        let world_x = -this.globals.world_x * this.globals.zoom;
        let world_y = -this.globals.world_y * this.globals.zoom;

        for (let c = columns; c > 0; c--) {
            ctx.moveTo(world_x, world_y + c*tile_size);
            ctx.lineTo(world_x + rows*tile_size, world_y + c*tile_size);
        }
        for (let r = rows; r > 0; r--) {
            ctx.moveTo(world_x + (r*tile_size), world_y);
            ctx.lineTo(world_x + (r*tile_size), world_y + (columns*tile_size));
        }
        ctx.stroke();

        ctx.closePath();
    }

    action(controls) {
        if (controls.did_scroll_up) {
            this.globals.zoom += 0.1;
        }
        if (controls.did_scroll_down) {
            this.globals.zoom += -0.1;
        }

        if (controls.did_mouse_left_click) {
            if (this.current_tool === ToolEnum.tiles) {
                this.addTileAt(controls.mouse_x, controls.mouse_y);
            }
            if (this.current_tool === ToolEnum.creatures) {
                this.addCreatureAt(controls.mouse_x, controls.mouse_y);
            }
        }

        if (controls.did_left) {
            this.updatePositions(-1, 0);
        }
        if (controls.did_right) {
            this.updatePositions(1, 0);
        }
        if (controls.did_up) {
            this.updatePositions(0, -1);
        }
        if (controls.did_down) {
            this.updatePositions(0, 1);
        }

        if (controls.did_plus) {
            for (let y = 0; y < this.tiles.length; y++) {
                this.tiles[y].push(new OpenTile(
                    this.globals,
                    this.tiles[y].length,
                    y,
                    1,
                    1
                ));
            }

            let new_row = [];
            for (let x = 0; x < this.tiles[0].length; x++) {
                new_row.push(new OpenTile(
                    this.globals,
                    x,
                    this.tiles.length,
                    1,
                    1
                ));
            }
            this.tiles.push(new_row);
            this.tiles.forEach((row) => {
                row.forEach((tile) => {
                    this.update_tile(tile.tile_x, tile.tile_y);
                });
            });
        }

        if (controls.did_minus) {
            if (this.tiles.length > 1) {
                this.tiles.splice(this.tiles.length - 1, 1);
                for (let i = this.tiles.length - 1; i >= 0; i--) {
                    this.tiles[i].splice(this.tiles[0].length - 1, 1);
                }
            }
            this.tiles.forEach((row) => {
                row.forEach((tile) => {
                    this.update_tile(tile.tile_x, tile.tile_y);
                });
            });
        }

        if (controls.did_one) {
            this.changeTileSelection();
        }
        if (controls.did_two) {
            this.changeCreatureSelection();
        }
        if (controls.did_eight) {
            this.exportAsImage();
        }
        if (controls.did_nine) {
            this.load();
        }
        if (controls.did_zero) {
            this.save();
        }

        // TODO: Add support for adding the PC
        // TODO: Add support for adding items, such as health or glyphs
        // TODO: Add support for adding "triggers", such as surprise attacks or conversations
        // TODO: Add support for adding usables, such as doors or levers
        // TODO: Add support for layers? To support stuff like furniture that still block movement?
    }

    addTileAt(mouse_x, mouse_y) {
        let tile_x = Math.trunc((mouse_x + (this.globals.world_x * this.globals.zoom)) / (this.globals.tile_size*this.globals.zoom));
        let tile_y = Math.trunc((mouse_y + (this.globals.world_y * this.globals.zoom)) / (this.globals.tile_size*this.globals.zoom));
        let rows = this.tiles.length;
        let columns = this.tiles[0].length;

        if (tile_x < rows && tile_y < columns && tile_x > -1 && tile_y > -1) {
            let tileset_section = this.select_tileset_values(this.tile_selection, tile_x, tile_y);
            if (this.tile_selection === TileEnum.open) {
                this.tiles[tile_y][tile_x] = new OpenTile(
                    this.globals,
                    tile_x,
                    tile_y,
                    tileset_section[0],
                    tileset_section[1]
                );
            }
            if (this.tile_selection === TileEnum.wall) {
                this.tiles[tile_y][tile_x] = new WallTile(
                    this.globals,
                    tile_x,
                    tile_y,
                    tileset_section[0],
                    tileset_section[1]
                );
            }
            this.update_surrounding_tiles(tile_x, tile_y);
        }
    }

    addCreatureAt(mouse_x, mouse_y) {
        let tile_x = Math.trunc((mouse_x + (this.globals.world_x * this.globals.zoom)) / (this.globals.tile_size*this.globals.zoom));
        let tile_y = Math.trunc((mouse_y + (this.globals.world_y * this.globals.zoom)) / (this.globals.tile_size*this.globals.zoom));
        let rows = this.tiles.length;
        let columns = this.tiles[0].length;

        let filtered = false;
        this.creatures = this.creatures.filter((creature) => {
            if (creature.coordinate_x === tile_x && creature.coordinate_y === tile_y) {
                filtered = true;
                return false;
            }
            return true;
        });
        if (filtered) {
            return;
        }

        if (tile_x < rows && tile_y < columns && tile_x > -1 && tile_y > -1) {
            if (this.creature_selection === CreatureEnum.woink) {
                this.creatures.push(
                    new WoinkCreature(
                        this.globals,
                        tile_x,
                        tile_y
                    )
                );
            }
            if (this.creature_selection === CreatureEnum.priest) {
                this.creatures.push(
                    new PriestCreature(
                        this.globals,
                        tile_x,
                        tile_y
                    )
                );
            }
            if (this.creature_selection === CreatureEnum.saint) {
                this.creatures.push(
                    new SaintCreature(
                        this.globals,
                        tile_x,
                        tile_y
                    )
                );
            }
        }
    }

    update_surrounding_tiles(tile_x, tile_y) {
        this.update_tile(tile_x, tile_y-1);
        this.update_tile(tile_x, tile_y+1);
        this.update_tile(tile_x-1, tile_y);
        this.update_tile(tile_x+1, tile_y);
    }

    update_tile(tile_x, tile_y) {
        let tile_selection = this.get_tile_enum(tile_x, tile_y);
        if (tile_selection >= 0) {
            let tileset_section = this.select_tileset_values(tile_selection, tile_x, tile_y);
            this.tiles[tile_y][tile_x].tileset_x = tileset_section[0];
            this.tiles[tile_y][tile_x].tileset_y = tileset_section[1];
        }
    }

    select_tileset_values(tile_selection, tile_x, tile_y) {
        let north = this.get_tile_enum(tile_x, tile_y - 1);
        let south = this.get_tile_enum(tile_x, tile_y + 1);
        let west = this.get_tile_enum(tile_x - 1, tile_y);
        let east = this.get_tile_enum(tile_x + 1, tile_y);

        // Center
        //  .
        // . .
        //  .
        if (
            north === tile_selection &&
            south === tile_selection &&
            west === tile_selection &&
            east === tile_selection
        ) {
            return [1, 1];
        }
        // North, different
        //  -
        // . .
        //  .
        if (
            north != tile_selection &&
            south === tile_selection &&
            west === tile_selection &&
            east === tile_selection
        ) {
            return [1, 0];
        }
        // South, different
        //  .
        // . .
        //  -
        if (
            north === tile_selection &&
            south != tile_selection &&
            west === tile_selection &&
            east === tile_selection
        ) {
            return [1, 2];
        }
        // West, different
        //  .
        // | .
        //  .
        if (
            north === tile_selection &&
            south === tile_selection &&
            west != tile_selection &&
            east === tile_selection
        ) {
            return [0, 1];
        }
        // East, different
        //  .
        // . |
        //  .
        if (
            north === tile_selection &&
            south === tile_selection &&
            west === tile_selection &&
            east != tile_selection
        ) {
            return [2, 1];
        }
        // NE Corner
        //  -
        // | .
        //  .
        if (
            north != tile_selection &&
            south === tile_selection &&
            west === tile_selection &&
            east != tile_selection
        ) {
            return [2, 0];
        }
        // NW Corner
        //  _
        // | .
        //  .
        if (
            north != tile_selection &&
            south === tile_selection &&
            west != tile_selection &&
            east === tile_selection
        ) {
            return [0, 0];
        }
        // NS Line
        //  -
        // . .
        //  -
        if (
            north != tile_selection &&
            south != tile_selection &&
            west === tile_selection &&
            east === tile_selection
        ) {
            return [4, 0];
        }
        // SW
        //  .
        // | .
        //  -
        if (
            north === tile_selection &&
            south != tile_selection &&
            west != tile_selection &&
            east === tile_selection
        ) {
            return [0, 2];
        }
        // SE
        //  .
        // . |
        //  -
        if (
            north === tile_selection &&
            south != tile_selection &&
            west === tile_selection &&
            east != tile_selection
        ) {
            return [2, 2];
        }
        // WE
        //  .
        // | |
        //  .
        if (
            north === tile_selection &&
            south === tile_selection &&
            west != tile_selection &&
            east != tile_selection
        ) {
            return [3, 1];
        }
        // WNE
        //  -
        // | |
        //  .
        if (
            north != tile_selection &&
            south === tile_selection &&
            west != tile_selection &&
            east != tile_selection
        ) {
            return [3, 0];
        }
        // NES
        //  -
        // . |
        //  -
        if (
            north != tile_selection &&
            south != tile_selection &&
            west === tile_selection &&
            east != tile_selection
        ) {
            return [5, 0];
        }
        // ESW
        //  .
        // | |
        //  _
        if (
            north === tile_selection &&
            south != tile_selection &&
            west != tile_selection &&
            east != tile_selection
        ) {
            return [5, 2];
        }
        // SWN
        //  -
        // | .
        //  -
        if (
            north != tile_selection &&
            south != tile_selection &&
            west != tile_selection &&
            east === tile_selection
        ) {
            return [3, 2];
        }
        // Alone
        //  -
        // | |
        //  -
        if (
            north != tile_selection &&
            south != tile_selection &&
            west != tile_selection &&
            east != tile_selection
        ) {
            return [4, 1];
        }
        return [0, 0];
    }

    get_tile_enum(tile_x, tile_y) {
        if (0 < tile_y < this.tiles.length - 1) {
            let row = this.tiles[tile_y];
            if (row !== undefined && 0 < tile_x < row.length - 1) {
                return TileEnum.fromClass(this.tiles[tile_y][tile_x]);
            }
        }
        return undefined;
    }

    changeTileSelection() {
        this.current_tool = ToolEnum.tiles;
        this.tile_selection = TileEnum.next(this.tile_selection);
        this.text.changeText(TileEnum.toText(this.tile_selection));
    }

    changeCreatureSelection() {
        this.current_tool = ToolEnum.creatures;
        this.creature_selection = CreatureEnum.next(this.creature_selection);
        this.text.changeText(CreatureEnum.toText(this.creature_selection));
    }

    updatePositions(pos_x, pos_y) {
        this.globals.world_x += pos_x * this.globals.tile_size;
        this.globals.world_y += pos_y * this.globals.tile_size;
    }

    save() {
        let offset = "    ";
        let data = "[\n";
        this.tiles.forEach((column) => {
            data += offset + "[\n";
            column.forEach((tile) => {
                data += offset + offset + "new " + tile.toString();
                data += ",\n";
            });
            data = data.substring(0, data.length - 2);
            data += "\n" + offset + "],\n";
        });
        data = data.substring(0, data.length - 2);
        data += "\n]";
        data += "\n[\n";
        this.creatures.forEach((creature) => {
            data += offset + offset + "new " + creature.toString();
            data += ",\n";
        });
        data = data.substring(0, data.length - 2);
        data += "\n]";
        navigator.clipboard.writeText(data);
    }

    load() {
        // TODO: clipboard.readText only works in a http secure environment for some reason?
        // find other solution
    }

    exportAsImage() {
        let width = this.tiles.length * this.globals.tile_size;
        let height = this.tiles[0].length * this.globals.tile_size;
        let ocanvas = new OffscreenCanvas(width, height);
        let ocontext = ocanvas.getContext("2d");

        this.globals.zoom = 1;
        this.globals.world_x = 0;
        this.globals.world_y = 0;
        this.drawForExport(ocontext);

        ocanvas.convertToBlob().then((blob) => {
            const blobURL = URL.createObjectURL(blob);
            window.open(blobURL).focus();
        });
    }

    drawForExport(ctx) {
        for (let y = this.tiles.length - 1; y >= 0; y--) {
            for (let x = this.tiles[y].length - 1; x >= 0; x--) {
                if (this.tiles[x][y] != undefined) {
                    this.tiles[x][y].draw(ctx);
                }
            }
        }
        this.creatures.forEach((creature) => {
            creature.draw(ctx);
        });
    }

    change_stage() {
        return false;
    }
}

class TileEnum extends Enum {
    static values = ["OpenTile", "WallTile"];
    static open = 0;
    static wall = 1;
}

class CreatureEnum extends Enum {
    static values = ["WoinkCreature", "PriestCreature", "SaintCreature"];
    static woink = 0;
    static priest = 1;
    static saint = 2;
}

class ToolEnum extends Enum {
    static values = ["tiles", "creatures"];
    static tiles = 0;
    static creatures = 1;
}
