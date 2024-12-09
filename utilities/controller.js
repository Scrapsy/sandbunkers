// TODO: Rebuild this entire thing...
// I want this to be user configurable
// Requires saving data though,
// which I don't want or need atm

export class Controller {
    did_event = false;

    is_left = false;
    did_left = false;
    is_right = false;
    did_right = false;
    is_up = false;
    did_up = false;
    is_down = false;
    did_down = false;
    is_space = false;
    is_plus = false;
    did_plus = false;
    is_minus = false;
    did_minus = false;

    is_one = false;
    did_one = false;
    is_two = false;
    did_two = false;
    is_three = false;
    did_three = false;
    is_four = false;
    did_four = false;
    is_five = false;
    did_five = false;
    is_six = false;
    did_six = false;
    is_seven = false;
    did_seven = false;
    is_eight = false;
    did_eight = false;
    is_nine = false;
    did_nine = false;
    is_zero = false;
    did_zero = false;
    

    mouse_x = 0;
    mouse_y = 0;
    is_mouse_left_down = false;
    is_mouse_left_up = true;
    did_mouse_left_click = false;
    is_mouse_right_up = true;
    is_mouse_right_down = false;
    did_mouse_right_click = false;

    did_scroll_up = false;
    did_scroll_down = false;

    rect = undefined;

    constructor(canvas) {
        this.rect = canvas.getBoundingClientRect();
    }

    updateControl(e, new_state) {
        this.did_event = new_state;
        if (e.keyCode === 39 || e.keyCode === 68) {
            this.did_right = new_state;
            this.is_right = new_state;
        } else if (e.keyCode === 37 || e.keyCode === 65) {
            this.did_left = new_state;
            this.is_left = new_state;
        }
        if (e.keyCode === 38 || e.keyCode === 87) {
            this.did_up = new_state;
            this.is_up = new_state;
        } else if (e.keyCode === 40 || e.keyCode === 83) {
            this.did_down = new_state;
            this.is_down = new_state;
        }
        if (e.keyCode === 32 || e.keyCode === 16) {
            this.is_space = new_state;
        }
    
        if (e.key === '+') {
            this.is_plus = new_state;
            this.did_plus = new_state;
        }
        if (e.key === '-') {
            this.is_minus = new_state;
            this.did_minus = new_state;
        }

        if (e.key === '1') {
            this.is_one = new_state;
            this.did_one = new_state;
        }
        if (e.key === '2') {
            this.is_two = new_state;
            this.did_two = new_state;
        }
        if (e.key === '3') {
            this.is_three = new_state;
            this.did_three = new_state;
        }
        if (e.key === '4') {
            this.is_four = new_state;
            this.did_four = new_state;
        }
        if (e.key === '5') {
            this.is_five = new_state;
            this.did_five = new_state;
        }
        if (e.key === '6') {
            this.is_six = new_state;
            this.did_six = new_state;
        }
        if (e.key === '7') {
            this.is_seven = new_state;
            this.did_seven = new_state;
        }
        if (e.key === '8') {
            this.is_eight = new_state;
            this.did_eight = new_state;
        }
        if (e.key === '9') {
            this.is_nine = new_state;
            this.did_nine = new_state;
        }
        if (e.key === '0') {
            this.is_zero = new_state;
            this.did_zero = new_state;
        }
    }

    updateMouseMovement(e) {
        this.mouse_x = e.clientX - this.rect.left;
        this.mouse_y = e.clientY - this.rect.top;
    }

    updateMouse(e, push_down) {
        this.did_event = true;
        if (e.button === 0) {
            this.did_mouse_left_release = !push_down;
            this.did_mouse_left_click = push_down;
            this.is_mouse_left_down = push_down;
            this.is_mouse_left_up = !push_down;
        } else if (e.button === 2) {
            this.did_mouse_right_release = !push_down;
            this.did_mouse_right_click = push_down;
            this.is_mouse_right_down = push_down;
            this.is_mouse_right_up = !push_down;
        }
        this.mouse_x = e.clientX - this.rect.left;
        this.mouse_y = e.clientY - this.rect.top;
    }

    updateMouseScroll(e) {
        if (e.deltaY < 0) {
            this.did_scroll_up = true;
        } else {
            this.did_scroll_down = true;
        }
    }

    action() {
        this.did_event = false;
        this.did_scroll_up = false;
        this.did_scroll_down = false;
        this.did_mouse_left_click = false;
        this.did_mouse_left_release = false;
        this.did_mouse_right_click = false;
        this.did_mouse_right_release = false;
        this.did_right = false;
        this.did_left = false;
        this.did_up = false;
        this.did_down = false;
        this.did_plus = false;
        this.did_minus = false;
        this.did_one = false;
        this.did_two = false;
        this.did_three = false;
        this.did_four = false;
        this.did_five = false;
        this.did_six = false;
        this.did_seven = false;
        this.did_eight = false;
        this.did_nine = false;
        this.did_zero = false;
    }
}

let canvas = document.getElementById("region");
export var controller = new Controller(canvas);

function mouseMove(e) {
    controller.updateMouseMovement(e);
}

function mouseDown(e) {
    controller.updateMouse(e, true);
}

function mouseUp(e) {
    controller.updateMouse(e, false);
}

function mouseScroll(e) {
    controller.updateMouseScroll(e);
}

function keyDown(e) {
    controller.updateControl(e, true);
}

function keyUp(e) {
    controller.updateControl(e, false);
}

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("wheel", mouseScroll);
canvas.addEventListener("contextmenu", event => event.preventDefault());

console.log("Controls ready");
