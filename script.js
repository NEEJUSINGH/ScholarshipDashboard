let scholarships = [];
let filteredScholarships = [];

async function loadCSV() {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRxek53OQeO0xbFzldCCahGQQZMEdQtZtnB0hbrAmhB791iTNrGn_XTv7vEgsBdsa9ros7Pm6fSv8Sh/pub?output=csv";

  const response = await fetch(SHEET_URL + "&v=" + Date.now());
  const text = await response.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true
  });

  scholarships = parsed.data;
  filteredScholarships = scholarships;
  renderScholarships();
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  filteredScholarships = scholarships.filter(item => {
    const searchableText = `
      ${item.ScholarshipTitle || ""}
      ${item.Provider || ""}
      ${item.Tags || ""}
      ${item.EligibilityCriteria || ""}
    `.toLowerCase();

    const matchesSearch = !search || searchableText.includes(search);
    const matchesStatus = !status || (item.Status || "").includes(status);

    let matchesDate = true;
    if (fromDate || toDate) {
      const deadline = item.ApplicationDeadline ? new Date(item.ApplicationDeadline) : null;
      if (!deadline || isNaN(deadline)) return false;

      if (fromDate && deadline < new Date(fromDate)) matchesDate = false;
      if (toDate && deadline > new Date(toDate)) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  renderScholarships();
}

function renderScholarships() {
  const list = document.getElementById("scholarshipList");
  const count = document.getElementById("resultCount");

  count.textContent = `${filteredScholarships.length} scholarship(s) found`;
  list.innerHTML = "";

  filteredScholarships.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${item.ScholarshipTitle || "Untitled Scholarship"}</h2>
      <p class="meta"><strong>Provider:</strong> ${item.Provider || "N/A"}</p>
      <p class="meta"><strong>Award:</strong> ${item.AwardAmount || "N/A"}</p>
      <p class="meta"><strong>Deadline:</strong> ${item.ApplicationDeadline || "N/A"}</p>
      <p class="meta"><strong>Status:</strong> ${item.Status || "N/A"}</p>
      <p class="tags"><strong>Tags:</strong> ${item.Tags || "N/A"}</p>
      <a class="apply-btn" href="${item.ApplicationLink}" target="_blank">Apply Now</a>
    `;

    list.appendChild(card);
  });
}

function downloadResults() {
  const headers = [
    "ScholarshipTitle",
    "Provider",
    "AwardAmount",
    "ApplicationWindow",
    "ApplicationDeadline",
    "ApplicationLink",
    "Tags",
    "Status",
    "LastVerified",
    "EligibilityCriteria"
  ];

  const csvRows = [headers.join(",")];

  filteredScholarships.forEach(item => {
    const row = headers.map(header => {
      const value = item[header] || "";
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "filtered-scholarships.csv";
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("statusFilter").addEventListener("change", applyFilters);
document.getElementById("fromDate").addEventListener("change", applyFilters);
document.getElementById("toDate").addEventListener("change", applyFilters);

document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "";
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  filteredScholarships = scholarships;
  renderScholarships();
});

document.getElementById("downloadBtn").addEventListener("click", downloadResults);

loadCSV();
