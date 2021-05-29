export const BREACH_CONFIG_REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

export const BREACH_REPORT = `
select (select "Continuous") "Breach Type",
tbc.description "Breach Name",
datetime(startTimestamp, "unixepoch", "localtime") "Start date",
coalesce(datetime(endTimestamp, "unixepoch", "localtime"), datetime("now", "localtime")) as "End date",
(coalesce(endTimestamp, strftime("%s", "now")) - startTimestamp) / 60 "Exposure Duration (minutes)",
max(temperature) as "Max Temp",
min(temperature) as "Min Temp"
from temperaturebreach tb
join temperaturelog tl on tl.temperatureBreachId = tb.id
left join temperaturebreachconfiguration tbc on temperatureBreachConfigurationId = tb.temperatureBreachConfigurationId
where tb.sensorId = ?
AND tl.timestamp >= ? AND tl.timestamp <= ?
group by tb.id
`;

export const REPORT = `
select datetime(s.programmedDate, "unixepoch", "localtime") "Programmed On", datetime(max(min(tl.timestamp),s.logDelay),"unixepoch","localtime") "Logging Start", s.logInterval / 60 "Logging Interval"
from sensor s
left join temperaturelog tl on tl.sensorId = s.id
where s.id = ?
`;

export const LOGS_REPORT = `
WITH FilteredLogs AS (SELECT * FROM TemperatureLog WHERE timestamp >= ? AND timestamp <= ? AND sensorId = ?),
cumulativeBreachFields AS (
SELECT *,
(SELECT CASE WHEN sum(logInterval) >= hotCumulativeDuration THEN 1 ELSE 0 END AS hasHotCumulative FROM FilteredLogs WHERE temperature >= hotCumulativeMinThreshold AND temperature <= hotCumulativeMaxThreshold) as hasHotCumulative,
(SELECT CASE WHEN sum(logInterval) >= coldCumulativeDuration THEN 1 ELSE 0 END AS hasColdCumulative FROM FilteredLogs WHERE temperature >= coldCumulativeMinThreshold AND temperature <= coldCumulativeMaxThreshold) as hasColdCumulative
FROM ( 
SELECT 
    hot.duration               AS     hotCumulativeDuration,
    cold.duration              AS     coldCumulativeDuration,
    hot.minimumTemperature     AS     hotCumulativeMinThreshold,
    hot.maximumTemperature     AS     hotCumulativeMaxThreshold,
    cold.minimumTemperature    AS     coldCumulativeMinThreshold,
    cold.maximumTemperature    AS     coldCumulativeMaxThreshold
FROM 
(SELECT * FROM TemperatureBreachConfiguration WHERE id = 'HOT_CUMULATIVE') hot 
LEFT JOIN (SELECT * FROM TemperatureBreachConfiguration WHERE id ='COLD_CUMULATIVE') cold
  )
)
  SELECT CASE 
  WHEN (SELECT hasHotCumulative from cumulativeBreachFields) = 1 AND temperature >= (SELECT hotCumulativeMinThreshold from cumulativeBreachFields) AND temperature <= (SELECT hotCumulativeMaxThreshold from cumulativeBreachFields) THEN "Hot" 
  WHEN (SELECT hasColdCumulative from cumulativeBreachFields) = 1 AND temperature >= (SELECT coldCumulativeMinThreshold from cumulativeBreachFields) AND temperature <= (SELECT coldCumulativeMaxThreshold from cumulativeBreachFields) THEN "Cold"
  ELSE "" END AS "Is cumulative breach",
  datetime(timestamp,"unixepoch","localtime") Timestamp,
  temperature Temperature,
  FilteredLogs.logInterval / 60 "Logging Interval (Minutes)",
  CASE WHEN tbc.id = "HOT_BREACH" THEN "Hot" when tbc.id = "COLD_BREACH" THEN "Cold" ELSE "" END AS "Is continuous breach"
  FROM FilteredLogs
  LEFT JOIN temperatureBreach tb ON tb.id = FilteredLogs.temperatureBreachId
  LEFT JOIN temperaturebreachconfiguration tbc ON tbc.id = tb.temperatureBreachConfigurationId
`;

export const STATS = `
WITH FilteredLogs AS (SELECT * FROM TemperatureLog WHERE timestamp >= ? AND timestamp <= ? AND sensorId = ?),
cumulativeBreachFields AS (
SELECT 
(SELECT CASE WHEN sum(logInterval) >= hotCumulativeDuration THEN 1 ELSE 0 END AS hasHotCumulative FROM FilteredLogs WHERE temperature >= hotCumulativeMinThreshold AND temperature <= hotCumulativeMaxThreshold) as hasHotCumulative,
(SELECT CASE WHEN sum(logInterval) >= coldCumulativeDuration THEN 1 ELSE 0 END AS hasColdCumulative FROM FilteredLogs WHERE temperature >= coldCumulativeMinThreshold AND temperature <= coldCumulativeMaxThreshold) as hasColdCumulative
FROM ( 
SELECT 
    hot.duration               AS     hotCumulativeDuration,
    cold.duration              AS     coldCumulativeDuration,
    hot.minimumTemperature     AS     hotCumulativeMinThreshold,
    hot.maximumTemperature     AS     hotCumulativeMaxThreshold,
    cold.minimumTemperature    AS     coldCumulativeMinThreshold,
    cold.maximumTemperature    AS     coldCumulativeMaxThreshold
FROM 
(SELECT * FROM TemperatureBreachConfiguration WHERE id = 'HOT_CUMULATIVE') hot 
LEFT JOIN (SELECT * FROM TemperatureBreachConfiguration WHERE id ='COLD_CUMULATIVE') cold
  )
)
SELECT
MAX(temperature) "Max Temperature",
MIN(temperature) "Min Temperature",
(SELECT hasHotCumulative from cumulativeBreachFields) + (SELECT hasColdCumulative FROM cumulativeBreachFields) AS "Number of cumulative breaches",
(SELECT count(*) FROM TemperatureBreach WHERE sensorid = ?) AS "Number of continuous breaches"
FROM FilteredLogs
LEFT JOIN cumulativeBreachFields 
`;
