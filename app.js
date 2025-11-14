// ============================================
// DATA MANAGEMENT
// ============================================

function getHustles() {
  const data = localStorage.getItem("hustles");
  return data ? JSON.parse(data) : [];
}

function getEntries() {
  const data = localStorage.getItem("entries");
  return data ? JSON.parse(data) : [];
}

function saveHustles(hustles) {
  localStorage.setItem("hustles", JSON.stringify(hustles));
}

function saveEntries(entries) {
  localStorage.setItem("entries", JSON.stringify(entries));
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// ============================================
// ADD HUSTLE
// ============================================

document.getElementById("addHustleBtn").addEventListener("click", function () {
  openModal("addHustleModal");
});

document
  .getElementById("addHustleForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("hustleName").value;
    const category = document.getElementById("hustleCategory").value;
    const color = document.querySelector(
      'input[name="hustleColor"]:checked'
    ).value;

    const newHustle = {
      id: Date.now(),
      name,
      category,
      color,
      createdAt: new Date().toISOString(),
    };

    const hustles = getHustles();
    hustles.push(newHustle);
    saveHustles(hustles);

    document.getElementById("addHustleForm").reset();
    closeModal("addHustleModal");
    displayHustles();
    updateDashboardStats();
  });

// ============================================
// LOG ENTRY
// ============================================

function openLogEntryModal(hustleId) {
  document.getElementById("entryHustleId").value = hustleId;
  document.getElementById("entryDate").value = new Date()
    .toISOString()
    .split("T")[0];
  openModal("logEntryModal");
}

document
  .getElementById("logEntryForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const hustleId = parseInt(document.getElementById("entryHustleId").value);
    const date = document.getElementById("entryDate").value;
    const hours = parseFloat(document.getElementById("entryHours").value);
    const earned = parseFloat(document.getElementById("entryEarned").value);
    const notes = document.getElementById("entryNotes").value;

    const newEntry = {
      id: Date.now(),
      hustleId,
      date,
      hours,
      earned,
      notes,
    };

    const entries = getEntries();
    entries.push(newEntry);
    saveEntries(entries);

    document.getElementById("logEntryForm").reset();
    closeModal("logEntryModal");
    displayHustles();
    updateDashboardStats();
  });

// ============================================
// DISPLAY HUSTLES
// ============================================

