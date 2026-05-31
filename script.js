// ============================================================
//  PORTFOLIO SCRIPT — Multi Page
// ============================================================

const API_BASE = "https://backend-portfolio-3mhd.onrender.com";

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

// ── Mobile menu ──────────────────────────────────────────────
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}
function closeMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
}

// ── API helper ───────────────────────────────────────────────
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} → HTTP ${res.status}`);
  return res.json();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Detect current page ──────────────────────────────────────
const _raw = window.location.pathname.split("/").pop();
const PAGE = !_raw ? "index.html" : _raw.includes(".") ? _raw : _raw + ".html";

// ════════════════════════════════════════════════════════════
//  HOME PAGE — index.html
//  Fetches: /api/about
// ════════════════════════════════════════════════════════════
async function loadHome() {
  try {
    const d = await apiFetch("/api/about");

    // Hero name — Hello I'm + jina
    setHTML("heroName",
      `${d.name.split(" ")[0]} ${d.name.split(" ")[1]}<br/>
       <span class="accent">${d.name.split(" ").slice(2).join(" ")}</span>`
    );
    setEl("heroRole",   d.title);
    setEl("heroBio",    d.bio);
    setEl("footerName", d.name);
    document.title = `${d.name} · Portfolio`;

  } catch (err) {
    console.error("loadHome failed:", err);
    setEl("heroName", "Rashid Busazi");
  }
}

// ════════════════════════════════════════════════════════════
//  PROFILE PAGE — profile.html
//  Fetches: /api/about
// ════════════════════════════════════════════════════════════
async function loadProfile() {
  try {
    const d = await apiFetch("/api/about");

    setAttr("profilePhoto", "src", `${API_BASE}${d.photo}`);

    setHTML("profileBadge",
      d.available
        ? `<span class="badge-open">● Open to Work</span>`
        : `<span class="badge-closed">● Not Available</span>`
    );

    setEl("profileName",  d.name);
    setEl("profileTitle", d.title);
    setEl("profileBio",   d.bio);

    setHTML("profileDetails", `
      <div class="info-row"><span>📍</span><span>${d.location}</span></div>
      <div class="info-row"><span>📧</span><span>${d.email}</span></div>
      <div class="info-row"><span>📱</span><span>${d.phone}</span></div>
      <div class="info-row"><span>🎓</span><span>Eastern Africa Statistical Training Center</span></div>
    `);

    setHTML("profileLinks", `
      <a href="${d.github}"   class="btn btn-outline btn-sm" target="_blank" rel="noopener">💻 GitHub</a>
      <a href="${d.linkedin}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">🔗 LinkedIn</a>
      <a href="https://wa.me/${d.phone.replace(/\D/g,'')}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">💬 WhatsApp</a>
    `);

  } catch (err) {
    console.error("loadProfile failed:", err);
    setEl("profileName", "⚠️ Could not load profile.");
  }
}

// ════════════════════════════════════════════════════════════
//  SKILLS PAGE — skills.html
//  Fetches: /api/skills
// ════════════════════════════════════════════════════════════
async function loadSkills() {
  const grid = document.getElementById("skillsGrid");
  const bars = document.getElementById("skillBars");
  if (!grid) return;

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
          <div class="skill-bar-label">
            <span>${skill}</span><span>${pct}%</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="--w:${pct}%"></div>
          </div>
        </div>`;
    }).join("");

    // Animate bars
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          e.target.style.animationPlayState = "running";
      });
    }, { threshold:0.3 });

    document.querySelectorAll(".skill-bar-fill").forEach(b => observer.observe(b));

  } catch (err) {
    console.error("loadSkills failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load skills.</p>`;
  }
}

// ════════════════════════════════════════════════════════════
//  PROJECTS PAGE — projects.html
//  Fetches: /api/projects
// ════════════════════════════════════════════════════════════
async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

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

// ════════════════════════════════════════════════════════════
//  CONTACT PAGE — contact.html
//  Fetches: /api/about  +  POST /api/contact
// ════════════════════════════════════════════════════════════
async function loadContact() {
  try {
    const d = await apiFetch("/api/about");

    setEl("contactTagline",
      d.available
        ? "I'm currently open to new opportunities. Feel free to reach out!"
        : "I'm busy but feel free to reach out for future opportunities."
    );

    setHTML("contactItems", `
      <div class="contact-item"><span>📧</span><a href="mailto:${d.email}">${d.email}</a></div>
      <div class="contact-item"><span>📱</span><span>${d.phone}</span></div>
      <div class="contact-item"><span>💬</span><a href="https://wa.me/${d.phone.replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp</a></div>
      <div class="contact-item"><span>🔗</span><a href="${d.linkedin}" target="_blank" rel="noopener">${d.linkedin.replace("https://","")}</a></div>
      <div class="contact-item"><span>💻</span><a href="${d.github}"   target="_blank" rel="noopener">${d.github.replace("https://","")}</a></div>
    `);

  } catch (err) {
    console.error("loadContact failed:", err);
    setEl("contactTagline", "⚠️ Could not load contact info.");
  }
}

// Contact form submit
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn  = document.getElementById("submitBtn");
    const formStatus = document.getElementById("formStatus");
    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    submitBtn.disabled    = true;
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

// ════════════════════════════════════════════════════════════
//  BOOT — load page specific data
// ════════════════════════════════════════════════════════════
if      (PAGE === "index.html"    || PAGE === "") loadHome();
else if (PAGE === "profile.html"  )               loadProfile();
else if (PAGE === "skills.html"   )               loadSkills();
else if (PAGE === "projects.html" )               loadProjects();
else if (PAGE === "contact.html"  )               loadContact();