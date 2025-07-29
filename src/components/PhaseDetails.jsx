import React from "react";
import { Eye } from "lucide-react";

const PhaseDetails = ({
  extractedData,
  selectedPhase,
  onTagSelect,
  searchTerm,
}) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const filteredPhases = Object.entries(extractedData).filter(([phaseName]) => {
    if (selectedPhase && selectedPhase !== phaseName) return false;
    if (!searchTerm) return true;

    const phaseData = extractedData[phaseName] || {};
    const phaseMatches = phaseName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatches = Object.keys(phaseData).some((category) =>
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const tagMatches = Object.values(phaseData).some(
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
  });

  return (
    <div className="space-y-6">
      {filteredPhases.map(([phaseName, phaseData]) => (
        <div key={phaseName} className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              {phaseName}
            </h2>

            <div className="space-y-6">
              {Object.entries(phaseData || {}).map(([categoryName, tags]) => (
                <div
                  key={categoryName}
                  className="border-l-4 border-blue-300 pl-6"
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-between">
                    {categoryName}
                    <span className="text-sm font-normal text-gray-500">
                      ({Array.isArray(tags) ? tags.length : 0} tags)
                    </span>
                  </h3>

                  {!Array.isArray(tags) || tags.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                      No tags extracted for this category
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onTagSelect(tag)}
                        >
                          {/* Summary first (if exists) - without label */}
                          {tag.summary && (
                            <p className="text-sm text-green-700 mb-3 font-medium bg-green-50 p-2 rounded">
                              {tag.summary}
                            </p>
                          )}

                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-800 font-mono text-sm">
                              {tag.tag}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                                  tag.confidence_score || 0
                                )}`}
                              >
                                {((tag.confidence_score || 0) * 100).toFixed(0)}
                                %
                              </span>
                              <Eye className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <p className="text-sm text-gray-600">
                              <strong>Task:</strong>{" "}
                              {tag.SAP_Activate_Task_Reference}
                            </p>

                            {tag.SAP_Activate_Deliverable_Reference && (
                              <p className="text-sm text-gray-600">
                                <strong>Deliverable:</strong>{" "}
                                {tag.SAP_Activate_Deliverable_Reference}
                              </p>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 italic line-clamp-2 bg-blue-50 p-2 rounded">
                            "{tag.supporting_resume_text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhaseDetails;
