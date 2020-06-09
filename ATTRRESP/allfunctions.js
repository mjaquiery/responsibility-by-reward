import {Player} from "./classes.js";
import {
    fullscreen,
    instruct,
    welcome_block,
    consent,
    survey_trial,
    survey_id
} from "./describe_instructions.js";

function getExperimentPrematter(shortVersion = false) {
    let long = [];
    if(!shortVersion)
        long = [
            welcome_block,
            consent,
            survey_id,
            survey_trial,
        ];

    return [
        fullscreen,
        ...long,
        instruct
    ];
}

/**
 * Split the unique base-10 digits into 5 random pairs.
 * @return {string[]} 5 pairs of two-digit numbers from 01-98.
 */
function splitDigits() {
    const digits = [];
    for(let i = 0; i < 10; i++)
        digits.push(i);

    const out = [];
    while(digits.length) {
        const i = Math.floor(Math.random() * (digits.length - 1));
        const x = digits.splice(i, 1).toString();
        if(out.length && out[out.length - 1].length === 1)
            out[out.length - 1] += x;
        else
            out.push(x);
    }
    return out;
}


/**
 * Return a random integer between min and max
 * @param min {number} minimum
 * @param max {number} maximum
 * @param [inclusive=true] {boolean} whether the limits should be inclusive (true) or exclusive (false)
 * @return {number} integer between min and max
 */
