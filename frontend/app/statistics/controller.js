import { action, get, set } from "@ember/object";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { restartableTask, hash } from "ember-concurrency";

import QPController from "timed/controllers/qpcontroller";
import {
  underscoreQueryParams,
  serializeQueryParams,
  queryParamsState,
} from "timed/utils/query-params";
import { serializeMoment } from "timed/utils/serialize-moment";

const TYPES = {
  year: { include: "", requiredParams: [] },
  month: { include: "", requiredParams: [] },
  customer: { include: "", requiredParams: ["fromDate"] },
  project: {
    include: "customer",
    requiredParams: ["customer"],
    mobile: false,
  },
  task: {
    include: "project,project.customer",
    requiredParams: ["customer", "project"],
    mobile: false,
  },
  user: { include: "user", requiredParams: [] },
};

export default class StatisticsController extends QPController {
  types = Object.keys(TYPES);
  mobileTypes = Object.entries(TYPES)
    .filter(([, v]) => v.mobile !== false)
    .map(([k]) => k);

  queryParams = [
    "customer",
    "project",
    "task",
    "user",
    "reviewer",
    "billingType",
    "costCenter",
    "fromDate",
    "toDate",
    "type",
    "review",
    "notBillable",
    "verified",
    "billed",
    "ordering",
  ];

  @service store;
  @tracked customer;
  @tracked project;
  @tracked task;
  @tracked user;
  @tracked reviewer;
  @tracked type = this.types[0];
  @tracked observed;
  @tracked billingType;
  @tracked costCenter;
  @tracked fromDate;
  @tracked toDate;
  @tracked review;
  @tracked notBillable;
  @tracked verified;
  @tracked billed;
  @tracked ordering;

  @action
  updateParam(key, value) {
    this[key] = ["toDate", "fromDate"].includes(key)
      ? serializeMoment(value)
      : value;
    this.data.perform();
  }

  get billingTypes() {
    return this.store.peekAll("billing-type");
  }

  get costCenters() {
    return this.store.peekAll("cost-center");
  }

  get selectedCustomer() {
    return (
      this.customer &&
      !this.prefetchData.isRunning &&
      this.store.peekRecord("customer", this.customer)
    );
  }

  get selectedProject() {
    return (
      this.project &&
      !this.prefetchData.isRunning &&
      this.store.peekRecord("project", this.project)
    );
  }

  get selectedTask() {
    return (
      this.task &&
      !this.prefetchData.isRunning &&
      this.store.peekRecord("task", this.task)
    );
  }

  get selectedUser() {
    return (
      this.user &&
      !this.prefetchData.isRunning &&
      this.store.peekRecord("user", this.user)
    );
  }

  get selectedReviewer() {
    return (
      this.reviewer &&
      !this.prefetchData.isRunning &&
      this.store.peekRecord("user", this.reviewer)
    );
  }

  get missingParams() {
    return this.requiredParams.filter(
      (param) => !queryParamsState(this)[param].changed,
    );
  }

  get appliedFilters() {
    return Object.keys(queryParamsState(this)).filter((key) => {
      return (
        queryParamsState(this)[key]?.changed &&
        !["type", "ordering"].includes(key)
      );
    });
  }

  get requiredParams() {
    return TYPES[this.type].requiredParams;
  }

  prefetchData = restartableTask(async () => {
    const {
      customer: customerId,
      project: projectId,
      task: taskId,
      user: userId,
      reviewer: reviewerId,
    } = this.allQueryParams;

    return await hash({
      customer: customerId && this.store.findRecord("customer", customerId),
      project: projectId && this.store.findRecord("project", projectId),
      task: taskId && this.store.findRecord("task", taskId),
      user: userId && this.store.findRecord("user", userId),
      reviewer: reviewerId && this.store.findRecord("user", reviewerId),
      billingTypes: this.store.findAll("billing-type"),
      costCenters: this.store.findAll("cost-center"),
    });
  });

  data = restartableTask(async () => {
    if (this.missingParams.length) {
      return null;
    }

    const type = this.type;

    let params = underscoreQueryParams(
      serializeQueryParams(this.allQueryParams, queryParamsState(this)),
    );

    params = Object.keys(params).reduce((obj, key) => {
      return key !== "type" ? { ...obj, [key]: get(params, key) } : obj;
    }, {});

    return await this.store.query(`${type}-statistic`, {
      include: TYPES[type].include,
      ...params,
    });
  });

  @action
  setModelFilter(key, value) {
    set(this, key, value && value.id);
    this.data.perform();
  }

  @action
  reset() {
    this.resetQueryParams({ except: ["ordering", "type"] });
  }
}
