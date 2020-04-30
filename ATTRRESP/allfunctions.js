function givecond(num1,num2,num3,num4) {
    var node = {
        type: 'html-keyboard-response',
        stimulus:'<p> Playing with Players '+ num1 +', '+num2+', '+num3+' and '+num4+' (majority choice picked) </p> <img src="img/Group_S.jpg"></img> ',
        choices: jsPsych.NO_KEYS,
        trial_duration:2000,
        timing_post_trial:0,
        data: {label: 'condition'}
    }
    return node;
};


function gamblestim(img1path,img2path) {
    var node = {
        type: 'image-button-response2',
        //type: 'image-button-response2',
        stimulus:img1path,
        stimulus2:img2path,
        choices:['Gamble1', 'Gamble2'],
        trial_duration:2000,
        timing_post_trial:0,
        data: {label: 'choicegamble'}

    }
    return node;
};

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
    }
    return node;
};

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
    }
    return node;
};

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
    }
    return node;
};
