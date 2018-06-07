
library(foreign)
library(readstata13)
#library(xlsx)
# library(tidyr)
# library(plyr)
# library(ggplot2)
# library(scales)


TestVar <- read.dta13("County_abridged_v14_2.dta")
print(TestVar)

write.csv(TestVar, file="county14_2.csv")

# test.stata <- read.dta("https://stats.idre.ucla.edu/stat/data/test.dta")
# print(test.stata)