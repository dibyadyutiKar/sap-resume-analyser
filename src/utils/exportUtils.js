// src/utils/exportUtils.js
export const exportToJSON = (data, filename = "sap-resume-analysis") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (
  extractedData,
  filename = "sap-resume-analysis"
) => {
  const csvRows = [];

  // Add header row
  csvRows.push([
    "Phase",
    "Category",
    "Tag",
    "SAP Activate Task Reference",
    "SAP Activate Deliverable Reference",
    "Supporting Resume Text",
    "Summary",
    "Confidence Score",
  ]);

  // Process each phase
  Object.entries(extractedData).forEach(([phaseName, phaseData]) => {
    Object.entries(phaseData || {}).forEach(([categoryName, tags]) => {
      if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach((tag) => {
          csvRows.push([
            phaseName,
            categoryName,
            tag.tag || "",
            tag.SAP_Activate_Task_Reference || "",
            tag.SAP_Activate_Deliverable_Reference || "",
            tag.supporting_resume_text || "",
            tag.summary || "",
            tag.confidence_score
              ? (tag.confidence_score * 100).toFixed(1) + "%"
              : "",
          ]);
        });
      } else {
        // Add row for empty category
        csvRows.push([
          phaseName,
          categoryName,
          "No tags extracted",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
    });
  });

  // Convert to CSV string
  const csvString = csvRows
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // Download CSV
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (
  extractedData,
  filename = "sap-resume-analysis"
) => {
  // Create HTML table format that Excel can read
  let htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .phase-header { background-color: #e6f3ff; font-weight: bold; }
          .category-header { background-color: #f0f8ff; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>SAP Resume Analysis Results</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Category</th>
              <th>Tag</th>
              <th>SAP Activate Task Reference</th>
              <th>SAP Activate Deliverable Reference</th>
              <th>Supporting Resume Text</th>
              <th>Summary</th>
              <th>Confidence Score</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Process each phase
  Object.entries(extractedData).forEach(([phaseName, phaseData]) => {
    Object.entries(phaseData || {}).forEach(([categoryName, tags]) => {
      if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach((tag) => {
          htmlContent += `
            <tr>
              <td class="phase-header">${phaseName}</td>
              <td class="category-header">${categoryName}</td>
              <td>${tag.tag || ""}</td>
              <td>${tag.SAP_Activate_Task_Reference || ""}</td>
              <td>${tag.SAP_Activate_Deliverable_Reference || ""}</td>
              <td>${tag.supporting_resume_text || ""}</td>
              <td>${tag.summary || ""}</td>
              <td>${
                tag.confidence_score
                  ? (tag.confidence_score * 100).toFixed(1) + "%"
                  : ""
              }</td>
            </tr>
          `;
        });
      } else {
        htmlContent += `
          <tr>
            <td class="phase-header">${phaseName}</td>
            <td class="category-header">${categoryName}</td>
            <td colspan="6" style="text-align: center; color: #666;">No tags extracted</td>
          </tr>
        `;
      }
    });
  });

  htmlContent += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Download as Excel file
  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSummaryReport = (
  extractedData,
  uploadedFileName,
  filename = "sap-resume-summary"
) => {
  // Calculate summary statistics
  const stats = {
    totalPhases: Object.keys(extractedData).length,
    totalCategories: 0,
    totalTags: 0,
    phaseBreakdown: {},
  };

  Object.entries(extractedData).forEach(([phaseName, phaseData]) => {
    const categories = Object.keys(phaseData || {});
    const tagCount = Object.values(phaseData || {}).reduce(
      (total, category) => {
        return total + (Array.isArray(category) ? category.length : 0);
      },
      0
    );

    stats.totalCategories += categories.length;
    stats.totalTags += tagCount;
    stats.phaseBreakdown[phaseName] = {
      categories: categories.length,
      tags: tagCount,
    };
  });

  const reportContent = `
SAP RESUME ANALYSIS SUMMARY REPORT
==================================

Resume File: ${uploadedFileName || "Unknown"}
Analysis Date: ${new Date().toLocaleString()}
Generated by: SAP Resume Tag Analyzer

OVERALL STATISTICS
------------------
• Total Phases Analyzed: ${stats.totalPhases}
• Total Categories Found: ${stats.totalCategories}
• Total Tags Extracted: ${stats.totalTags}
• Average Tags per Phase: ${(stats.totalTags / stats.totalPhases).toFixed(1)}

PHASE BREAKDOWN
---------------
${Object.entries(stats.phaseBreakdown)
  .map(
    ([phase, data]) =>
      `• ${phase}: ${data.tags} tags across ${data.categories} categories`
  )
  .join("\n")}

DETAILED PHASE ANALYSIS
=======================

${Object.entries(extractedData)
  .map(([phaseName, phaseData]) => {
    const categories = Object.entries(phaseData || {});
    return `
${phaseName.toUpperCase()}
${"=".repeat(phaseName.length)}

${
  categories.length === 0
    ? "No data extracted for this phase."
    : categories
        .map(([categoryName, tags]) => {
          const tagList = Array.isArray(tags) ? tags : [];
          return `
${categoryName} (${tagList.length} tags):
${
  tagList.length === 0
    ? "  - No tags extracted"
    : tagList
        .map(
          (tag) =>
            `  • ${tag.tag} (${((tag.confidence_score || 0) * 100).toFixed(
              0
            )}% confidence)`
        )
        .join("\n")
}`;
        })
        .join("\n")
}`;
  })
  .join("\n")}

END OF REPORT
=============
  `.trim();

  // Download as text file
  const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
