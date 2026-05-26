// ============================================================
//  PORTFOLIO SCRIPT
// ============================================================

const API_BASE = "https://backend-portfolio-3mhd.onrender.com";

const SKILL_LEVELS = {
  "Python": 85, "JavaScript": 75,
  "Cloud Platforms": 70, "Databases": 65, "HTML/CSS": 80,
};

// ── Detect current page ──────────────────────────────────────
// Detect page — inafanya kazi na /profile.html na /profile
const _raw = window.location.pathname.split("/").pop();
const PAGE = !_raw ? "index.html" : _raw.includes(".") ? _raw : _raw + ".html";

// ── Sidebar ──────────────────────────────────────────────────
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// ── Helper fetch ─────────────────────────────────────────────
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} → HTTP ${res.status}`);
  return res.json();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Load Nav Logo (all pages) ────────────────────────────────
async function loadNavLogo() {
  try {
    const d = await apiFetch("/api/about");
    const logo = document.getElementById("navLogo");
    if (logo) {
      logo.innerHTML = `${d.name.split(" ")[0]}<span class="dot">.</span>`;
      document.title = `${d.name} · Portfolio`;
    }
  } catch (err) {
    console.error("loadNavLogo failed:", err);
  }
}

// ════════════════════════════════════════════════════════════
//  HOME PAGE — index.html
// ════════════════════════════════════════════════════════════
async function loadHome() {
  try {
    const d = await apiFetch("/api/about");

    document.getElementById("heroName").innerHTML =
      `${d.name.split(" ")[0]} <br/>
       <span class="accent">${d.name.split(" ").slice(1).join(" ")}</span>`;

    document.getElementById("heroRole").textContent = d.title;
    document.getElementById("heroBio").textContent  = d.bio;

    document.getElementById("heroAvatar").src =
      `${API_BASE}${d.photo}`;

  } catch (err) {
    console.error("loadHome failed:", err);
    document.getElementById("heroName").textContent = "Portfolio";
  }
}

// ════════════════════════════════════════════════════════════
//  PROFILE PAGE — profile.html
// ════════════════════════════════════════════════════════════
async function loadProfile() {
  try {
    const d = await apiFetch("/api/about");

    // Photo
    document.getElementById("profilePhoto").src = `${API_BASE}${d.photo}`;

    // Badge
    document.getElementById("profileBadge").innerHTML = d.available
      ? `<span class="badge-open">● Open to Work</span>`
      : `<span class="badge-closed">● Not Available</span>`;

    // Name & title
    document.getElementById("profileName").textContent  = d.name;
    document.getElementById("profileTitle").textContent = d.title;

    // Bio
    document.getElementById("profileBio").textContent = d.bio;

    // Details
    document.getElementById("profileDetails").innerHTML = `
      <div class="info-row"><span class="info-icon">📍</span><span>${d.location}</span></div>
      <div class="info-row"><span class="info-icon">📧</span><span>${d.email}</span></div>
      <div class="info-row"><span class="info-icon">📱</span><span>${d.phone}</span></div>
    `;

    // Social links
    document.getElementById("profileLinks").innerHTML = `
      <a href="${d.github}"   class="btn btn-outline" target="_blank" rel="noopener">💻 GitHub</a>
      <a href="${d.linkedin}" class="btn btn-outline" target="_blank" rel="noopener">🔗 LinkedIn</a>
    `;

  } catch (err) {
    console.error("loadProfile failed:", err);
  }
}

// ════════════════════════════════════════════════════════════
//  SKILLS PAGE — skills.html
// ════════════════════════════════════════════════════════════
async function loadSkills() {
  const grid = document.getElementById("skillsGrid");
  const bars = document.getElementById("skillBars");

  try {
    const d = await apiFetch("/api/skills");

    const icons = {
      languages: "⌨️", frameworks: "🧩",
      cloud: "☁️", databases: "🗄️", tools: "🛠️",
    };

    grid.innerHTML = Object.entries(d).map(([cat, items]) => `
      <div class="skill-category">
        <h3>${icons[cat] || "📌"} ${capitalize(cat)}</h3>
        <div class="skill-tags">
          ${items.map(s => `<span class="tag">${s}</span>`).join("")}
        </div>
      </div>
    `).join("");

    const barItems = [...d.languages.slice(0, 2), "Cloud Platforms", "Databases"];
    bars.innerHTML = barItems.map(skill => {
      const pct = SKILL_LEVELS[skill] ?? 60;
      return `
        <div class="skill-bar-item">
          <div class="skill-bar-label"><span>${skill}</span><span>${pct}%</span></div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="--w:${pct}%"></div>
          </div>
        </div>`;
    }).join("");

    // Animate bars
    document.querySelectorAll(".skill-bar-fill").forEach(bar => {
      bar.style.animationPlayState = "running";
    });

  } catch (err) {
    console.error("loadSkills failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load skills.</p>`;
  }
}

