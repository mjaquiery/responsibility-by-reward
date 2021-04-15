
const fullscreen = {
    type: 'fullscreen',
    fullscreen_mode: true
};

const survey_id = {
    type: 'survey-text',
    questions: [{ prompt:"<p> Please enter your prolific ID. This is essential for you to get paid at the end of the experiment"}],
    data:{label:'surveyid'}
};

const survey_trial = {
    type: 'survey-text',
    questions: [{ prompt: "PLEASE ANSWER the following questions. This is mandatory to continue the study. If you do not wish to answer, please stop the experiment now, thank you. <br> <p> How old are you?" }, { prompt: "What is your gender? Please write F for female and M for male." }],
    data: { label: 'survey' }
};

const welcome_block = {
    type: 'html-button-response',
    stimulus:'<p> INFORMATION PAGE </p>' +
    '<p> Welcome to our experiment.</p>' +
    '<p>This study has been approved by the UCL Research Ethics Committee as Project ID Number: 5375/001 </p>'+
    '<p>Contact details of investigator:</p>'+
    '<p>Marwa El Zein</p>'+
    '<p>Institute of Cognitive Neuroscience, 17 Queen Square, London WC1N 3AR</p>'+
    '<p>m.zein@ucl.ac.uk AAA</p>'+
    '<p>We would like to invite you to participate in this experiment. It is up to you to decide whether or not to take part in the experiment.'+
    ' Choosing not to take part will not disadvantage you in any way. You can withdraw at any time during the experiment.</p>'+
    ' <br> Please take time to read the following information carefully and discuss it with others if you wish. Ask us if there is anything that is not clear or if you would like to have more information. Take time to decide whether or not you wish to take part. Thank you for reading this.</p>'+
    '<p> <br> In this study, you will do a group decision-making task that will be explained to you in details. The aim of the study is to understand how people make decisions as part of a group.'+
    ' It will last approximately 25 minutes. All participants must be over 18 years of age, with no substantial neurological or psychiatric disease. It is up to you to decide whether or not to take part. You can withdraw at any time without giving a reason.'+
    ' There are no known risks and you will not receive any benefit for participating in this study. If you have any questions or concerns, you may reach us by the email adress indicated above.</p>'+
    '<p> <br> All the information that we collect about you during the course of the research will be kept strictly confidential. You will not be identifiable in any ensuing reports or publications.'+
    ' Research designs often require that the full intent of the study not be explained prior to participation. Although we have described the general nature of the tasks that you will be asked to perform, the full intent of the study will not be explained to you until after the completion of the study.'+
    ' The data collected during the course of the project will most probably be published in an academic journal within the next 2 years, and might be presented at conferences.</p>'+
    '<p> <br> Notice: The controller for this project will be University College London (UCL). The UCL Data Protection Officer provides oversight of UCL activities involving the processing of personal data, and can be contacted at data-protection@ucl.ac.uk. This local privacy notice sets out the information that applies to this particular study.'+
    ' Further information on how UCL uses participant information can be found in our general privacy notice: click <a href="https://www.ucl.ac.uk/legal-services/privacy/ucl-general-research-participant-privacy-notice" target="_blank">here</a>. We will anonymise or pseudonymise your data.'+
    ' <br> By proceeding to the consent form, you indicate that you have read all the information listed above and are over the age of 18.</p>',
    choices: ['Proceed to consent form'],
    post_trial_gap:0,
    data:{label:'welcome'}
};

const consent = {
    type: 'survey-multi-select',
    questions: [
        {
            prompt: "Consent form: By checking the boxes below, I agree that:",
            options: ["1) I have carefully read the information page."],
            required: true,
        },
        {
            prompt: "",
            options: [ "2) I have been given contact details of the researcher to ask any question or discuss the study."],
            required: true,
        },
        {
            prompt: "",
            options: [  "3) I understand that I am free to withdraw at any time, without giving a reason, and without incurring any penalty."],
            required: true,
        },
        {
            prompt: "",
            options: ["4) I am over 18 years of age."],
            required: true,
        },
    ],
    required_message:['You can only proceed if you agee with all the statements by checking the boxes.'],
    button_label: 'Proceed to study instructions'

};

