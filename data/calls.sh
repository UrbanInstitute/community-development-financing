topojson \
-o test.json \
--external-properties=test.tsv \
--id-property=+GEOID \
--properties='cbsa=test' \
	-- \
cb_2016_us_cbsa_5m.json

cb_2016_us_state_5m
cb_2016_us_cbsa_5m

topojson \
-o daca_cbsa4.json \
--external-properties=cbsa.tsv \
--id-property=+GEOID \
--properties='cbsa=cbsa' \
--properties='number=+number' \
--properties='percent=+percent' \
-- \
cb_2016_us_cbsa_5m.json \
cb_2016_us_state_5m.json

###########previous above#########################

####REMEMBER TO CHANGE THE "FIPS5" HEADER TO "GEOID" AND MAKE 5 DIGIT

ogr2ogr -f GeoJSON cb_2016_us_county_5m.json cb_2016_us_county_5m/cb_2016_us_county_5m.shp

topojson \
-o cd_landscape_v11.json \
--external-properties=county_v11.csv \
--id-property=+GEOID \
--properties='totalpop=+totalpop' \
--properties='countbelow200pct=+countbelow200pct' \
--properties='estab=+estab' \
--properties='Housingperpov200=+Housingperpov200' \
--properties='Businessperest=+Businessperest' \
--properties='ImpactFinanceperpov200=+ImpactFinanceperpov200' \
--properties='CommDevOtherperpov200=+CommDevOtherperpov200' \
--properties='z_Housing=+z_Housing' \
--properties='z_ImpactFinance=+z_ImpactFinance' \
--properties='z_CommDevOther=+z_CommDevOther' \
--properties='z_Business=+z_Business' \
--properties='z_GlobalCapacity=+z_GlobalCapacity' \
--properties='popsize_bin=+popsize_bin' \
--properties='Housing_ptile=+Housing_ptile' \
--properties='Housing_rank=+Housing_rank' \
--properties='Business_ptile=+Business_ptile' \
--properties='Business_rank=+Business_rank' \
--properties='ImpactFinance_ptile=+ImpactFinance_ptile' \
--properties='ImpactFinance_rank=+ImpactFinance_rank' \
--properties='CommDevOther_ptile=+CommDevOther_ptile' \
--properties='CommDevOther_rank=+CommDevOther_rank' \
--properties='GlobalCapacity_ptile=+GlobalCapacity_ptile' \
--properties='GlobalCapacity_rank=+GlobalCapacity_rank' \
--properties='CoreLogic_200pov=+CoreLogic_200pov' \
--properties='State=State' \
--properties='CountyName=CountyName' \
-- \
cb_2016_us_county_5m.json

topojson -o cd_landscape.json --external-properties=county.csv --id-property=+GEOID --properties='totalpop=+totalpop' --properties='countbelow200pct=+countbelow200pct' --properties='estab=+estab' --properties='Housingperpov200=+Housingperpov200' --properties='Businessperest=+Businessperest' --properties='ImpactFinanceperpov200=+ImpactFinanceperpov200' --properties='CommDevOtherperpov200=+CommDevOtherperpov200' --properties='z_Housing=+z_Housing' --properties='z_ImpactFinance=+z_ImpactFinance' --properties='z_CommDevOther=+z_CommDevOther' --properties='z_Business=+z_Business' --properties='z_GlobalCapacity=+z_GlobalCapacity' --properties='popsize_bin=+popsize_bin' --properties='Housing_ptile=+Housing_ptile' --properties='Housing_rank=+Housing_rank' --properties='Business_ptile=+Business_ptile' --properties='Business_rank=+Business_rank' --properties='ImpactFinance_ptile=+ImpactFinance_ptile' --properties='ImpactFinance_rank=+ImpactFinance_rank' --properties='CommDevOther_ptile=+CommDevOther_ptile' --properties='CommDevOther_rank=+CommDevOther_rank' --properties='GlobalCapacity_ptile=+GlobalCapacity_ptile' --properties='GlobalCapacity_rank=+GlobalCapacity_rank' --properties='CoreLogic_200pov=+CoreLogic_200pov' --properties='State=State' --properties='CountyName=CountyName' -- cb_2016_us_county_5m.json
