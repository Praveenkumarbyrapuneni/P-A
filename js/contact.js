const form = document.querySelector("#brief-request");

if (form) {
  const status = document.querySelector("#form-status");
  const submit = form.querySelector("button[type=submit]");

  function setError(name, message) {
    const field = form.elements[name];
    const error = form.querySelector(`[data-error="${name}"]`);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    const name = form.elements.fullName.value.trim();
    const email = form.elements.email.value.trim();
    const mobile = form.elements.mobile.value.trim();
    const validName = setError(
      "fullName",
      !name ? "Full name is required." : !/^[A-Za-z][A-Za-z\s'.-]*$/.test(name) ? "Enter a valid name." : ""
    );
    const validEmail = setError(
      "email",
      !email ? "Email address is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Enter a valid email address." : ""
    );
    const validMobile = setError(
      "mobile",
      !mobile ? "Mobile number is required." : !/^\d{10}$/.test(mobile) ? "Enter exactly 10 digits." : ""
    );

    if (!validName || !validEmail || !validMobile) return;

    const company = form.elements.company.value.trim() || "Not provided";
    const requirement = form.elements.requirement.value.trim() || "Not provided";
    const subject = encodeURIComponent(`RackTrack platform brief request from ${name}`);
    const body = encodeURIComponent([
      `Full name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Mobile: ${form.elements.countryCode.value} ${mobile}`,
      `Requirement: ${requirement}`
    ].join("\n"));

    submit.disabled = true;
    window.location.href = `mailto:info@racktrack.ai?subject=${subject}&body=${body}`;
    status.textContent = "Your email app is ready with the request details. If it did not open, email info@racktrack.ai directly.";
    submit.disabled = false;
  });
}
