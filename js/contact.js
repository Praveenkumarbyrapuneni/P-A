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

const scene = document.querySelector("[data-network-scene]");

if (scene) {
  const canvas = scene.querySelector(".contact-network-canvas");
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const nodes = [
    [-0.86, -0.5, 0.12], [-0.58, -0.16, 0.38], [-0.3, -0.62, 0.2], [0.02, -0.38, 0.62],
    [0.38, -0.65, 0.25], [0.75, -0.31, 0.7], [-0.74, 0.25, 0.58], [-0.42, 0.5, 0.3],
    [-0.08, 0.22, 0.86], [0.25, 0.48, 0.45], [0.66, 0.28, 0.92], [0.89, 0.64, 0.18],
    [-0.9, 0.78, 0.75], [-0.6, 0.83, 0.1], [-0.2, 0.86, 0.53], [0.18, 0.8, 0.14],
    [0.52, 0.78, 0.62], [-0.97, 0.02, 0.92], [0.96, -0.08, 0.42], [0.02, 0.02, 0.18]
  ].map(([x, y, z], index) => ({ x, y, z, index }));
  let width = 760;
  let height = 520;
  let scanStart = performance.now();
  let frameId;

  function resize() {
    const bounds = scene.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(bounds.width, 280);
    height = Math.max(bounds.height, 300);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
  }

  function project(node, tick) {
    const sway = Math.sin(tick * 0.0007 + node.index) * 0.012;
    const depth = 0.72 + node.z * 0.42;
    return {
      x: width * 0.5 + (node.x + sway + pointer.x * node.z * 0.1) * width * 0.41 * depth,
      y: height * 0.54 + (node.y + pointer.y * node.z * 0.08) * height * 0.43 * depth,
      depth
    };
  }

  function draw(tick) {
    const elapsed = reducedMotion ? 1800 : tick - scanStart;
    const scan = ((elapsed % 4800) / 4800) * 2 - 1;
    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#09182f";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(168, 210, 255, 0.12)";
    context.lineWidth = 1;
    for (let index = 0; index < 9; index += 1) {
      const x = width * (0.07 + index * 0.11);
      context.beginPath();
      context.moveTo(x, height * 0.08);
      context.lineTo(x + pointer.x * 8, height * 0.94);
      context.stroke();
    }
    for (let index = 0; index < 7; index += 1) {
      const y = height * (0.12 + index * 0.13);
      context.beginPath();
      context.moveTo(width * 0.04, y + pointer.y * 6);
      context.lineTo(width * 0.96, y);
      context.stroke();
    }

    const projected = nodes.map((node) => project(node, tick));
    nodes.forEach((node, index) => {
      for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
        const other = nodes[otherIndex];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance > 0.7) continue;
        const first = projected[index];
        const second = projected[otherIndex];
        const active = Math.abs((node.x + other.x) * 0.5 - scan) < 0.09;
        context.strokeStyle = active ? "rgba(125, 189, 255, 0.82)" : "rgba(125, 189, 255, 0.22)";
        context.lineWidth = active ? 1.6 : 1;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    });

    const scanX = width * 0.5 + scan * width * 0.4;
    const scanGradient = context.createLinearGradient(scanX - 42, 0, scanX + 42, 0);
    scanGradient.addColorStop(0, "rgba(125, 189, 255, 0)");
    scanGradient.addColorStop(0.5, "rgba(125, 189, 255, 0.7)");
    scanGradient.addColorStop(1, "rgba(125, 189, 255, 0)");
    context.fillStyle = scanGradient;
    context.fillRect(scanX - 42, height * 0.08, 84, height * 0.84);

    projected.forEach((point, index) => {
      const active = Math.abs(nodes[index].x - scan) < 0.08;
      const radius = 2.5 + point.depth * 3.5;
      context.beginPath();
      context.fillStyle = active ? "#a8d2ff" : nodes[index].index % 5 === 0 ? "#43b883" : "#ffffff";
      context.shadowColor = active ? "rgba(125, 189, 255, 0.9)" : "transparent";
      context.shadowBlur = active ? 16 : 0;
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    context.fillStyle = "rgba(168, 210, 255, 0.66)";
    context.font = "10px 'Geist Mono', monospace";
    context.fillText("PHYSICAL", width * 0.06, height * 0.9);
    context.fillText("NETWORK", width * 0.78, height * 0.14);

    if (!reducedMotion) frameId = requestAnimationFrame(draw);
  }

  scene.addEventListener("pointermove", (event) => {
    const bounds = scene.getBoundingClientRect();
    pointer.targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointer.targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  });

  scene.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  scene.querySelector("[data-network-trigger]").addEventListener("click", () => {
    scanStart = performance.now();
    if (!frameId && !reducedMotion) frameId = requestAnimationFrame(draw);
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw(performance.now());
}