// ════════════════════════════════════════════════════════════
//  PROJECTS PAGE — projects.html
// ════════════════════════════════════════════════════════════
async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  try {
    const projects = await apiFetch("/api/projects");
    grid.innerHTML = projects.map(p => `
      <div class="project-card">
        <div class="project-img">
          <div class="project-placeholder">${p.emoji ?? "🚀"}</div>
        </div>
        <div class="project-info">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="project-tags">
            ${p.tech.map(t => `<span class="tag tag-sm">${t}</span>`).join("")}
          </div>
          <div class="project-links">
            <a href="${p.demo}"   class="btn btn-sm"             target="_blank" rel="noopener">Live Demo</a>
            <a href="${p.github}" class="btn btn-sm btn-outline" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("loadProjects failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load projects.</p>`;
  }
}

// ════════════════════════════════════════════════════════════
//  CONTACT PAGE — contact.html
// ════════════════════════════════════════════════════════════
async function loadContact() {
  try {
    const d = await apiFetch("/api/about");

    document.getElementById("contactTagline").textContent = d.available
      ? "I'm currently open to new opportunities. Feel free to reach out!"
      : "I'm busy but feel free to reach out for future opportunities.";

    document.getElementById("contactItems").innerHTML = `
      <div class="contact-item"><span>📧</span><a href="mailto:${d.email}">${d.email}</a></div>
      <div class="contact-item"><span>📱</span><span>${d.phone}</span></div>
      <div class="contact-item"><span>🔗</span><a href="${d.linkedin}" target="_blank" rel="noopener">${d.linkedin.replace("https://","")}</a></div>
      <div class="contact-item"><span>💻</span><a href="${d.github}"   target="_blank" rel="noopener">${d.github.replace("https://","")}</a></div>
    `;
  } catch (err) {
    console.error("loadContact failed:", err);
    document.getElementById("contactTagline").textContent = "⚠️ Could not load contact info.";
  }
}

// Contact form submit
const form = document.getElementById("contactForm");
if (form) {
  const submitBtn  = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    submitBtn.disabled    = true;
    submitBtn.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.className   = "form-status";

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok) {
        formStatus.textContent = "✅ Message sent successfully!";
        formStatus.classList.add("success");
        form.reset();
      } else {
        formStatus.textContent = data.error || "❌ Something went wrong.";
        formStatus.classList.add("error");
      }
    } catch {
      formStatus.textContent = "❌ Could not reach server.";
      formStatus.classList.add("error");
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

// ════════════════════════════════════════════════════════════
//  BOOT — detect page and load accordingly
// ════════════════════════════════════════════════════════════
loadNavLogo();

if (PAGE === "index.html" || PAGE === "") {
  loadHome();
} else if (PAGE === "profile.html") {
  loadProfile();
} else if (PAGE === "skills.html") {
  loadSkills();
} else if (PAGE === "projects.html") {
  loadProjects();
} else if (PAGE === "contact.html") {
  loadContact();
}
