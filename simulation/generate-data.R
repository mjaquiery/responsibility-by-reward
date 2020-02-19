#' Return a data frame of synthetic data generated according to the underlying
#' model.
#'
#' Currently does not support signal-dependent-noise, so SDs are similar whether
#' means are high or low.
#'
#' @param n number of participants to simulate for
#' @param beneficiaryEffectMean mean effect size (in scale points)
#' @param beneficiaryEffectSD effect size standard deviation (in scale points)
#' @param effectSizeMean mean effect size (in scale points)
#' @param effectSizeSD effect size standard deviation (in scale points)
#' @param nReps number of trials in each condition by each participant
#'
#' @return tibble with n x length(nReps) x 4 rows
generateData <- function(
  n, 
  beneficiaryEffectMean = 5,
  beneficiaryEffectSD = 15,
  effectSizeMean = 5, 
  effectSizeSD = 15,
  nReps = 10
  ) {
  # Experimental conditions with fixed effects
  outcomes <- c('bad', 'good')
  pGetsOutcome <- c(F, T)
  
  # Numbers for row count calculations
  N <- list(
    p = n,
    r = nReps,
    outcomes = length(outcomes),
    pGets = length(pGetsOutcome)
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
    effectSize_m = rnorm(N$p, effectSizeMean, effectSizeSD),
    # Guestimate a sensible standard deviation roughly based on effect size
    effectSize_sd = abs(rnorm(N$p, effectSizeSD, effectSizeSD / 3))
  )
  
  # Blank data frame with crossed condition structure
  data <- crossing(pid = 1:N$p, 
                   rep = 1:N$r, 
                   outcome = outcomes, 
                   pGetsOutcome = pGetsOutcome) %>%
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
        rnorm(n(), outcome_m, outcome_sd) * (outcome == 'good') +                      # outcome valence
        rnorm(n(), beneficiary, beneficiary_sd) * pGetsOutcome +                       # participant is beneficiary
        rnorm(n(), effectSize_m, effectSize_sd) * pGetsOutcome * (outcome == 'good'),  # interaction
      # plain uses static effect sizes for each participant rather than a distribution per trial
      scaleResp_plain = rnorm(n(), scaleResp_m, scaleResp_sd) +
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