function getRndInteger(min, max, inclusive = true) {
    if(!inclusive)
        return Math.floor(Math.random() * (max - min) ) + min;
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

/**
 * Show the participant the condition the players they are playing with.
 * @param otherPlayerNumbers
 * @return {{data: {label: string}, stimulus: string, type: string, choices: string, timing_post_trial: number, trial_duration: number}}
 */
function givecond(otherPlayerNumbers) {
    const imgSrc = otherPlayerNumbers.length === 2? 'Group_3' : 'Group_S';
    const last = otherPlayerNumbers.pop();
    const numbers = otherPlayerNumbers.join(', ') + ' and ' + last.toString();
    const node = {
        type: 'html-keyboard-response',
        stimulus:`
<p>Playing with Players ${numbers} (majority choice picked)</p>
<img src="img/${imgSrc}.jpg"></img>
`,
        choices: jsPsych.NO_KEYS,
        trial_duration: 2000,
        timing_post_trial: 0,
        data: {label: 'condition'}
    };
    return node;
}

/**
 * Offer the participant the choice between two gamble images
 * @param img1path
 * @param img2path
 * @return {{stimulus2: *, data: {label: string}, stimulus: *, type: string, choices: [string, string], timing_post_trial: number, trial_duration: number}}
 */
function gamblestim(img1path,img2path) {
    return {
        type: 'image-button-response2',
        stimulus:img1path,
        stimulus2:img2path,
        choices:['Gamble1', 'Gamble2'],
        trial_duration:2000,
        timing_post_trial:0,
        data: {label: 'choicegamble'}
    };
}

/**
 * Create a JSPsych plugin which animates the result of a trial
 * @param trial_details {{status: int, getsout: int, outcome: int, ...}} trial details from alltrials.js
 * @param gamble_images {string[]} img src for gamble [1, 2]
 * @param gamble_player_names {string[]} names of the players
 * @return {{gamble_img_src: string, gamble_result_src: string, data: {label: string}, gamble_player_names: string[], gamble_result_to: int, no_response: boolean, type: string}}
 */
function animateGamble(trial_details, gamble_images, gamble_player_names) {
    // Create a JSPsych plugin call with the appropriate values
    return {
        type: 'jspsych-gamble-result',
        trial_details,
        gamble_player_names,
        //gamble_images,
        data: {label: 'animateGamble'}
    };
}

/**
 * Play the gamble.
 * @param status
 * @param img1path
 * @param img2path
 * @return {{stimulus2: stimulus2, data: {label: string}, stimulus: stimulus, type: type, timing_post_trial: number, trial_duration: number}}
 */
function gambleplay(status,img1path,img2path) {

    var node = {

        type: function(){
            var key_data = jsPsych.data.get().select('button_pressed').values;
            var isresp=key_data[key_data.length-1];
            if (isresp==null) {
                return 'html-keyboard-response';
            }
            else {
                return 'image-keyboard-response2';
            }
        },

        stimulus:function(){
            var key_data = jsPsych.data.get().select('button_pressed').values;
            var isresp=key_data[key_data.length-1];

            //  console.log(isresp);
            //  console.log(status);
            if (isresp==null) {
                return '<p style="font-size:26px; text-align:center;">Too slow!</p>';
            }
            else {
                if (status==1){
                    if (isresp==1)
                    {return 'stim/defimg.jpg'}
                    else if (isresp==0)
                    {return img1path};
                }
                else if (status==2){
                    if (isresp==1)
                    {return img1path}
                    else if (isresp==0)
                    {return 'stim/defimg.jpg'};
                }
            }
        }
        ,
        stimulus2:  function(){
            var key_data = jsPsych.data.get().select('button_pressed').values;
            var isresp=key_data[key_data.length-1];
            //console.log(isresp);
            //console.log(status);
            if (isresp==null){return {}}
            else {
                if (status==1){
                    if (isresp==1)
                    {return img2path}
                    else if (isresp==0)
                    {return 'stim/defimg.jpg'};
                }
                else if (status==2) {
                    if (isresp==1)
                    {return 'stim/defimg.jpg'}
                    else if (isresp==0)
                    {return img2path};
                }
            }
        },
        trial_duration: Math.floor(Math.random()*500)+2000,
        timing_post_trial:0,
        data: {label: 'gambleplay'}
    };
    return node;
}

function gambleload() {

    var node = {
        type: 'html-keyboard-response',
        //  stimulus: '<div style="margin: 50px auto; width: 100px; height: 100px; background-color: rgb(88, 0, 0)"></div>',
        stimulus: function(){
            var theloader= '<p style="font-size:26px;position:relative"> Calculating and assigning outcome...  </p>  '+' <div class="loader_center"></div>';
            return theloader;
        },
        trial_duration: Math.floor(Math.random()*500)+1500,
        timing_post_trial:0,
        data: {label: 'gambleplay'}
    };
    return node;
}

function feedback(imgoutcome) {

    var trial_gap=function() {
        var gap=Math.floor(Math.random()*500)+250;
        return gap;
    };

    var node = {
        type: 'html-keyboard-response',
        stimulus: function(){
            var key_data = jsPsych.data.get().select('button_pressed').values;
            var isresp=key_data[key_data.length-1];
            if (isresp==null)  {
                var thisimg='<p style="font-size:26px; text-align:center;"> Round finished. Please be faster to be included in the next round! ';
            }
            else{
                var thisimg=imgoutcome;
            }
            return thisimg;
        },
        trial_duration:3000,
        timing_post_trial:trial_gap,
        data: {label: 'feedback'}
    }
    return node;
};

/**
 * Prompt for the responsibility scale response
 * @param status
 * @param out
 * @param getsout
 * @param img1
 * @param img2
 * @return {{data: {getsout: *, label: string, outcome: *, img2: *, status: *, img1: *}, on_finish: on_finish, stimulus: string, require_movement: number, type: string, timing_post_trial: (function(): number), labels: [string, string, string], trial_duration: trial_duration}}
 */
function scaleresp(status,out,getsout,img1,img2) {
    var trial_gap=function() {
        var gap=Math.floor(Math.random()*500)+250;
        return gap;
    };
    var node = {
        type: 'html-slider-response',
        stimulus: '<p style="font-size:16px; text-align:center;">  How responsible do you feel concerning <br> the outcome ? </p>',
        labels: ['Not at all', 'Partially', 'Very much'],
        timing_post_trial:trial_gap,
        data: {label: 'scaleresp', status:status,outcome:out,getsout:getsout,img1:img1,img2:img2},
        trial_duration: function(){
            var key_data = jsPsych.data.get().select('button_pressed').values;
            var isresp=key_data[key_data.length-1];

            if (isresp==null)  {
                var time=0;
                return time;
            }
        },
        require_movement: 1,
        on_finish:function (){

            var rt_data = jsPsych.data.get().select('rt').values;
            var key_data = jsPsych.data.get().select('button_pressed').values;
            //console.log(key_data[key_data.length-1]);
            jsPsych.data.addDataToLastTrial({rtchoice:rt_data[rt_data.length-5]});
            jsPsych.data.addDataToLastTrial({buttonchoice:key_data[key_data.length-1]});

            //console.log(rt_data)
            //console.log(key_data)
        }
    };
    return node;
}


/**
 * Return an array of playerCount players, the middle one of which is the participant.
 * @param playerCount {number} number of players to create (including participant)
 * @return {Player[]}
 */
function generatePlayers(playerCount) {
    const playerNumbers = splitDigits();
    while(playerNumbers.length >= playerCount)
        playerNumbers.pop();

    // Ensure all players except the participant have numbers
    if(playerNumbers.length !== playerCount - 1)
        console.error('Not all players have a player number.');

    const players = [];
    for(let p = 0; p < playerNumbers.length; p++)
        players.push(new Player({number: playerNumbers[p]}));

    // Insert the participant into the middle of the players
    let middleIndex = (playerCount - 1) / 2;
    if(middleIndex % 1)
        middleIndex = Math.random() < .5? Math.floor(middleIndex) : Math.ceil(middleIndex);

    players.splice(middleIndex, 0, new Player());
    return players;
}


/**
 * Detect the user's browser
 * @return {string|{browser: (*|string), version: (*|string)}}
 */
function getBrowserInfo()
{
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1]))
    {
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome')
    {
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null)
        M.splice(1, 1, tem[1]);
    return { 'browser': M[0], 'version': M[1] };
}

/**
 * Save data to a table via ajax request
 * @param data {object} data to save
 * @param tableName {string} name of the table to save the data to
 * @param [on_success=null] {function} callback to perform on success (response) => {}
 */
function save_data_pt(data, data_table, on_success = null) {
    if(!data)
        console.error('No data to save!');
    if(!data_table)
        console.error('Cannot save data to unspecified table!');

    $.ajax({
        type:'post',
        cache: false,
        url: 'savedata_sql.php', // change this to point to your php file.
        // opt_data is to add additional values to every row, like a subject ID
        // replace 'key' with the column name, and 'value' with the value.
        data: {
            table: data_table,
            json: JSON.stringify(data)
        },
        success: on_success
    });
}

export {getBrowserInfo, generatePlayers, save_data_pt, getExperimentPrematter, getRndInteger, givecond, gamblestim, gambleplay, gambleload, scaleresp, animateGamble};
