#' Return a data frame of synthetic data generated according to the underlying
#' model.
#'
#' Currently does not support signal-dependent-noise, so SDs are similar whether
#' means are high or low.
#'
#' @param n number of participants to simulate for
#' @param beneficiaryEffectMean mean effect size (in scale points)
#' @param beneficiaryEffectSD effect size standard deviation (in scale points)
#' @param majorityEffectMean mean effect size (in scale points)
#' @param majorityEffectSD effect size standard deviation (in scale points)
#' @param effectSizeMean mean effect size (in scale points)
#' @param effectSizeSD effect size standard deviation (in scale points)
#' @param nReps number of trials in each condition by each participant
#'
#' @return tibble with n x length(nReps) x 4 rows
generateData <- function(
  n, 
  beneficiaryEffectMean = 5,
  beneficiaryEffectSD = 15,
  majorityEffectMean = 5,
  majorityEffectSD = 15,
  effectSizeMean = 5, 
  effectSizeSD = 15,
  nReps = 3
  ) {
  # Experimental conditions with fixed effects
  outcomes <- c('bad', 'good')
  pGetsOutcome <- c(F, F, F, T, T)
  pInMajority <- c(T, F)
  
  set <- expand_grid(outcomes, pGetsOutcome, pInMajority)
  
  # Numbers for row count calculations
  N <- list(
    p = n,
    r = nReps * nrow(set)
  )
  
  # Participant parameters
  # These values are estimated from empirical data for previous experiments.
  # Specifically these are taken from the data with group = 'five'
  ps <- tibble(
    pid = 1:N$p,
    scaleResp_m = rnorm(N$p, 43, 21),
    scaleResp_sd = abs(rnorm(N$p, 7, 9)),
    outcome_m = rnorm(N$p, 11, 23),
    outcome_sd = abs(rnorm(N$p, 2, 10)),
    beneficiary = rnorm(N$p, beneficiaryEffectMean, beneficiaryEffectSD),
    # Guestimate a sensible standard deviation roughly based on effect size
    beneficiary_sd = abs(rnorm(N$p, beneficiaryEffectSD, beneficiaryEffectSD / 3)),
    majority = rnorm(N$p, majorityEffectMean, majorityEffectSD),
    # Guestimate a sensible standard deviation roughly based on effect size
    majority_sd = abs(rnorm(N$p, majorityEffectSD, majorityEffectSD / 3)),
    effectSize_m = rnorm(N$p, effectSizeMean, effectSizeSD),
    # Guestimate a sensible standard deviation roughly based on effect size
    effectSize_sd = abs(rnorm(N$p, effectSizeSD, effectSizeSD / 3))
  )
  
  # Blank data frame with crossed condition structure
  data <- crossing(pid = 1:N$p, 
                   rep = 1:N$r) %>%
    mutate(
      outcome = set$outcomes[(rep %% nrow(set)) + 1],
      pGetsOutcome = set$pGetsOutcome[(rep %% nrow(set)) + 1],
      pInMajority = set$pInMajority[(rep %% nrow(set)) + 1]
    ) %>%
    select(-rep) %>%
    nest(data = -pid) %>%
    mutate(
      data = map(data, ~ rowid_to_column(., var = 'trialId'))
    ) %>%
    unnest(data) %>%
    mutate(
      scaleResp = NA,
      scaleResp_plain = NA
    )

  # Temporarily join the dataframes to make mutation easier
  data_generator <- left_join(data, ps, by = c('pid'), suffix = c("", ".y"))
  
  # Use participant data to fill in data frame
  data_generator <- data_generator %>%
    # apply effects
    mutate(
      scaleResp = rnorm(n(), scaleResp_m, scaleResp_sd) +                              # basic mean
        rnorm(n(), majority, majority_sd) * pInMajority +                              # whether participant is in majority
        rnorm(n(), outcome_m, outcome_sd) * (outcome == 'good') +                      # outcome valence
        rnorm(n(), beneficiary, beneficiary_sd) * pGetsOutcome +                       # participant is beneficiary
        rnorm(n(), effectSize_m, effectSize_sd) * pGetsOutcome * (outcome == 'good'),  # interaction
      # plain uses static effect sizes for each participant rather than a distribution per trial
      scaleResp_plain = rnorm(n(), scaleResp_m, scaleResp_sd) +
        majority * pInMajority +
        outcome_m * (outcome == 'good') +
        beneficiary * pGetsOutcome +
        effectSize_m * pGetsOutcome * (outcome == 'good')
    ) 
  
  # Clamp values to scale limits
  data_generator <- data_generator %>%
    mutate(scaleResp = pmin(pmax(scaleResp, 0), 100),
           scaleResp_plain = pmin(pmax(scaleResp_plain, 0), 100))
  
  # Return without the ps fields
  data_generator %>% select(names(data))
}

