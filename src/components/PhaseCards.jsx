import React, { useState } from "react";
import {
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";
import {
  exportToJSON,
  exportToCSV,
  exportToExcel,
  exportSummaryReport,
} from "../utils/exportUtils";

const PhaseCards = ({
  extractedData,
  searchTerm,
  onSearchChange,
  selectedPhase,
  onPhaseSelect,
  analysisProgress,
  uploadedFileName,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getTagCount = (phase) => {
    if (!phase || typeof phase !== "object") return 0;
    return Object.values(phase).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0);
    }, 0);
  };

  const filteredPhases = Object.entries(extractedData).filter(
    ([phaseName, phaseData]) => {
      if (!searchTerm) return true;
      const phaseMatches = phaseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatches = Object.keys(phaseData || {}).some((category) =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const tagMatches = Object.values(phaseData || {}).some(
        (category) =>
          Array.isArray(category) &&
          category.some(
            (tag) =>
              tag.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tag.supporting_resume_text
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
      );
      return phaseMatches || categoryMatches || tagMatches;
    }
  );

  const handleExport = (format) => {
    const baseFilename = uploadedFileName
      ? uploadedFileName.replace(/\.[^/.]+$/, "") // Remove extension
      : "sap-resume-analysis";

    try {
      switch (format) {
        case "json":
          exportToJSON(extractedData, baseFilename);
          break;
        case "csv":
          exportToCSV(extractedData, baseFilename);
          break;
        case "excel":
          exportToExcel(extractedData, baseFilename);
          break;
        case "summary":
          exportSummaryReport(extractedData, uploadedFileName, baseFilename);
          break;
        default:
          console.error("Unknown export format:", format);
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const getTotalStats = () => {
    const totalTags = Object.values(extractedData).reduce(
      (total, phaseData) => {
        return total + getTagCount(phaseData);
      },
      0
    );

    const totalCategories = Object.values(extractedData).reduce(
      (total, phaseData) => {
        return total + Object.keys(phaseData || {}).length;
      },
      0
    );

    return { totalTags, totalCategories };
  };

  const { totalTags, totalCategories } = getTotalStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalTags} tags extracted across {totalCategories} categories in{" "}
            {Object.keys(extractedData).length} phases
          </p>
        </div>

        <div className="relative">
          <button
            // onClick={() => setShowExportMenu(!showExportMenu)}
            onClick={() => handleExport("summary")}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={Object.keys(extractedData).length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export Reports</span>
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                  Export Options
                </div>

                <button
                  onClick={() => handleExport("summary")}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-800">
                      Summary Report
                    </div>
                    <div className="text-xs text-gray-500">
                      Text file with overview & statistics
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("excel")}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-800">
                      Excel Spreadsheet
                    </div>
                    <div className="text-xs text-gray-500">
                      Formatted table (.xls format)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("csv")}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <File className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-medium text-gray-800">CSV File</div>
                    <div className="text-xs text-gray-500">
                      Comma-separated values
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("json")}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <File className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-800">JSON Data</div>
                    <div className="text-xs text-gray-500">
                      Raw structured data
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search phases, categories, or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Export Instructions */}
      {Object.keys(extractedData).length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-gray-600 text-sm text-center">
            No analysis results to export. Please analyze a resume first.
          </p>
        </div>
      )}

      {/* Phase Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(extractedData).map(([phaseName, phaseData]) => {
          const progress = analysisProgress[phaseName];
          const isAnalyzing = progress && progress.status === "started";
          const hasError = progress && progress.status === "error";
          const isCompleted = progress && progress.status === "completed";

          return (
            <div
              key={phaseName}
              onClick={() =>
                onPhaseSelect(selectedPhase === phaseName ? null : phaseName)
              }
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                selectedPhase === phaseName
                  ? "bg-blue-100 border-blue-300"
                  : hasError
                  ? "bg-red-50 border-red-200"
                  : isAnalyzing
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {phaseName}
                </h3>
                {isAnalyzing && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {hasError && <span className="text-red-500 text-xs">❌</span>}
                {isCompleted && !hasError && (
                  <span className="text-green-500 text-xs">✅</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {Object.keys(phaseData || {}).length} categories
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasError
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {hasError ? "Error" : `${getTagCount(phaseData)} tags`}
                </span>
              </div>
              {hasError && (
                <p className="text-xs text-red-600 mt-2">{progress.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowExportMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default PhaseCards;