function displayHustles() {
  const hustles = getHustles();
  const hustlesGrid = document.getElementById("hustlesGrid");
  const emptyState = document.getElementById("emptyState");

  if (hustles.length === 0) {
    hustlesGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  hustlesGrid.innerHTML = "";

  hustles.forEach((hustle) => {
    const stats = calculateHustleStats(hustle.id);
    const card = createHustleCard(hustle, stats);
    hustlesGrid.appendChild(card);
  });
}

function createHustleCard(hustle, stats) {
  const card = document.createElement("div");
  card.className = "hustle-card";
  card.style.borderLeftColor = getColorCode(hustle.color);

  card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800">${hustle.name}</h3>
                <p class="text-sm text-gray-500">${hustle.category}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background-color: ${getColorCode(
              hustle.color
            )}20; color: ${getColorCode(hustle.color)}">
                ${stats.entries} entries
            </span>
        </div>
        
        <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
                <p class="text-xs text-gray-500">Earned</p>
                <p class="text-lg font-bold text-gray-800">Ksh ${stats.totalEarned.toFixed(
                  2
                )}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500">Hours</p>
                <p class="text-lg font-bold text-gray-800">${stats.totalHours.toFixed(
                  1
                )}h</p>
            </div>
            <div>
                <p class="text-xs text-gray-500">Ksh/Hour</p>
                <p class="text-lg font-bold text-gray-800">Ksh ${stats.hourlyRate.toFixed(
                  2
                )}</p>
            </div>
        </div>
        
        <div class="flex gap-2">
            <button onclick="openLogEntryModal(${
              hustle.id
            })" class="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition duration-200">
                + Log Entry
            </button>
            <button onclick="openHustleDetails(${
              hustle.id
            })" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition duration-200">
                View Details
            </button>
        </div>
    `;

  return card;
}

// ============================================
// CALCULATE STATS
// ============================================

function calculateHustleStats(hustleId) {
  const entries = getEntries().filter((entry) => entry.hustleId === hustleId);

  let totalEarned = 0;
  let totalHours = 0;

  entries.forEach((entry) => {
    totalEarned += entry.earned;
    totalHours += entry.hours;
  });

  const hourlyRate = totalHours > 0 ? totalEarned / totalHours : 0;

  return {
    entries: entries.length,
    totalEarned,
    totalHours,
    hourlyRate,
  };
}

function updateDashboardStats() {
  const hustles = getHustles();
  const entries = getEntries();

  let totalEarned = 0;
  let totalHours = 0;

  entries.forEach((entry) => {
    totalEarned += entry.earned;
    totalHours += entry.hours;
  });

  const avgRate = totalHours > 0 ? totalEarned / totalHours : 0;

  // Update dashboard with proper formatting
  document.getElementById("totalEarned").textContent =
    "Ksh " + totalEarned.toFixed(2);
  document.getElementById("totalHours").textContent =
    totalHours.toFixed(1) + "h";
  document.getElementById("avgRate").textContent = "Ksh " + avgRate.toFixed(2);
  document.getElementById("activeHustles").textContent = hustles.length;

  showTopPerformer();
}

function showTopPerformer() {
  const hustles = getHustles();
  const topPerformerDiv = document.getElementById("topPerformer");

  if (hustles.length === 0) {
    topPerformerDiv.classList.add("hidden");
    return;
  }

  let topHustle = null;
  let topRate = 0;

  hustles.forEach((hustle) => {
    const stats = calculateHustleStats(hustle.id);
    if (stats.hourlyRate > topRate && stats.entries > 0) {
      topRate = stats.hourlyRate;
      topHustle = hustle;
    }
  });

  if (topHustle) {
    topPerformerDiv.classList.remove("hidden");
    document.getElementById("topPerformerText").textContent = `${
      topHustle.name
    } is your best performer at Ksh ${topRate.toFixed(2)}/hour!`;
  } else {
    topPerformerDiv.classList.add("hidden");
  }
}

// ============================================
// HUSTLE DETAILS
// ============================================

function openHustleDetails(hustleId) {
  const hustles = getHustles();
  const hustle = hustles.find((h) => h.id === hustleId);
  if (!hustle) return;

  const stats = calculateHustleStats(hustleId);
  const entries = getEntries().filter((e) => e.hustleId === hustleId);

  document.getElementById("detailsHustleName").textContent = hustle.name;
  document.getElementById("detailsEarned").textContent =
    "Ksh " + stats.totalEarned.toFixed(2);
  document.getElementById("detailsHours").textContent =
    stats.totalHours.toFixed(1) + "h";
  document.getElementById("detailsRate").textContent =
    "Ksh " + stats.hourlyRate.toFixed(2);

  const entriesList = document.getElementById("entriesList");
  entriesList.innerHTML = "";

  if (entries.length === 0) {
    entriesList.innerHTML =
      '<p class="text-gray-500 text-center py-4">No entries yet</p>';
  } else {
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    entries.forEach((entry) => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "entry-item";
      entryDiv.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-gray-800">${new Date(
                      entry.date
                    ).toLocaleDateString()}</span>
                    <span class="text-sm font-semibold text-green-600">Ksh ${entry.earned.toFixed(
                      2
                    )}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                    <span>${entry.hours}h worked</span>
                    <span>Ksh ${(entry.earned / entry.hours).toFixed(
                      2
                    )}/hour</span>
                </div>
                ${
                  entry.notes
                    ? `<p class="text-sm text-gray-500 mt-2">${entry.notes}</p>`
                    : ""
                }
            `;
      entriesList.appendChild(entryDiv);
    });
  }

  const deleteBtn = document.getElementById("deleteHustleBtn");
  deleteBtn.onclick = function () {
    if (
      confirm(
        `Are you sure you want to delete "${hustle.name}"? This will also delete all its entries.`
      )
    ) {
      deleteHustle(hustleId);
    }
  };

  openModal("hustleDetailsModal");
}

// ============================================
// DELETE HUSTLE - BUG FIXED HERE
// ============================================

function deleteHustle(hustleId) {
  // Remove hustle
  let hustles = getHustles().filter((h) => h.id !== hustleId);
  saveHustles(hustles);

  // Remove all entries for this hustle
  let entries = getEntries().filter((e) => e.hustleId !== hustleId);
  saveEntries(entries);

  // Close modal
  closeModal("hustleDetailsModal");

  // Refresh display - THIS IS THE FIX
  displayHustles();
  updateDashboardStats(); // This will now properly reset to 0 when no hustles/entries exist
}

// ============================================
// CLEAR ALL DATA
// ============================================

