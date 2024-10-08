"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Seconds = exports.MILLISECONDS = void 0;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const QUARTER_SECOND = 250;
const ONE_SECOND = 1000;
const ONE_MINUTE = SECONDS_PER_MINUTE * ONE_SECOND;
const ONE_HOUR = ONE_MINUTE * MINUTES_PER_HOUR;
const ONE_DAY = ONE_HOUR * HOURS_PER_DAY;
const TEN_SECONDS = ONE_SECOND * 10;
const THIRTY_SECONDS = ONE_SECOND * 30;
const SIXTY_SECONDS = ONE_SECOND * 60;
const TEN_MINUTES = ONE_MINUTE * 10;
const THIRTY_MINUTES = TEN_MINUTES * 3;
const MILLISECONDS = {
  QUARTER_SECOND,
  ONE_SECOND,
  THIRTY_SECONDS,
  ONE_MINUTE,
  TEN_SECONDS,
  TEN_MINUTES,
  THIRTY_MINUTES,
  ONE_DAY,
  SIXTY_SECONDS
};
exports.MILLISECONDS = MILLISECONDS;
let Seconds;
exports.Seconds = Seconds;

(function (Seconds) {
  Seconds[Seconds["OneDay"] = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY] = "OneDay";
})(Seconds || (exports.Seconds = Seconds = {}));
//# sourceMappingURL=Milliseconds.js.map