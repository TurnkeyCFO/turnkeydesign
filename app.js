function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function computeDesignEstimate(payload) {
  const baseMap = {
    starter: { low: 1500, high: 2400 },
    growth: { low: 3400, high: 5200 },
    authority: { low: 7200, high: 10800 }
  };

  const businessStageAdjustments = {
    launch: { low: 0, high: 0 },
    growth: { low: 500, high: 900 },
    established: { low: 1200, high: 2200 }
  };

  const addOnMap = {
    guide: { low: 600, high: 1200, label: "Brand guide" },
    social: { low: 300, high: 700, label: "Social template kit" },
    collateral: { low: 500, high: 1200, label: "Sales collateral" },
    web: { low: 900, high: 1800, label: "Website art direction" },
    launch: { low: 700, high: 1600, label: "Launch asset pack" }
  };

  const rushAdjustment = payload.timeline === "rush" ? { low: 600, high: 1200 } : payload.timeline === "priority" ? { low: 300, high: 700 } : { low: 0, high: 0 };
  const revisionAdjustment = payload.revisions === "extended" ? { low: 250, high: 500 } : payload.revisions === "workshop" ? { low: 600, high: 1200 } : { low: 0, high: 0 };

  let low = baseMap[payload.package].low + businessStageAdjustments[payload.stage].low + rushAdjustment.low + revisionAdjustment.low;
  let high = baseMap[payload.package].high + businessStageAdjustments[payload.stage].high + rushAdjustment.high + revisionAdjustment.high;

  const addOns = [];
  payload.addOns.forEach((key) => {
    const addOn = addOnMap[key];
    if (!addOn) {
      return;
    }
    low += addOn.low;
    high += addOn.high;
    addOns.push(addOn.label);
  });

  const packageLabels = {
    starter: "Starter Identity",
    growth: "Growth Identity",
    authority: "Authority Brand System"
  };

  return {
    low,
    high,
    packageLabel: packageLabels[payload.package],
    summary: addOns.length ? addOns.join(", ") : "Core identity scope only",
    nextStep: payload.package === "authority" ? "Strategy workshop + roadmap" : "Discovery call + scope confirmation"
  };
}

function bindDesignEstimator() {
  const form = document.querySelector("[data-design-estimator]");
  if (!form) {
    return;
  }

  const output = {
    range: document.getElementById("estimate-range"),
    package: document.getElementById("estimate-package"),
    summary: document.getElementById("estimate-summary"),
    nextStep: document.getElementById("estimate-next-step")
  };

  const readPayload = () => ({
    package: form.package.value,
    stage: form.stage.value,
    timeline: form.timeline.value,
    revisions: form.revisions.value,
    addOns: Array.from(form.querySelectorAll('input[name="addons"]:checked')).map((item) => item.value)
  });

  const render = () => {
    const estimate = computeDesignEstimate(readPayload());
    output.range.textContent = `${formatCurrency(estimate.low)} - ${formatCurrency(estimate.high)}`;
    output.package.textContent = estimate.packageLabel;
    output.summary.textContent = estimate.summary;
    output.nextStep.textContent = estimate.nextStep;
  };

  form.addEventListener("input", render);
  render();
}

bindDesignEstimator();
