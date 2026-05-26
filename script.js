// ============================================================
//  PORTFOLIO SCRIPT
//  All content fetched from Flask backend (data.json)
// ============================================================

const API_BASE = "https://backend-portfolio-3mhd.onrender.com";

// Skill bar levels 
const SKILL_LEVELS = {
  "Python":        85,
  "JavaScript":    75,
  "Cloud Platforms": 70,
  "Databases":     65,
  "HTML/CSS":      80,
};


// ============================================================
//  HELPER: generic fetch with error handling
// ============================================================
async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint} → HTTP ${res.status}`);
  return res.json();
}


// ============================================================
//  1. LOAD ABOUT  →  Hero + Nav + About section + Footer
// ============================================================
async function loadAbout() {
  try {
    const d = await apiFetch("/api/about");

    // Nav logo
    document.getElementById("navLogo").innerHTML =
      `${d.name.split(" ")[0]}<span class="dot">.</span>`;

    // Page title
    document.title = `${d.name} · Portfolio`;

    // Hero
    document.getElementById("heroName").innerHTML =
      `${d.name.split(" ")[0]} <br/>
       <span class="accent">${d.name.split(" ").slice(1).join(" ")}</span>`;
    document.getElementById("heroRole").textContent = d.title;
    document.getElementById("heroAvatar").src = `${API_BASE}${d.photo}`;

    // About bio
    document.getElementById("aboutBio").textContent = d.bio;

    // About stats (projects / languages count from skills later,
    //   but we can show availability + location here)
    document.getElementById("aboutStats").innerHTML = `
      <div class="stat">
        <span class="stat-num">10+</span>
        <span class="stat-label">Projects</span>
      </div>
      <div class="stat">
        <span class="stat-num">3+</span>
        <span class="stat-label">Years Coding</span>
      </div>
      <div class="stat">
        <span class="stat-num">5+</span>
        <span class="stat-label">Technologies</span>
      </div>
    `;

    // About card
    document.getElementById("aboutCard").innerHTML = `
      <div class="info-row"><span class="info-icon">📍</span><span>${d.location}</span></div>
      <div class="info-row"><span class="info-icon">📧</span><span>${d.email}</span></div>
      <div class="info-row"><span class="info-icon">📱</span><span>${d.phone}</span></div>
      <div class="info-row">
        <span class="info-icon">💼</span>
        <span class="${d.available ? "badge-open" : "badge-closed"}">
          ${d.available ? "Open to Opportunities" : "Not Available"}
        </span>
      </div>
      <a href="resume.pdf" class="btn btn-primary mt" download>Download CV</a>
    `;

    // Contact tagline
    document.getElementById("contactTagline").textContent = d.available
      ? "I'm currently open to new opportunities. Feel free to reach out!"
      : "I'm busy but feel free to reach out for future opportunities.";

    // Contact items
    document.getElementById("contactItems").innerHTML = `
      <div class="contact-item">
        <span>📧</span>
        <a href="mailto:${d.email}">${d.email}</a>
      </div>
      <div class="contact-item">
        <span>📱</span><span>${d.phone}</span>
      </div>
      <div class="contact-item">
        <span>🔗</span>
        <a href="${d.linkedin}" target="_blank" rel="noopener">
          ${d.linkedin.replace("https://", "")}
        </a>
      </div>
      <div class="contact-item">
        <span>💻</span>
        <a href="${d.github}" target="_blank" rel="noopener">
          ${d.github.replace("https://", "")}
        </a>
      </div>
    `;

    // Footer
    document.getElementById("footerName").textContent = d.name;

  } catch (err) {
    console.error("loadAbout failed:", err);
    document.getElementById("heroName").textContent   = "Portfolio";
    document.getElementById("contactTagline").textContent =
      "⚠️ Could not load info. Server might be starting up — try again in a moment.";
    document.getElementById("contactItems").innerHTML =
      `<div class="contact-error">⚠️ Backend unreachable.</div>`;
  }
}


// ============================================================
//  2. LOAD SKILLS  →  Skill category cards + Skill bars
// ============================================================
async function loadSkills() {
  const grid = document.getElementById("skillsGrid");
  const bars = document.getElementById("skillBars");

  // Show skeletons while loading
  grid.innerHTML = Array(4).fill(
    `<div class="skill-category">
       <div class="skeleton sk-line sk-mid" style="margin-bottom:1rem"></div>
       <div class="skeleton sk-line sk-full"></div>
       <div class="skeleton sk-line sk-wide"></div>
     </div>`
  ).join("");

  try {
    const d = await apiFetch("/api/skills");

    // Category icons mapping
    const icons = {
      languages:  "⌨️",
      frameworks: "🧩",
      cloud:      "☁️",
      databases:  "🗄️",
      tools:      "🛠️",
    };

    // Render category cards
    grid.innerHTML = Object.entries(d)
      .map(([category, items]) => `
        <div class="skill-category">
          <h3>${icons[category] || "📌"} ${capitalize(category)}</h3>
          <div class="skill-tags">
            ${items.map(s => `<span class="tag">${s}</span>`).join("")}
          </div>
        </div>
      `).join("");

    // Render skill bars (use languages + cloud as bar items)
    const barItems = [
      ...d.languages.slice(0, 2),
      "Cloud Platforms",
      "Databases",
    ];

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
        </div>
      `;
    }).join("");

    // Animate bars on scroll
    initBarObserver();

  } catch (err) {
    console.error("loadSkills failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load skills.</p>`;
  }
}


// ============================================================
//  3. LOAD PROJECTS  →  Project cards grid
// ============================================================
async function loadProjects() {
  const grid = document.getElementById("projectsGrid");

  // Skeleton cards
  grid.innerHTML = Array(3).fill(`
    <div class="project-card">
      <div class="project-img">
        <div class="skeleton" style="width:80px;height:80px;border-radius:50%;"></div>
      </div>
      <div class="project-info">
        <div class="skeleton sk-line sk-wide" style="margin-bottom:.6rem"></div>
        <div class="skeleton sk-line sk-full"></div>
        <div class="skeleton sk-line sk-mid"></div>
      </div>
    </div>
  `).join("");

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
            <a href="${p.demo}"   class="btn btn-sm"              target="_blank" rel="noopener">Live Demo</a>
            <a href="${p.github}" class="btn btn-sm btn-outline"  target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("loadProjects failed:", err);
    grid.innerHTML = `<p class="contact-error">⚠️ Could not load projects.</p>`;
  }
}


// ============================================================
//  4. CONTACT FORM  →  POST to /contact
// ============================================================
const form       = document.getElementById("contactForm");
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
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, message }),
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


// ============================================================
//  5. ACTIVE NAV on scroll
// ============================================================
const sections = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 80;
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


// ============================================================
//  UTILS
// ============================================================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function initBarObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting)
        entry.target.style.animationPlayState = "running";
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".skill-bar-fill").forEach(bar => {
    bar.style.animationPlayState = "paused";
    observer.observe(bar);
  });
}


// ============================================================
//  BOOT — run all loaders in parallel
// ============================================================
Promise.all([
  loadAbout(),
  loadSkills(),
  loadProjects(),
]);
