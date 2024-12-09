export class SoundBox {
    volume = 0;
    volumes = [0, 0.045, 0.096, 0.154, 0.221, 0.301, 0.397, 0.522, 0.698, 1];

    did_plus = false;
    did_minus = false;
    last_change = 0;

    currently_playing = "";
    has_started = [];

    constructor(globals) {
        this.preload_sounds();
        this.preload_songs();
        this.change_volume(1);
    }

    change_volume(change) {
        this.volume += change;
        if (this.volume > this.volumes.length - 1) {
            this.volume = this.volumes.length - 1;
        }
        else if (this.volume < 0) {
            this.volume = 0;
        }

        for(let key in this.songs) {
            this.songs[key].volume = this.volumes[this.volume];
        }
    }

    play_once(sound_title) {
        if (this.has_started.indexOf(sound_title) < 0) {
            this.has_started.push(sound_title);
            this.play(sound_title);
        }
    }

    play(sound_title) {
        let sound = this.sounds[sound_title].cloneNode(true);
        sound.volume = this.volumes[this.volume];
        sound.play();
    }

    music(sound_title) {
        if (sound_title != this.currently_playing) {
            if (this.currently_playing != "") {
                this.songs[this.currently_playing].pause();
            }
            if (sound_title != "") {
                this.songs[sound_title].currentTime = 0;
                this.songs[sound_title].loop = true;
                this.songs[sound_title].play();
            }
            this.currently_playing = sound_title;
        }
    }

    stop_music() {
        if (this.currently_playing != "") {
            this.songs[this.currently_playing].pause();
        }
        this.currently_playing = "";
    }

    preload_sounds() {
        this.sounds = {
            "s_click": new Audio("./soundbox/sounds/click.wav"),
            "s_shoot": new Audio("./soundbox/sounds/fire.wav"),
            "s_explosion": new Audio("./soundbox/sounds/explosion.wav")
        };
    }

    preload_songs() {
        this.songs = {
            "s_moving": new Audio("./soundbox/sounds/flight.wav")
        };
    }

    action(controls) {
        if (controls.is_plus && !this.did_plus) {
            this.change_volume(1);
            this.last_change = 90;
        }
        if (controls.is_minus && !this.did_minus) {
            this.change_volume(-1);
            this.last_change = 90;
        }
        this.did_plus = controls.is_plus;
        this.did_minus = controls.is_minus;
        if (this.last_change > 0) {
            this.last_change -= 1;
        }
        this.has_started = [];
    }

    draw(ctx) {
        if (this.last_change > 0) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(5, 5, 100, 15);

            ctx.strokeStyle = "#333";

            ctx.moveTo(5, 5);
            ctx.lineTo(105, 5);
            ctx.lineTo(105, 20);
            ctx.lineTo(5, 20);
            ctx.lineTo(5, 5);
            ctx.stroke();

            ctx.fillStyle = "#0d0";
            ctx.fillRect(5, 5, this.volume*10, 15);
        }
    }
}