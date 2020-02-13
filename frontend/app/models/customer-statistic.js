import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  duration: attr("django-duration"),
  customer: belongsTo("customer")
});
