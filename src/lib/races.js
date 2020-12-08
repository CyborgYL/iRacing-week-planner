// @flow

import moment, { duration } from 'moment';

import season from '../data/season.json';
import levelToClass, { levelToClassNumber } from './levelToClass';
import raceTimesArray from '../data/raceTimes';

const raceTimesById = raceTimesArray.reduce((races, race) => ({ ...races, [race.seriesId]: race }), {});

function getStartOfWeek(date) {
  return moment(date).subtract(1, 'days').startOf('isoWeek').add(1, 'days');
}

export type TimeableRace = {
  seriesId: number,
  everyTime?: moment.Duration,
  offset?: moment.Duration,
  setTimes?: Array<moment.Duration>,
}

function getNextRaceFromRecur(now, everyTime, offset) {
  const startOfWeek = getStartOfWeek(now);

  const nextDate = startOfWeek.clone().add(offset);
  const endDate = startOfWeek.clone().add({ weeks: 1, days: 1 });

  while (nextDate.isBefore(now) && nextDate.isBefore(endDate)) {
    nextDate.add(everyTime);
  }

  if (nextDate.isBefore(now)) {
    return null;
  }

  return nextDate;
}

function getNextRaceSetTimes(now, setTimes) {
  const startOfWeek = getStartOfWeek(now);

  const nextTime = setTimes.find((time) => startOfWeek.clone().add(time).isAfter(now));

  if (nextTime) {
    return startOfWeek.clone().add(nextTime);
  }

  const firstNextWeek = startOfWeek.clone().add(1, 'weeks').add(setTimes[0]);

  if (firstNextWeek.isAfter(now)) {
    return firstNextWeek;
  }

  return null;
}

export function getNextRace(date: moment.Moment, race: TimeableRace): ?moment.Moment {
  if (race.everyTime) {
    return getNextRaceFromRecur(date, race.everyTime, race.offset);
  }

  if (race.setTimes) {
    return getNextRaceSetTimes(date, race.setTimes);
  }

  return null;
}

const getType = (catId) => {
  const categories = {
    1: 'Oval',
    2: 'Road',
    3: 'Dirt',
    4: 'RX',
  };

  return categories[catId];
};

export default season.reduce((carry, series) => {
  const raceTimes = raceTimesById[series.seriesid] || {};

  const seriesName = series.seriesname;
  const seriesStart = moment(series.start, 'x').utc().startOf('day');

  if (raceTimes.weekStartOffset) {
    seriesStart.add(raceTimes.weekStartOffset);
  }

  const seriesEnd = moment(series.end, 'x').utc().startOf('isoWeek').add({ days: 1 });

  if (raceTimes.weekEndOffset) {
    seriesEnd.add(raceTimes.weekEndOffset);
  }

  const offWeeks = raceTimes.offWeeks || [];
  const raceWeekLength = Math.round(moment(seriesEnd).diff(seriesStart) / (series.tracks.length + offWeeks.length));

  const allRaceWeeks = series.tracks.map((track) => track.raceweek)
    .concat(offWeeks.map((offWeek) => offWeek - 1));

  allRaceWeeks.sort((a, b) => a - b);

  return carry.concat(series.tracks.map((track) => {
    const realRaceWeek = allRaceWeeks.indexOf(track.raceweek);

    const startTime = moment(seriesStart).add(raceWeekLength * realRaceWeek, 'ms').startOf('day').utc();
    const weekLength = duration(raceWeekLength);

    const type = getType(series.catid);

    return {
      series: seriesName,
      seriesId: series.seriesid,
      track: track.name,
      trackId: track.pkgid,
      week: track.raceweek,
      startTime,
      weekLength,
      endTime: moment(startTime).add(weekLength),
      official: series.isOfficial,
      licenceLevel: series.minlicenselevel,
      licenceClassNumber: levelToClassNumber(series.minlicenselevel),
      licenceClass: levelToClass(series.minlicenselevel, true),
      type,
      fixed: series.isFixedSetup,
      carClasses: series.carclasses.map(({ shortname }) => shortname),
      carIds: series.cars.map(({ sku }) => sku),
      seriesStart,
      seriesEnd,
      seasonId: series.seasonid,
      everyTime: raceTimes.everyTime,
      offset: raceTimes.offset,
      setTimes: raceTimes.setTimes,
    };
  }));
}, []);
