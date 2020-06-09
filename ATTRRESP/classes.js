import {getRndInteger, scaleresp, gambleplay, gamblestim, givecond, animateGamble} from "./allfunctions.js";

/**
 * @class blueprintObject
 * @classdesc basic prototype object to map object properties to the class
 */
class blueprintObject {
    constructor(props) {
        if(props) {
            const keys = Object.keys(props);
            for(let k = 0; k < keys.length; k++) {
                const key = keys[k];
                if(props.hasOwnProperty(key))
                    this[key] = props[key];
            }
        }
    }
}

/**
 * @class Player
 * @property [number=NaN] {number} player number (NaN for participant)
 * @property [isParticipant=true] {boolean} whether player is the participant
 * @property [name='You'] {string} player name ('You' for participant)
 */
class Player extends blueprintObject {
    constructor(props) {
        super(props);
        if(!this.number) {
            this.number = NaN;
            this.isParticipant = true;
            this._name = 'You';
            if(props && props.name)
                this._name = props.name;
        } else {
            this.isParticipant = false;
        }
    }

    get name() {
        if(this._name)
            return this._name;
        return `Player ${this.number.toString()}`;
    }
}

/**
 * @class Trial
 * @property trialNumber {number} trial number
 * @property outcome {number} whether the outcome is reward (1) or no reward (2)
 * @property getsout {number} whether the participant (1) or another player (2) gets the outcome
 * @property recipient {Player} Player designated to receive the outcome
 * @property gambleImages {{A: number, B: number}} image ids for gambles A and B
 * @property gambleChoices {{A: Player[]|[], B: Player[]|[]}} which players chose gamble A and B respectively
 * @property status {number} whether the selected gamble is the participant's (1) or not (2)
 *
 * @method setRecipient(players: Player[]) {void} set the recipient Player according to this.getsout
 * @method toJSPsychPlugins() {Object[]} converts Trial to an array of JSPsych Plugin objects for inserting into a timeline.
 */
class Trial extends blueprintObject {
    constructor(props) {
        super(props);
    }

    /**
     * Set the recipient Player according to this.getsout
     * @param players {Player[]} list of players in the game
     */
    setRecipient(players) {
        if(this.getsout === 1)
            this.recipient = players.filter(p => p.isParticipant)[0];
        else {
            const options = players.filter(p => !p.isParticipant);
            const i = getRndInteger(0, options.length);
            this.recipient = options[i];
        }
    }

    /**
     * Convert Trial to an array of JSPsych Plugin objects for inserting into a timeline.
     * @return {[]}
     */
    toJSPsychPlugins(players) {
        const plugins = [];

        // Basic setup screen
        plugins.push(
            givecond(players.filter(p => !p.isParticipant).map(p => p.name))
        );
        plugins.push(
            gamblestim(`stim/img${this.gamble_images.A}.jpg`,
                `stim/img${this.gamble_images.B}.jpg`)
        );
        plugins.push(
            gambleplay(this.status, this.gamble_images.A, this.gamble_images.B)
        );
        plugins.push(
            animateGamble(
                this,
                [this.gamble_images.A, this.gamble_images.B],
                players.map(p => p.name))
        );
        plugins.push(
            scaleresp(
                this.status,
                this.outcome,
                this.getsout,
                this.gamble_images.A,
                this.gamble_images.B)
        );

        return plugins;
    }
}

export {Player, Trial}