#' Generate data based on real participants/summary stats.
#' @param n number of cases to generate
#' @param betas list of betas to use instead of deriving them in the form \code{list('0' = 0, '2' = 0.3)}
#' @details The model used is:
#'   $$responsibilityRating ~ 
#'     \beta_1 + 
#'     \beta_2 ratedGetsOutcome + 
#'     \beta_3 outcomeGood + 
#'     \beta_4 isParticipant + 
#'     \beta_5 outcomeGood:ratedGetsOutcome 
#'     \beta_6 ratedGetsOutcome:isParticipant + 
#'     \beta_7 outcomeGood:isParticipant + 
#'     \beta_8 outcomeGood:ratedGetsOutcome:isParticipant$$
#' The betas correspond to the standardized effect size of each parameter. 
#' Betas can be specified as functions in which case they will be called with
#' the number of participant simulated and should return a vector of the same 
#' length (e.g. the way the \link{stats::rnorm} function works)
#' 
generateData.full <- function(n, betas = list(), path_to_root_dir = '') {
  # Load data
  d <- read.csv(
    paste0(path_to_root_dir, 'data/dataEXP3.csv'), 
    sep = ";", 
    stringsAsFactors = F
  ) %>% 
    as_tibble() 
  
  # Remove testing data
  d <- d %>% filter(prolificid != "", prolificid != "Matt")
  
  # Reformat to long
  d <- d %>%
    pivot_longer(cols = starts_with('responsibility_rating_p'),
                 names_to = 'rated_player',
                 values_to = 'responsibility_rating') %>%
    filter(!is.na(responsibility_rating)) %>%
    mutate(
      rated_player = factor(str_match(rated_player, 'p[0-9]+$')),
      is_participant = factor(rated_player == "p1"),
      rated_gets_outcome = factor(rated_player == paste0("p", getsout)),
      outcome = factor(outcome == 1)
    )
  
  # Select a sample of participants with replacement
  d <- d %>% 
    nest(obs = -subject_id) %>%
    rename(simID = subject_id) %>% 
    slice_sample(n = n, replace = T)
  
  # Apply a linear model to each case to get the sim parameters
  d <- mutate(
    d,
    obs = map(
      obs, 
      ~mutate(., responsibility_rating.z = scale(responsibility_rating))
    ),
    rr_mean = map_dbl(obs, ~mean(.$responsibility_rating)),
    rr_sd = map_dbl(obs, ~sd(.$responsibility_rating)),
    m = map(
      obs, 
      ~ lm(responsibility_rating.z ~
             rated_gets_outcome * outcome * is_participant,
           data = .)
    ),
    coefs = map(m, broom::tidy)
  )
  
  # Inject specified betas
  for (x in names(betas)) {
    v <- if (is_function(betas[[x]])) betas[[x]](n) else rep(betas[[x]], n)
    for (i in 1:n)
      d$coefs[[i]]$estimate[as.numeric(x)] <- v[i]
  }
  
  # Sim new data with each simulated participant
  d %>%
    mutate(
      sim = map2(
        obs,
        coefs,
        ~mutate(
          .x,
          responsibility_rating.z =
            .y$estimate[1] +
            .y$estimate[2] * (rated_gets_outcome == T) +
            .y$estimate[3] * (outcome == T) +
            .y$estimate[4] * (is_participant == T) +
            .y$estimate[5] * (rated_gets_outcome == T) * (outcome == T) +
            .y$estimate[6] * (rated_gets_outcome == T) * (is_participant == T) +
            .y$estimate[7] * (outcome == T) * (is_participant == T) +
            .y$estimate[8] * (rated_gets_outcome == T) * (outcome == T) * (is_participant == T)
        ) 
      )
    ) %>%
    select(-obs, -coefs, -m) %>%
    unnest(cols = sim) %>%
    mutate(
      responsibility_rating = rr_mean + responsibility_rating.z * rr_sd,
      responsibility_rating = case_when(
        responsibility_rating < 0 ~ 0,
        responsibility_rating > 100 ~ 100,
        T ~ responsibility_rating
      )
    ) %>% 
    select(-rr_mean, -rr_sd)
}