const instruct = {
    type:"instructions",
    pages:['<p style="font-size:24px; line-height:1.5"> In this group decision-making experiment, on each round, you have to choose between two gambles '+
    ' that will be depicted as images of real-life gambles such as the example below </p> <img src="img/examplepress.jpg">'+
    '<p style="font-size:24px; line-height:1.5"> You will have to decide which gamble to choose by pressing on the left or right gamble.'+
    ' The images will only appear for 2 seconds, and you only have 2 seconds to make your choice.'+
    ' Each gamble has different probabilities of winning and losing. <b> Your aim is to find which gambles are likely to'+
    ' make you win and choose them. <b> Please be aware that there is no link beween the type of image depicted (roulettes, dice, cards) and the actual probablity to win. </p>',

        "<p style='font-size:24px; line-height:1.5'> You will play as a group with 2 other players."+
        "<div style='float: center;'><img src='img/Group_S.jpg'></img> "+
        "<p style='font-size:24px; line-height:1.5'> This means that the chosen gamble will depend on a majority rule based on your choice and the choices of 2 other participants: the gamble chosen by 2 players or more will be picked."+
        " For example, if you and 1 other player choose the left Gamble on a given round, than the left Gamble will be picked. "+"2 players among 100 previous players will be randomly picked at the beginning of the experiment to play with you."+
        "The choices for the majority rule correspond to choices of these 2 players throughout the experiment.</p> ",

        "<p style='font-size:24px; line-height:1.5'> Before you see the outcome of the gamble, you will be shown which gamble was actually played, such as below </p> "+
        "<div style='float: center;'><img src='img/Picture2.png'></img> "+
        "<p style='font-size:24px; line-height:1.5'> This means that the left gamble was played at this round. The chosen gamble may not correspond to your choice if you are in the group minority.</p>",

        "<p style='font-size:24px; line-height:1.5'>  Only one person in the group will receive the outcome at each round. This will be determined randomly after the group decision has been made."+
        " You will be shown which member of the group will receive the outcome as depicted on the picture below, with an example of a round where YOU received a positive outcome, and an example of a round where PLAYER 06 received a negative outcome </p>"+
        "<div style='float: center;'><img src='img/outcomeill2.jpg'></img> ",

        "<p style='font-size:24px; line-height:1.5'>  <br> If the gamble chosen by your group results in a positive outcome, you or a member of your group receive(s) 1 point of bonus.</p>"
        + "<div style='float: center;'><img src='img/Win.jpg'></img> "+
        "<p style='font-size:24px; line-height:1.5'> If the gamble chosen by your group results in a negative outcome, you or a member of your group get(s) no bonus."+
        "  If you don't give a choice fast enough on a given round, it counts as a round where YOU get no bonus (the round continues for the group but you are excluded from that round).</p>" +
        "<div style='float: center;'><img src='img/Loss.jpg'></img> ",

        "<p style='font-size:24px; line-height:1.5'> At each round, you will have to complete a rating about your responsiblity and the responsibility of the other group members over the current round's outcome."+
        "This will be shown to you just after the outcome. Hover over each player to see the responsibility scale and move the cursor on the scale to make your rating."+
        "<div style='float: center;'><img src='img/instscale2.png'></img> ",

        "<p style='font-size:24px; line-height:2'> You will receive <strong> 3.5 pounds </strong> for your participation."+
        " <p style='font-size:24px; line-height:2'> One round will be randomly selected and you can earn bonus "+
        "money based on the outcome of that round, with 1 bonus point = <strong> 0.5 pounds </strong>" + "<div style='float: center;'><img src='img/50pcoin.jpg'></img> "+
        "<p style='font-size:24px; line-height:2'>  So if YOU (not another group member) received 1 bonus point on the selected round, you get 0.5 pounds bonus."+
        " Otherwise, you do not get any bonus. If you did not respond on the selected round, it counts as a no bonus trial (that may be picked for your bonus calculations), so please keep focused and respond at each round."+
        " <strong> Remember, you will only have 2 seconds to make your decisions. </strong>"

    ],
    //button_label_next:['Continue'],
    //button_label_previous:['BCK'],
    show_clickable_nav: true,
    timing_post_trial:0
};

const experiment_alert= {
    type: 'html-button-response',
    stimulus:'<p style="font-size:30px; text-align:center;"> <br> <br> <br> <br> <br> <br> The experiment is now starting </p>'+
        '<p style="font-size:26px; line-height:1.5 "> You will play 56 rounds.' +
        ' Every trial is important as only one will be picked up at the end of the experiment to give you a bonus. A missed trial is considered as a NO reward trial, even if you are playing in group or for another person. '+
        'Keep in mind that you always have 2 seconds to give an answer. And keep in mind that you have to press a button at each trial even those where another player plays for you. </p>',
    choices: ['START'],
    post_trial_gap:0,
    data:{label:'experiment_alert'}
};

export {fullscreen, survey_id, survey_trial, consent, experiment_alert, instruct, welcome_block}
