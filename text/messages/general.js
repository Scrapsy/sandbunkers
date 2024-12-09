import { Enum } from "./../../utilities/enum.js";
import { FontEnum, LetterBehaviorEnum } from "../enum.js";

/*
const general_greeting_message = '<text fontfamily=" ' + FontEnum.JACQUARD + ' " fontsize="36" colour="#33FF33">' +
    'Hello.<br />' +
    'Do you <effect style="shake" colour="#ff33ff">remember</effect> me?' +
'</text>';
*/

const general_greeting_message = "[set fontfamily=" + FontEnum.JACQUARD + " fontsize=36 colour=#333]" +
"Hello " +
"[set colour=#ff33ff behavior=" + LetterBehaviorEnum.SHAKEY + "]" +
"there" +
"[set colour=#333 behavior=" + LetterBehaviorEnum.NORMAL + "]" +
"[br]my little sweet" +
"[set colour=#f33 behavior=" + LetterBehaviorEnum.SHAKEY + "]" +
"ling";

export class MessageEnum extends Enum {
    static values = [general_greeting_message];
    static GENERAL_GREETING = 0;
}
