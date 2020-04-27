/* eslint-disable id-blacklist, no-restricted-imports, @typescript-eslint/ban-types */
import moment, { MomentInput, Moment } from 'moment-timezone';
import { TimeZone } from '../types';
import { DateTimeInput } from './moment_wrapper';
import { DEFAULT_DATE_TIME_FORMAT, MS_DATE_TIME_FORMAT } from './formats';
import { DateTimeOptions, getTimeZone } from './common';

export interface DateTimeOptionsWithFormat extends DateTimeOptions {
  format?: string;
  defaultWithMS?: boolean;
}

export type DateTimeFormatter<T extends DateTimeOptions = DateTimeOptions> = (
  dateInUtc: DateTimeInput,
  options?: T
) => string;

export const dateTimeFormat: DateTimeFormatter<DateTimeOptionsWithFormat> = (dateInUtc, options?) =>
  toTz(dateInUtc, getTimeZone(options)).format(getFormat(options));

export const dateTimeFormatISO: DateTimeFormatter = (dateInUtc, options?) =>
  toTz(dateInUtc, getTimeZone(options)).format();

export const dateTimeFormatTimeAgo: DateTimeFormatter = (dateInUtc, options?) =>
  toTz(dateInUtc, getTimeZone(options)).fromNow();

export const dateTimeFormatWithAbbrevation: DateTimeFormatter = (dateInUtc, options?) =>
  toTz(dateInUtc, getTimeZone(options)).format(`${DEFAULT_DATE_TIME_FORMAT} z`);

export const timeZoneAbbrevation: DateTimeFormatter = (dateInUtc, options?) =>
  toTz(dateInUtc, getTimeZone(options)).format('z');

const getFormat = <T extends DateTimeOptionsWithFormat>(options?: T): string => {
  if (options?.defaultWithMS) {
    return options?.format ?? MS_DATE_TIME_FORMAT;
  }
  return options?.format ?? DEFAULT_DATE_TIME_FORMAT;
};

const toTz = (dateInUtc: DateTimeInput, timeZone: TimeZone): Moment => {
  const date = dateInUtc as MomentInput;
  const zone = moment.tz.zone(timeZone);

  if (zone && zone.name) {
    return moment.utc(date).tz(zone.name);
  }

  switch (timeZone) {
    case 'utc':
      return moment.utc(date);
    default:
      return moment.utc(date).local();
  }
};
