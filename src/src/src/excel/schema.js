// Single source of truth
module.exports = {
  SCHEMA_VERSION: "4.4",
  ALLOWED_STATUS: ["active", "disabled"],

  SHEETS: {
    products: "products",
    customers: "customers",
    staff: "staff",
    config: "config",
  },

  CUSTOMERS: {
    required: ["name", "status"],
    optional: ["start_date", "end_date", "contract_value", "note"],
  },

  STAFF: {
    required: ["name", "email", "status"],
    optional: ["phone", "note"],
  },
};
