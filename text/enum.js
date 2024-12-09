import { Enum } from "./../utilities/enum.js";

export class FontEnum extends Enum {
    static values = ["JacquardaBastarda9"];
    static JACQUARD = 0;
}

export class LetterBehaviorEnum extends Enum {
    static values = ["normal", "shakey"];
    static NORMAL = 0;
    static SHAKEY = 1;
}
