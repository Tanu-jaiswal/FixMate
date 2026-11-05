const providerTransitions = {
  pending: ["accepted", "rejected"],
  accepted: ["in_progress"],
  in_progress: ["completed"],
};

function canProviderSetStatus(currentStatus, nextStatus) {
  return providerTransitions[currentStatus]?.includes(nextStatus) || false;
}

function canCustomerCancel(currentStatus) {
  return currentStatus === "pending" || currentStatus === "accepted";
}

module.exports = { canProviderSetStatus, canCustomerCancel };
