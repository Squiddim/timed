/**
 * @module timed
 * @submodule timed-components
 * @public
 */

import { htmlSafe } from "@ember/template";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { dropTask } from "ember-concurrency";
import moment from "moment";

import formatDuration from "timed/utils/format-duration";
import { pad2joincolon } from "timed/utils/pad";

/**
 * The formatter for the slider tooltips
 *
 * @constant
 * @type {Object}
 * @public
 */
const Formatter = {
  /**
   * Format the minutes to a time string
   *
   * @method to
   * @param {Number} value The time in minutes
   * @return {String} The formatted time
   * @public
   */
  to(value) {
    return moment({ hour: 0 }).minute(value).format("HH:mm");
  },
};

/**
 * The attendance slider component
 *
 * @class AttendanceSliderComponent
 * @extends Ember.Component
 * @public
 */
export default class AttendanceSlider extends Component {
  /**
   * The attendance
   *
   * @property {Attendance} attendance
   * @public
   */
  @tracked values;
  @tracked tooltips;

  /**
   * Initialize the component
   *
   * @method init
   * @public
   */
  constructor(...args) {
    super(...args);

    this.tooltips = [Formatter, Formatter];
    this.values = this.start;
  }

  /**
   * The start and end time in minutes
   *
   * @property {Number[]} start
   * @public
   */
  get start() {
    return [
      this.args.attendance.from.hour() * 60 +
        this.args.attendance.from.minute(),
      // If the end time is 00:00 we need to clarify that this would be 00:00
      // of the next day
      this.args.attendance.to.hour() * 60 + this.args.attendance.to.minute() ||
        24 * 60,
    ];
  }

  /**
   * The duration of the attendance as a string
   *
   * @property {String} duration
   * @public
   */
  get duration() {
    const from = moment({ hour: 0 }).minute(this.values[0]);
    const to = moment({ hour: 0 }).minute(this.values[1]);

    return formatDuration(moment.duration(to.diff(from)), false);
  }

  /**
   * The labels for the slider
   *
   * @property {string[]} labels
   * @public
   */
  get labels() {
    const labels = [];

    for (let h = 0; h <= 24; h++) {
      for (let m = 0; m <= 30 && !(h === 24 && m === 30); m += 30) {
        const offsetH = (100 / 24) * h;
        const offsetM = (100 / 24 / 60) * m;

        labels.push({
          value: pad2joincolon(h, m),
          size: m === 0 ? "text-4xs" : "text-3xs",
          style: htmlSafe(`left: ${offsetH + offsetM}%;`),
        });
      }
    }

    return labels;
  }

  /**
   * Save the attendance
   *
   * @method save
   * @param {Number[]} values The time in minutes
   * @public
   */
  save = dropTask(async ([fromMin, toMin]) => {
    const attendance = this.args.attendance;

    attendance.set(
      "from",
      moment(attendance.get("from")).hour(0).minute(fromMin),
    );
    attendance.set("to", moment(attendance.get("to")).hour(0).minute(toMin));

    await this.args.onSave(attendance);
  });

  /**
   * Delete the attendance
   *
   * @method delete
   * @public
   */
  delete = dropTask(async () => {
    await this.args.onDelete(this.args.attendance);
  });
}
