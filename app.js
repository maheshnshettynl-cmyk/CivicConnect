const API_URL = "/api/issues";
const form = document.getElementById("issueForm");
const issuesList = document.getElementById("issuesList");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
let allIssues = [];

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function updateDashboard(issues) {
  document.getElementById("totalCount").textContent = issues.length;
  document.getElementById("pendingCount").textContent = issues.filter(i => i.status === "Pending").length;
  document.getElementById("progressCount").textContent = issues.filter(i => i.status === "In Progress").length;
  document.getElementById("resolvedCount").textContent = issues.filter(i => i.status === "Resolved").length;
  document.getElementById("reportCount").textContent = `${issues.length} report${issues.length === 1 ? "" : "s"}`;
}

function renderIssues() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const filtered = allIssues.filter(issue => {
    const matchesText = [issue.title, issue.category, issue.location, issue.description].join(" ").toLowerCase().includes(query);
    return matchesText && (status === "All" || issue.status === status);
  });

  if (!filtered.length) {
    issuesList.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><strong>No matching reports</strong><span>Try another search or submit a new community report.</span></div>`;
  } else {
    issuesList.innerHTML = filtered.map(issue => {
      const statusClass = issue.status.replace(/\s+/g, "-");
      const date = new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      return `<article class="issue-card">
        <div class="issue-top"><div><h3 class="issue-title">${escapeHTML(issue.title)}</h3><div class="issue-meta"><span>⌖ ${escapeHTML(issue.location)}</span><span>· ${escapeHTML(issue.category)}</span></div></div><span class="status ${statusClass}">${escapeHTML(issue.status)}</span></div>
        <p class="issue-desc">${escapeHTML(issue.description)}</p>
        <div class="issue-bottom"><span class="issue-date">Reported ${date}</span>
        <label class="sr-only" for="status-${escapeHTML(issue.id)}">Update status for ${escapeHTML(issue.title)}</label>
        <select class="status-control" id="status-${escapeHTML(issue.id)}" data-id="${escapeHTML(issue.id)}" aria-label="Update status"><option ${issue.status==="Pending"?"selected":""}>Pending</option><option ${issue.status==="In Progress"?"selected":""}>In Progress</option><option ${issue.status==="Resolved"?"selected":""}>Resolved</option></select></div>
      </article>`;
    }).join("");
  }
  document.getElementById("listSummary").textContent = `Showing ${filtered.length} of ${allIssues.length} reports`;
}

async function loadIssues() {
  issuesList.innerHTML = `<div class="loading-state"><span class="spinner"></span> Loading community reports...</div>`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("The server could not load reports.");
    const data = await response.json();
    allIssues = data.issues || [];
    updateDashboard(allIssues);
    renderIssues();
  } catch (error) {
    issuesList.innerHTML = `<div class="empty-state"><strong>Unable to connect to the server</strong><span>${escapeHTML(error.message)} Check that the backend is running, then refresh.</span></div>`;
    document.getElementById("listSummary").textContent = "Server connection failed";
    updateDashboard([]);
  }
}

function validateForm(values) {
  let valid = true;
  const checks = [
    ["title", values.title.trim().length >= 4, "Enter a title with at least 4 characters."],
    ["category", Boolean(values.category), "Choose a category."],
    ["location", values.location.trim().length >= 3, "Enter a valid location."],
    ["description", values.description.trim().length >= 10, "Description must contain at least 10 characters."]
  ];
  checks.forEach(([name, ok, message]) => {
    document.getElementById(`${name}Error`).textContent = ok ? "" : message;
    if (!ok) valid = false;
  });
  return valid;
}

form.addEventListener("submit", async event => {
  event.preventDefault(); // Prevent page reload; JavaScript handles submission.
  const values = {
    title: document.getElementById("title").value,
    category: document.getElementById("category").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value
  };
  if (!validateForm(values)) {
    showMessage("Please correct the highlighted fields.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Submitting…</span><span class="spinner"></span>`;
  showMessage("", "");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not submit the report.");
    form.reset();
    document.getElementById("charCount").textContent = "0 / 500";
    showMessage("Your report was submitted successfully!", "success");
    await loadIssues();
    document.getElementById("issues").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showMessage(`${error.message} Please try again.`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Submit report</span><span>→</span>`;
  }
});

document.getElementById("description").addEventListener("input", event => {
  document.getElementById("charCount").textContent = `${event.target.value.length} / 500`;
});
["searchInput", "statusFilter"].forEach(id => document.getElementById(id).addEventListener("input", renderIssues));
document.getElementById("refreshBtn").addEventListener("click", loadIssues);

issuesList.addEventListener("change", async event => {
  const select = event.target.closest(".status-control");
  if (!select) return;
  select.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(select.dataset.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: select.value })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not update status.");
    await loadIssues();
  } catch (error) {
    alert(error.message);
    await loadIssues();
  }
});

loadIssues();