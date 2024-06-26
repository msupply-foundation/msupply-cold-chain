import { FormatService } from '~services/FormatService';
import { MILLISECONDS } from '~constants';

describe('FormatService: lastDownloadTime', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    expect(formatter.lastDownloadTime(1, 0)).toBe('a few seconds ago');
    expect(formatter.lastDownloadTime(new Date().getTime() / MILLISECONDS.ONE_SECOND)).toBe(
      'a few seconds ago'
    );
    expect(
      formatter.lastDownloadTime(
        (new Date().getTime() - MILLISECONDS.ONE_MINUTE) / MILLISECONDS.ONE_SECOND
      )
    ).toBe('a minute ago');

    expect(
      formatter.lastDownloadTime(
        (new Date().getTime() - MILLISECONDS.ONE_MINUTE * 5) / MILLISECONDS.ONE_SECOND
      )
    ).toBe('5 minutes ago');
  });
});

describe('FormatService: listCumulativeBreach', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    let cumulative = { minimumTemperature: 9, maximumTemperature: 12, duration: 60 * 60 * 2 };
    expect(formatter.listCumulativeBreach(cumulative)).toEqual('2 hours between 9°C - 12°C');

    cumulative = { minimumTemperature: 10, maximumTemperature: 13, duration: 60 * 25 };
    expect(formatter.listCumulativeBreach(cumulative)).toEqual('25 minutes between 10°C - 13°C');

    cumulative = { minimumTemperature: 10, maximumTemperature: 13, duration: 60 * 35 };
    expect(formatter.listCumulativeBreach(cumulative)).toEqual('35 minutes between 10°C - 13°C');
  });
});

describe('FormatService: temperature', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    expect(formatter.temperature(10)).toEqual('10°C');
    expect(formatter.temperature(-10)).toEqual('-10°C');
    expect(formatter.temperature(-0)).toEqual('0°C');
    expect(formatter.temperature(0)).toEqual('0°C');
    expect(formatter.temperature(10.1)).toEqual('10.1°C');
    expect(formatter.temperature(10.11)).toEqual('10.11°C');
  });
});

describe('FormatService: headerDate', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    expect(formatter.headerDate(new Date('2020-01-01').getTime() / 1000)).toBe('01 January');
    expect(formatter.headerDate(new Date('2020-02-20').getTime() / 1000)).toBe('20 February');
  });
});

describe('FormatService: headerTime', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    expect(formatter.headerTime(new Date('1/1/2020').getTime() / 1000)).toBe('00:00');
    expect(formatter.headerTime(new Date('1/1/2020 21:30:00').getTime() / 1000)).toBe('21:30');
  });
});

describe('FormatService: sensorBatteryLevel', () => {
  it('Formats correctly when given a number', () => {
    const formatter = new FormatService();

    expect(formatter.sensorBatteryLevel(10)).toBe('10%');
  });
  it('Formats correctly when passed null', () => {
    const formatter = new FormatService();

    expect(formatter.sensorBatteryLevel(null)).toBe('N/A');
  });
});

describe('FormatService: deviceBatteryLevel', () => {
  it('Formats correctly', () => {
    const formatter = new FormatService();

    expect(formatter.deviceBatteryLevel(0.1)).toBe('10%');
  });
});

describe('FormatService: getTickFormatter', () => {
  it('Formats a single tick correctly', () => {
    const formatter = new FormatService();

    const tickFormatter = formatter.getTickFormatter();

    expect(tickFormatter(0)).toBe('(1/1) 12pm');
  });
  it('Formats multiple tick calls in a row correctly', () => {
    const formatter = new FormatService();

    const tickFormatter = formatter.getTickFormatter();

    expect(tickFormatter(0)).toBe('(1/1) 12pm');
    expect(tickFormatter(0)).toBe('12pm');
  });
  it('Formats multiple ticks over multiple months', () => {
    const formatter = new FormatService();

    const tickFormatter = formatter.getTickFormatter();

    expect(tickFormatter(0)).toBe('(1/1) 12pm');
    expect(tickFormatter(60 * 24 * 30)).toBe('(2/1) 12am');
  });
});

describe('FormatService:dateRange', () => {
  it('Formats a date correctly, given two unix timestamps', () => {
    const formatter = new FormatService();
    const from = 100;
    const to = 1000;

    expect(formatter.dateRange(from, to)).toEqual('Jan 1st - Jan 1st');
  });
});

describe('FormatService:fullDate', () => {
  it('Formats a date correctly, given two unix timestamps', () => {
    const formatter = new FormatService();
    const from = 0;

    expect(formatter.fullDate(from)).toEqual('01-01-1970-12-00-00');
  });
});

describe('FormatService:hide', () => {
  it('Formats hidden text with the correct number of special chars', () => {
    const formatter = new FormatService();

    const one = 'abc';
    expect(formatter.hide(one)).toBe('●●●');

    const two = 'a';
    expect(formatter.hide(two)).toBe('●');

    const three = 'abcdefg';
    expect(formatter.hide(three)).toBe('●●●●●●●');
  });
});
