/**
 * jsPsych plugin for animating the results of a gamble
 * Matt Jaquiery
 */

jsPsych.plugins["jspsych-gamble-result"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'gamble-result',
    description: '',
    parameters: {
      trial_details: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Trial details',
        default: undefined,
        description: 'Trial details containing status (1=majority/2=minority), getsout (1=yes/2=no), and outcome (1=yes/2=no)'
      },
      gamble_player_names: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Gamble player names',
        default: undefined,
        array: true,
        description: 'Names of the players in the gamble. Participant must be the third name.'
      },
      gamble_images: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Gamble image source locations',
        default: [],
        array: true,
        description: 'The gamble offered on the choice screen.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    // Work out which gamble was chosen and who is getting the no/reward

    // Choose a gamble based on participant response and minority/majority status if participant responded, or random otherwise
    var key_data = jsPsych.data.get().select('button_pressed').values;
    var key = key_data[key_data.length - 1];
    var no_response = key == null;
    var gamble;
    if(no_response) {
      gamble = 0 + (Math.random() > .5);
    } else {
      key = parseInt(key);
      gamble = 0 + (trial.trial_details.status == 1? key : !key);
    }

    // Set the id of the winner to participant or random other as appropriate
    var winning_id;
    if(trial.trial_details.getsout == 1) {
      winning_id = 2;
    } else {
      // Randomly select 0, 1, 3, or 4
      winning_id = Math.random() < .5?
          0 + (Math.random() < .5) : 2 + (Math.random() < .5);
    }

    var result_img_src = trial.trial_details.outcome == 1? "img/Win.png" : "img/Loss.png";
    var result_text = trial.trial_details.outcome == 1? "Win!" : "Lose!";

    console.log(trial.trial_details)

    // Create the display div
    var div = display_element.appendChild(document.createElement('div'));
    div.id = "gamble-result";
    div.classList.add('winner-' + winning_id);
    var message = div.appendChild(document.createElement('p'));
    message.id = 'message';
    message.classList.add('always-show');
    if(no_response) {
      div.classList.add('no-response');
      var noresp = div.appendChild(document.createElement('p'));
      noresp.id = 'no-response';
      noresp.innerHTML = "You did not respond in time. You have failed this round.<br/>If it is used in calculating your bonus, this round will be counted as if <strong>You</strong> got a <strong>Loss</strong>.";
      noresp.classList.add('always-show');
    }
    /**
     * Setup the various images etc. required to animate the gamble result
     */
    function setup() {
      // Create the gamble image
      var gamble_img = div.appendChild(document.createElement('img'));
      gamble_img.id = 'gamble-img';
      if(trial.gamble_images.length)
        gamble_img.src = trial.gamble_images[gamble];
      else
        gamble_img.src = "img/unknown_outcome.png";
      // Create the outcome image
      var result_div = div.appendChild(document.createElement('div'));
      result_div.id = 'result';
      var cover = result_div.appendChild(document.createElement('img'));
      cover.classList.add('cover');
      cover.src = "img/Win.png";
      var result_img = result_div.appendChild(document.createElement('img'));
      result_img.classList.add('result-img');
      result_img.src = result_img_src;
      var result_p = result_div.appendChild(document.createElement('p'));
      result_p.innerText = result_text;
      // Create the participant images
      for(var i = 0; i < trial.gamble_player_names.length; i++) {
        var player_div = div.appendChild(document.createElement('div'));
        player_div.id = 'player-' + i;
        player_div.classList.add('player', 'player-' + i);
        if(i == winning_id)
          player_div.classList.add('winner');
        var player_img = player_div.appendChild(document.createElement('img'));
        player_img.src = i == 2? "img/Self_single.png" : "img/Other_single.png";
        // Label
        var label = player_div.appendChild(document.createElement('p'));
        label.innerText = trial.gamble_player_names[i];
      }
    }

    /**
     * Play the gamble-to-player assignment animation
     */
    function selectParticipant() {
      /**
       * Cycle the chosen gamble through the various players
       */
      function cycle() {
        div.classList.add('cycle');
        message.innerText = "Selecting recipient of the gamble...";
        setTimeout(zoom, 750);
      }

      /**
       * Zoom in on the chosen player and the gamble so we can see the result
       */
      function zoom() {
        div.classList.add('zoom');
        message.innerText = "Checking gamble result...";
        setTimeout(coinRoll, 250);
      }

      cycle();
    }

    /**
     * Roll the coin out of the gamble
     */
    function coinRoll() {
      div.classList.add('roll');
      setTimeout(payout, 250);
    }

    /**
     * Play the gamble-payout animation
     */
    function payout() {
      div.classList.add('payout');

      setTimeout(endTrial, 1000);
    }

    // Run the animation
    setup();
    selectParticipant();

    function endTrial() {
      var trial_data = {};
      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
