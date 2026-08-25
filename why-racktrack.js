const manifest = document.querySelector("[data-manifest]");

if (manifest) {
  const rows = [...manifest.querySelectorAll("[data-manifest-row]")];
  const steps = [...manifest.querySelectorAll("[data-manifest-step]")];
  const count = manifest.querySelector("[data-manifest-count]");
  const copy = manifest.querySelector("[data-manifest-copy]");
  const previous = manifest.querySelector("[data-manifest-prev]");
  const next = manifest.querySelector("[data-manifest-next]");
  const descriptions = [
    "See what is physically in the rack.",
    "Confirm each device against the live network.",
    "Know what changed and keep the record traceable."
  ];
  let activeStep = 0;

  function setStep(nextStep) {
    activeStep = (nextStep + steps.length) % steps.length;
    const displayStep = String(activeStep + 1).padStart(2, "0");

    count.textContent = `${displayStep} / ${steps.length}`;
    copy.textContent = descriptions[activeStep];

    rows.forEach((row, index) => {
      row.classList.toggle("is-active", index === activeStep);
    });

    steps.forEach((step, index) => {
      step.setAttribute("aria-selected", String(index === activeStep));
      step.classList.toggle("is-active", index === activeStep);
    });
  }

  steps.forEach((step, index) => {
    step.addEventListener("click", () => setStep(index));
  });

  previous.addEventListener("click", () => setStep(activeStep - 1));
  next.addEventListener("click", () => setStep(activeStep + 1));
}
