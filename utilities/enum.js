export class Enum {
    static values = [];
    static none_defined = -1;

    static toText(emu) {
        return this.values[emu];
    }

    static fromClass(klass) {
        if (klass === undefined) {
            return this.none_defined;
        }
        return this.values.indexOf(klass.constructor.name);
    }

    static next(emu) {
        if (emu < this.values.length - 1) {
            return emu + 1;
        }
        return 0;
    }
}