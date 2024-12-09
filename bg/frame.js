export class Framing {
    constructor(globals) {
        this.globals = globals;
    }

    draw_background(ctx) {
        ctx.fillStyle = "#131313";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    draw_foreground(ctx) {
        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, 5, ctx.canvas.height);
        ctx.fillRect(0, 0, ctx.canvas.width, 5);
        ctx.fillRect(ctx.canvas.width-5, 0, 5, ctx.canvas.height);
        ctx.fillRect(0, ctx.canvas.height-50, ctx.canvas.width, 50);

        ctx.strokeStyle = "#000";
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.canvas.height);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.lineTo(ctx.canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        ctx.moveTo(5, 5);
        ctx.lineTo(5, ctx.canvas.height-51);
        ctx.lineTo(ctx.canvas.width-6, ctx.canvas.height-51);
        ctx.lineTo(ctx.canvas.width-6, 5);
        ctx.lineTo(5, 5);
        ctx.stroke();
    }
}

export class MenuFraming {
    constructor(globals) {
        this.globals = globals;
    }

    draw_background(ctx) {
        ctx.fillStyle = "#FAFAFA";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    draw_foreground(ctx) {  }
}