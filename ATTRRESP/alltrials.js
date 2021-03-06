/**
 * Return the trial construct for each trial set
 * @return {*|({getsout: number, trial: number, outcome: number, status: number})[]}
 */
function trials() {
    let allTrials =
        [
            {
                "trial": 1,
                "outcome": 2,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 2,
                "outcome": 2,
                "getsout": 2,
                "status": 1
            },
            {
                "trial": 3,
                "outcome": 2,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 4,
                "outcome": 2,
                "getsout": 2,
                "status": 1
            },
            {
                "trial": 5,
                "outcome": 2,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 6,
                "outcome": 2,
                "getsout": 1,
                "status": 1
            },
            {
                "trial": 7,
                "outcome": 2,
                "getsout": 1,
                "status": 2
            },
            {
                "trial": 8,
                "outcome": 2,
                "getsout": 1,
                "status": 1
            },
            {
                "trial": 9,
                "outcome": 2,
                "getsout": 1,
                "status": 2
            },
            {
                "trial": 10,
                "outcome": 1,
                "getsout": 2,
                "status": 1
            },
            {
                "trial": 11,
                "outcome": 1,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 12,
                "outcome": 1,
                "getsout": 2,
                "status": 1
            },
            {
                "trial": 13,
                "outcome": 1,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 14,
                "outcome": 1,
                "getsout": 2,
                "status": 1
            },
            {
                "trial": 15,
                "outcome": 1,
                "getsout": 2,
                "status": 2
            },
            {
                "trial": 16,
                "outcome": 1,
                "getsout": 1,
                "status": 1
            },
            {
                "trial": 17,
                "outcome": 1,
                "getsout": 1,
                "status": 2
            },
            {
                "trial": 18,
                "outcome": 1,
                "getsout": 1,
                "status": 1
            },
            {
                "trial": 19,
                "outcome": 1,
                "getsout": 1,
                "status": 2
            },
            {
                "trial": 20,
                "outcome": 2,
                "getsout": 2,
                "status": 1
            }
        ];

    allTrials = jsPsych.randomization.repeat(allTrials ,1);
    return allTrials;
}

/**
 * Return the blueprint structure for a block of trials.
 * Blueprints specify a trial id, an outcome, a status, and which player gets the outcome. All of these are repeated a given number of times and shuffled.
 * @param repetitions
 */
function threePlayerTrialStructure(repetitions = 1) {
    let blueprints = [];
    let i = 1;
    const outcomes = [1, 2];
    const statuses = [1, 2];
    const recipients = [0, 1, 2];

    for(let o of outcomes)
        for(let s of statuses)
            for(let r of recipients)
                blueprints.push({
                    trial: i++,
                    outcome: o,
                    status: s,
                    getsout: r
                });

    return jsPsych.randomization.repeat(blueprints, repetitions);
}