d <- read.csv('past-data/testmarwa-matt.csv')
d$condition = factor(paste0(
  ifelse(d$status == 1, "Majority", "Minority"), "\n",
  ifelse(d$getsout == 1, "Participant", "Other"), "\n",
  ifelse(d$outcome == 1, "Reward", "NoReward")
))

table(d$condition)

library(ggplot2)

tmp <- d[!grepl('NA', d$condition), ]
tmp$condition <- factor(tmp$condition)
tmp$subject_id <- factor(tmp$subject_id)

theme_set(theme_light())

ggplot(tmp, aes(x = condition, y = response, colour = subject_id)) +
  geom_point(position = position_jitterdodge(.2), alpha = .5) +
  stat_summary(geom = 'errorbar', width = 0, fun.data = mean_cl_normal, position = position_dodge(.75)) +
  stat_summary(geom = 'point', fun.y = mean, na.rm = T, position = position_dodge(.75))

ggplot(tmp, aes(x = condition, y = rt, colour = subject_id)) +
  geom_point(position = position_jitterdodge(.2), alpha = .5) +
  stat_summary(geom = 'errorbar', width = 0, fun.data = mean_cl_normal, position = position_dodge(.75)) +
  stat_summary(geom = 'point', fun.y = mean, na.rm = T, position = position_dodge(.75))
