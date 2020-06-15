/**
 * jsPsych plugin for choosing and animating the results of a gamble
 * Matt Jaquiery
 */
import {Trial} from "../../classes.js";

jsPsych.plugins["three-player-gamble"] = (function() {

    const plugin = {};

    plugin.info = {
        name: 'three-player-gamble',
        description: 'Play the entire gamble choice and result flow for three players.',
        parameters: {
            trial: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'Trial object',
                default: undefined,
                description: 'Object defining the trial, including Players'
            },
            intro_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Intro duration',
                default: 2000,
                description: 'How long to show the players before offering gamble choice'
            },
            gamble_choice_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Gamble choice duration',
                default: 2000,
                description: 'How the gamble choice screen lasts'
            },
            gamble_choice_result_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Gamble choice result duration',
                default: 2000,
                description: 'How the votes are shown on the gamble choice screen'
            }
        }
    };

    plugin.trial = function(display_element, trial) {
        const T = new Trial(trial.trial);
        const data = {
            time_intro_start: null,
            time_intro_end: null,
            time_choice_start: null,
            time_choice_made: null,
            time_choice_end: null,
            time_choice_result_start: null,
            time_choice_result_end: null,
            time_result_start: null,
            time_result_end: null,
            time_ratings_start: null,
            time_ratings_end: null,
            participant_id: T.participant.id,
            ...trial.data
        };

        /**
         * Show the initial setup with the players sitting in their positions
         */
        data.time_intro_start = performance.now();
        const resultDiv = display_element.appendChild(
            document.createElement('div')
        );
        resultDiv.id = "gamble-result";
        resultDiv.classList.add("gamble-game", "intro");
        resultDiv.dataset.playerCount = T.players.length;
        // Add players
        T.players.forEach(p => {
            const player = resultDiv.appendChild(
                document.createElement('div')
            );
            player.id = `player-${p.id}`;
            player.classList.add(
                'player',
                `player-${p.id}`,
                p.isParticipant? 'participant' : 'bot',
                T.recipient.id === p.id? 'winner' : 'non-winner'
            );
            player.dataset.playerId = p.id;
            player.innerHTML = `
<div>
    <img src="img/${p.isParticipant? "Self" : "Other"}_single.png"/>
    <p>${p.name}</p>
</div>
`;
        });
        const messageP = resultDiv.appendChild(
            document.createElement('p')
        );
        messageP.id = 'message';
        messageP.classList.add('always-show');
        messageP.innerHTML = `Get ready to vote for a gamble (majority vote chosen)`;
        setTimeout(gambleChoice, trial.intro_duration);

        /**
         * Offer a choice of gamble to the participant
         */
        function gambleChoice() {
            data.time_intro_end = performance.now();
            data.time_choice_start = performance.now();
            resultDiv.classList.add('choice');
            messageP.innerHTML = `Click on a gamble to cast your vote`;
            const choiceDiv = resultDiv.appendChild(
                document.createElement('div')
            );
            choiceDiv.id = 'gamble-choice';
            choiceDiv.innerHTML = `
<div class="gamble-icons">
    <div>
        <img class="gamble-icon" id="gamble-a" data-gamble="A" src="stim/img${T.gamble_images.A}.jpg"/>
        <div class="votes"></div>    
    </div>
    <div>
            <img class="gamble-icon" id="gamble-b" data-gamble="B" src="stim/img${T.gamble_images.B}.jpg"/>
            <div class="votes"></div>
    </div>    
</div>
`;
            display_element.querySelectorAll('img.gamble-icon')
                .forEach(e => e.addEventListener('click', processGambleChoice));
            setTimeout(choiceResult, trial.gamble_choice_duration);
        }

        /**
         * Handle participant clicking a choice
         */
        function processGambleChoice() {
            const event = window.event;
            if(!event.currentTarget.classList.contains('gamble-icon'))
                return;
            data.time_choice_made = performance.now();
            T.participant.vote = event.currentTarget.dataset.gamble;
            // Remove other icons
            display_element.querySelectorAll('img.gamble-icon')
                .forEach(e => {
                    if(e.id !== event.currentTarget.id) {
                        e.src = "stim/defimg.jpg";
                        e.classList.add('unchosen');
                    } else
                        e.classList.add('chosen');
                    e.removeEventListener('click', processGambleChoice);
                });
            messageP.innerHTML = `Awaiting other votes...`;
        }

        /**
         * Show the result of the choice phase (i.e. who picked what).
         * If no choice is made, masking starts here.
         */
        function choiceResult() {
            data.time_choice_end = performance.now();
            data.time_choice_result_start = performance.now();
            messageP.innerHTML = `Vote result:`;
            // Mask trial if participant didn't vote
            if(!T.participant.vote)
                maskTrial();
            else {
                // Chosen option
                const c = T.participant.vote;
                // Unchosen option
                const x = T.participant.vote === "A"? "B" : "A";
                // Calculate where votes should go.
                if(!T.status) {
                    // Both others vote against participant
                    T.players
                        .filter(p => !p.isParticipant)
                        .forEach(p => p.vote = x);
                } else {
                    // A random one of the players votes with the participant
                    let players = T.players.filter(p => !p.isParticipant);
                    players = Math.random() < .5? players : players.reverse();
                    players[0].vote = c;
                    // The other votes at random
                    players[1].vote = Math.random() < .5? c : x;
                }
                // Draw player icons on the gamble they voted for
                document.querySelectorAll('.gamble-icon')
                    .forEach(e => {
                        T.players.forEach(p => {
                            if(p.vote === e.dataset.gamble)
                                addVoterIcon(e, p);
                        });
                        e.parentElement.querySelector('.votes')
                            .classList.add('show');
                    });
            }
            setTimeout(gambleResult, trial.gamble_choice_result_duration);
        }

        /**
         * Hide the rest of the trial from the participant because they did not respond in time
         */
        function maskTrial() {
            resultDiv.classList.add('no-response');
            const noresp = resultDiv.appendChild(document.createElement('p'));
            noresp.id = 'no-response';
            noresp.innerHTML = "You have failed this round.<br/>If it is used in calculating your bonus, this round will be counted as if <strong>You</strong> got a <strong>Loss</strong>.";
            noresp.classList.add('always-show');
        }

        /**
         * Draw a representation of a player's vote
         * @param img {HTMLElement} image which was voted for
         * @param player {Player} voting player
         */
        function addVoterIcon(img, player) {
            const voteDiv = img.parentElement.querySelector('.votes');
            const v = voteDiv.appendChild(document.createElement('div'));
            v.innerHTML = document.querySelector(`.player-${player.id}`).innerHTML;
            v.classList.add('player');
        }

        /**
         * Animate the recipient selection process and reveal the outcome.
         */
        function gambleResult() {
            resultDiv.classList.add('result');
            messageP.innerHTML = `Picking who gets the outcome...`;
            data.time_choice_result_end = performance.now();
            data.time_result_start = performance.now();
            // Choose a gamble based on votes if participant responded, or random otherwise
            // Choose a winning id based on pre-specification if participant responded, or random otherwise
            let gamble = Math.random() < .5? 'A' : 'B';
            let winning_id = T.players.filter(p => !p.isParticipant)[(Math.random() < .5) + 0].id;

            if(T.participant.vote) {
                const A = T.players.filter(p => p.vote === "A").length;
                const B = T.players.filter(p => p.vote === "B").length;
                gamble = A > B ? 'A' : 'B';
                winning_id = T.recipient.id;
            }

            // Create the display div
            resultDiv.classList.add('winner-' + winning_id);

            // Create the gamble image
            const gamble_img = resultDiv.appendChild(
                document.createElement('img')
            );
            gamble_img.id = 'gamble-img';
            gamble_img.src = "img/unknown_outcome.png";
            // Create the outcome image
            const result_div = resultDiv.appendChild(document.createElement('div'));
            result_div.id = 'result';
            const cover = result_div.appendChild(document.createElement('img'));
            cover.classList.add('cover');
            cover.src = "img/Win.png";
            const result_img = result_div.appendChild(document.createElement('img'));
            result_img.classList.add('result-img');
            result_img.src = T.outcome === 1? "img/Win.png" : "img/Loss.png";

            selectParticipant();
        }

        /**
         * Play the gamble-to-player assignment animation
         */
        function selectParticipant() {
            /**
             * Cycle the chosen gamble through the various players
             */
            function cycle() {
                const div = document.getElementById('gamble-result');
                const message = document.getElementById('message');
                div.classList.add('cycle');
                message.innerText = "Selecting recipient of the gamble...";
                setTimeout(zoom, 750);
            }

            /**
             * Zoom in on the chosen player and the gamble so we can see the result
             */
            function zoom() {
                const div = document.getElementById('gamble-result');
                const message = document.getElementById('message');
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
            const div = document.getElementById('gamble-result');
            div.classList.add('roll');
            setTimeout(payout, 250);
        }

        /**
         * Play the gamble-payout animation
         */
        function payout() {
            const div = document.getElementById('gamble-result');
            const message = document.getElementById('message');
            div.classList.add('payout');
            message.innerText = (!T.participant.vote)?
                `Showing gamble result` : T.resultString;
            setTimeout(getRatings, 3000);
        }

        /**
         * Add a responsibility rating bar to each player icon.
         * Move on when all bars have been changed.
         */
        function getRatings() {
            data.time_result_end = performance.now();
            data.time_ratings_start = performance.now();
            if(!T.participant.vote) {
                // End trial immediately if no response was given
                endTrial();
                return;
            }
            messageP.innerHTML = `Hover over each player to rate their <strong>responsibility</strong> for the group decision`;
            resultDiv.classList.add('ratings');
            document.querySelectorAll('.player').forEach(e => {
                const div = e.appendChild(document.createElement('div'));
                div.classList.add('slider');
                const labels = div.appendChild(document.createElement('div'));
                labels.classList.add('labels');
                ['Not at all', 'Very much'].forEach(L => {
                    const p = labels.appendChild(
                        document.createElement('p')
                    );
                    p.innerText = L;
                });
                const slider = div.appendChild(
                    document.createElement('input')
                );
                slider.type = "range";
                slider.value = "50";
                slider.addEventListener('change', checkRatings);
            });
        }

        function checkRatings(e) {
            const slider = e.currentTarget;
            slider.closest('.player').classList.add('changed');
            const player = T.getPlayerById(slider.closest('.player').dataset.playerId);
            player.responsibilityRating = slider.value;
            player.responsibilityTime = performance.now();
            let okay = true;
            T.players.forEach(p => {
                if(!p.responsibilityRating)
                    okay = false;
            });
            if(okay) {
                endTrial();
            }
        }

        function endTrial() {
            display_element.innerHTML = "";
            data.time_ratings_end = performance.now();
            // Extract the key data for saving!
            data.gamble_choice_A = T.gamble_images.A;
            data.gamble_choice_B = T.gamble_images.B;
            T.players.forEach(p => {
               data[`responsibility_rating_p${p.id}`] = p.responsibilityRating;
               data[`responsibility_time_p${p.id}`] = p.responsibilityTime;
               data[`vote_p${p.id}`] = p.vote;
            });
            // Save a JSON of the Trial, too
            for(let i = 0; i < T.players.length; i++)
                T.players[i] = JSON.stringify(T.players[i]);
            data.trial_data = JSON.stringify(T);
            jsPsych.finishTrial(data);
        }
    };

    return plugin;
})();
