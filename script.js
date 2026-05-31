// ============================================================
//  PORTFOLIO SCRIPT — Single Page
// ============================================================

const API_BASE = "https://your-render-url.onrender.com"; // ← weka URL yako ya Render

const SKILL_LEVELS = {
  "Python":85, "JavaScript":75, "HTML/CSS":80,
  "Cloud Platforms":70, "Databases":65,
};


// ── Safe DOM helpers ─────────────────────────────────────────
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el[attr] = value;
}
// ══════════════════════════════════════════
//  MOBILE MENU
// ══════════════════════════════════════════
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
}

// ══════════════════════════════════════════
//  ACTIVE NAV on scroll
// ══════════════════════════════════════════
const sections = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const id  = section.getAttribute("id");
    if (scrollY >= top && scrollY < top + section.offsetHeight) {
      navLinks.forEach(l => l.classList.remove("active"));
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) active.classList.add("active");
    }
  });
});

// ══════════════════════════════════════════
//  HELPER
// ══════════════════════════════════════════
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} → HTTP ${res.status}`);
  return res.json();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ══════════════════════════════════════════
//  1. LOAD ABOUT → Hero + Profile + Contact + Nav + Footer
// ══════════════════════════════════════════
async function loadAbout() {
  try {
    const d = await apiFetch("/api/about");

    // Nav logo + page title
    setHTML("navLogo", `${d.name.split(" ")[0]}<span class="dot">.</span>`);
    document.title = `${d.name} · Portfolio`;

    // Hero
    setHTML("heroName", `${d.name.split(" ")[0]} ${d.name.split(" ")[1]}<br/><span class="accent">${d.name.split(" ").slice(2).join(" ")}</span>`);
    setEl("heroRole", d.title);
    setEl("heroBio", d.bio);

    // Profile photo
    setAttr("profilePhoto", "src", `${API_BASE}${d.photo}`);

    // Profile badge
    setHTML("profileBadge", d.available ? `<span class="badge-open">● Open to Work</span>` : `<span class="badge-closed">● Not Available</span>`);

    // Profile name & title
    setEl("profileName", d.name);
    setEl("profileTitle", d.title);

    // Profile details
    setHTML("profileDetails", `
      <div class="info-row"><span>📍</span><span>${d.location}</span></div>
      <div class="info-row"><span>📧</span><span>${d.email}</span></div>
      <div class="info-row"><span>📱</span><span>${d.phone}</span></div>
    `);

    // Profile bio
    setEl("profileBio", d.bio);

    // Profile social links
    setHTML("profileLinks", `
      <a href="${d.github}"   class="btn btn-outline btn-sm" target="_blank" rel="noopener">💻 GitHub</a>
      <a href="${d.linkedin}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">🔗 LinkedIn</a>
    `);

    // Contact info
    setEl("contactTagline", d.available
      ? "I'm currently open to new opportunities. Feel free to reach out!"
      : "I'm busy but feel free to reach out for future opportunities.");

    setHTML("contactItems", `
      <div class="contact-item"><span>📧</span><a href="mailto:${d.email}">${d.email}</a></div>
      <div class="contact-item"><span>📱</span><span>${d.phone}</span></div>
      <div class="contact-item"><span>🔗</span><a href="${d.linkedin}" target="_blank" rel="noopener">${d.linkedin.replace("https://","")}</a></div>
      <div class="contact-item"><span>💻</span><a href="${d.github}"   target="_blank" rel="noopener">${d.github.replace("https://","")}</a></div>
    `);

    // Footer
    setEl("footerName", d.name);

  } catch (err) {
    console.error("loadAbout failed:", err);
    setEl("heroName", "Portfolio");
    setEl("contactTagline", "⚠️ Could not load info.");
    setHTML("contactItems", `<div class="contact-error">⚠️ Backend unreachable.</div>`);
  }
}

// ══════════════════════════════════════════
//  2. LOAD SKILLS
// ══════════════════════════════════════════
async function loadSkills() {
  const grid = document.getElementById("skillsGrid");
  const bars = document.getElementById("skillBars");

  try {
    const d = await apiFetch("/api/skills");

    const icons = {
      languages:"⌨️", frameworks:"🧩",
      cloud:"☁️", databases:"🗄️", tools:"🛠️",
    };

    grid.innerHTML = Object.entries(d).map(([cat, items]) => `
      <div class="skill-category">
        <h3>${icons[cat] || "📌"} ${capitalize(cat)}</h3>
        <div class="skill-tags">
          ${items.map(s => `<span class="tag">${s}</span>`).join("")}
        </div>
      </div>
    `).join("");

    const barItems = [...d.languages.slice(0,2), "Cloud Platforms", "Databases", "HTML/CSS"];
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

    // Animate bars when visible
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          e.target.style.animationPlayState = "running";
      });
    }, { threshold:0.4 });

    document.querySelectorAll(".skill-bar-fill").forEach(b => observer.observe(b));

  } catch (err) {
    console.error("loadSkills failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load skills.</p>`;
  }
}

// ══════════════════════════════════════════
//  3. LOAD PROJECTS
// ══════════════════════════════════════════
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
            <a href="${p.demo}"   class="btn btn-sm btn-primary" target="_blank" rel="noopener">Live Demo</a>
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

// ══════════════════════════════════════════
//  4. CONTACT FORM
// ══════════════════════════════════════════
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn  = document.getElementById("submitBtn");
    const formStatus = document.getElementById("formStatus");

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.className   = "form-status";

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ name, email, message }),
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

// ══════════════════════════════════════════
//  BOOT — load everything in parallel
// ══════════════════════════════════════════
Promise.all([loadAbout(), loadSkills(), loadProjects()]);