document.getElementById("clearAllBtn").addEventListener("click", function () {
  if (
    confirm(
      "⚠️ WARNING: This will delete ALL your hustles and entries permanently. This cannot be undone!\n\nAre you sure you want to continue?"
    )
  ) {
    // Double confirmation for safety
    if (confirm("Final confirmation: Delete everything?")) {
      // Clear all data from localStorage
      localStorage.removeItem("hustles");
      localStorage.removeItem("entries");

      // Refresh the display
      displayHustles();
      updateDashboardStats();

      alert("✅ All data has been cleared!");
    }
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getColorCode(colorName) {
  const colors = {
    blue: "#3b82f6",
    green: "#10b981",
    purple: "#8b5cf6",
    pink: "#ec4899",
    orange: "#f97316",
    red: "#ef4444",
  };
  return colors[colorName] || colors.blue;
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  displayHustles();
  updateDashboardStats();
});

// ============================================
// EXPORT REPORT FEATURE
// ============================================

document
  .getElementById("exportReportBtn")
  .addEventListener("click", function () {
    generateReport();
  });

function generateReport() {
  const hustles = getHustles();
  const entries = getEntries();

  // Check if there's data to export
  if (hustles.length === 0) {
    alert("No data to export. Add some hustles first!");
    return;
  }

  // Calculate overall stats
  let totalEarned = 0;
  let totalHours = 0;

  entries.forEach((entry) => {
    totalEarned += entry.earned;
    totalHours += entry.hours;
  });

  const avgRate = totalHours > 0 ? totalEarned / totalHours : 0;

  // Build the report text
  let report = "";
  report += "═══════════════════════════════════════════════════\n";
  report += "            HUSTLEMETRICS REPORT\n";
  report += "═══════════════════════════════════════════════════\n";
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += "═══════════════════════════════════════════════════\n\n";

  // Overall Summary
  report += "📊 OVERALL SUMMARY\n";
  report += "───────────────────────────────────────────────────\n";
  report += `Total Hustles:        ${hustles.length}\n`;
  report += `Total Entries:        ${entries.length}\n`;
  report += `Total Earned:         KSh ${totalEarned.toFixed(2)}\n`;
  report += `Total Hours:          ${totalHours.toFixed(1)} hours\n`;
  report += `Average Rate:         KSh ${avgRate.toFixed(2)}/hour\n`;
  report += "\n\n";

  // Individual Hustle Breakdown
  report += "💼 HUSTLE BREAKDOWN\n";
  report += "═══════════════════════════════════════════════════\n\n";

  hustles.forEach((hustle, index) => {
    const stats = calculateHustleStats(hustle.id);
    const hustleEntries = entries.filter((e) => e.hustleId === hustle.id);

    report += `${index + 1}. ${hustle.name.toUpperCase()}\n`;
    report += `   Category: ${hustle.category}\n`;
    report += "   ───────────────────────────────────────────────\n";
    report += `   Total Earned:     KSh ${stats.totalEarned.toFixed(2)}\n`;
    report += `   Total Hours:      ${stats.totalHours.toFixed(1)} hours\n`;
    report += `   Hourly Rate:      KSh ${stats.hourlyRate.toFixed(2)}/hour\n`;
    report += `   Entries Logged:   ${stats.entries}\n`;

    // Show recent entries
    if (hustleEntries.length > 0) {
      report += "\n   Recent Entries:\n";
      hustleEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      hustleEntries.slice(0, 5).forEach((entry) => {
        const entryDate = new Date(entry.date).toLocaleDateString();
        const entryRate = (entry.earned / entry.hours).toFixed(2);
        report += `   • ${entryDate}: ${
          entry.hours
        }h, KSh ${entry.earned.toFixed(2)} (KSh ${entryRate}/hr)\n`;
        if (entry.notes) {
          report += `     Note: ${entry.notes}\n`;
        }
      });
    }

    report += "\n";
  });

  // Top Performer
  let topHustle = null;
  let topRate = 0;

  hustles.forEach((hustle) => {
    const stats = calculateHustleStats(hustle.id);
    if (stats.hourlyRate > topRate && stats.entries > 0) {
      topRate = stats.hourlyRate;
      topHustle = hustle;
    }
  });

  if (topHustle) {
    report += "🏆 TOP PERFORMER\n";
    report += "───────────────────────────────────────────────────\n";
    report += `${topHustle.name} is your best performer!\n`;
    report += `Earning you KSh ${topRate.toFixed(2)} per hour.\n\n`;
  }

  // Recommendations
  report += "💡 RECOMMENDATIONS\n";
  report += "───────────────────────────────────────────────────\n";

  if (topHustle) {
    report += `• Focus more time on "${topHustle.name}" - it has the\n`;
    report += `  highest ROI at KSh ${topRate.toFixed(2)}/hour\n`;
  }

  // Find lowest performer
  let lowestHustle = null;
  let lowestRate = Infinity;

  hustles.forEach((hustle) => {
    const stats = calculateHustleStats(hustle.id);
    if (stats.hourlyRate < lowestRate && stats.entries > 0) {
      lowestRate = stats.hourlyRate;
      lowestHustle = hustle;
    }
  });

  if (lowestHustle && hustles.length > 1) {
    report += `• Consider optimizing or reconsidering "${lowestHustle.name}"\n`;
    report += `  (currently KSh ${lowestRate.toFixed(2)}/hour)\n`;
  }

  report += "\n";
  report += "═══════════════════════════════════════════════════\n";
  report += "          Keep hustling smart! 💪\n";
  report += "═══════════════════════════════════════════════════\n";

  // Download the report
  downloadReport(report);
}

function downloadReport(reportText) {
  const blob = new Blob([reportText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
  link.download = `HustleMetrics_Report_${dateStr}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("✅ Report downloaded successfully!");
}
