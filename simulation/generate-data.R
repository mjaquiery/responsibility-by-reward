#' Return a data frame of synthetic data generated according to the underlying
#' model.
#'
#' Currently does not support signal-dependent-noise, so SDs are similar whether
#' means are high or low.
#'
#' @param n number of participants to simulate for
#' @param effectSizeMean mean effect size (in scale points)
#' @param effectSizeSD effect size standard deviation (in scale points)
#' @param nReps number of trials in each condition by each participant
#'
#' @return tibble with n x length(nReps) x 4 rows
generateData <- function(
  n, 
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
  ps <- tibble(
    pid = 1:N$p,
    scaleResp_m = rnorm(N$p, 40, 18),
    scaleResp_sd = abs(rnorm(N$p, 10, 3)),
    outcome = rnorm(N$p, 3, 1),
    outcome_sd = abs(rnorm(N$p, 1, 1)),
    pGetsOutcome = rnorm(N$p, effectSizeMean, effectSizeSD),
    # Guestimate a sensible standard deviation roughly based on effect size
    pGetsOutcome_sd = abs(rnorm(N$p, effectSizeSD, effectSizeSD / 3))
  )
  
  # Blank data frame with crossed condition structure
  data <- tibble(
    pid = rep(rep(1:N$p, N$r), N$outcomes * N$pGets),
    trial = rep(1:(N$r * N$outcomes * N$pGets), each = N$p),
    outcome = rep(rep(outcomes, each = N$p), N$pGets * N$r),
    pGetsOutcome = rep(rep(pGetsOutcome, each = N$outcomes), each = N$p * N$r),
    scaleResp = NA,
    scaleRespFinal = NA
  )
  
  # Temporarily join the dataframes to make mutation easier
  data_generator <- left_join(data, ps, by = c('pid'), suffix = c("", ".y"))
  
  # Use participant data to fill in data frame
  data_generator <- data_generator %>%
    mutate(
      scaleResp = rnorm(nrow(data_generator), scaleResp_m, scaleResp_sd)
    ) %>%
    # apply effects
    mutate(
      # the outcome effect is directional - responsibility is reduced for bad
      outcome.y = if_else(outcome == "bad", outcome.y * -1, outcome.y),
      scaleRespFinal = scaleResp + 
        rnorm(nrow(data_generator), outcome.y, outcome_sd) + 
        # the pGetsOutcome effect only appears when pGetsOutcome
        (rnorm(nrow(data_generator), pGetsOutcome.y, pGetsOutcome_sd) *
        pGetsOutcome)
    ) 
  
  # Clamp values to scale limits
  data_generator <- data_generator %>%
    mutate(
      scaleResp = pmin(pmax(scaleResp, 0), 100),
      scaleRespFinal = pmin(pmax(scaleRespFinal, 0), 100)
    )
  
  # Return without the ps fields
  data_generator %>% select(names(data))
}
