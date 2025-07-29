import React from "react";

const TagModal = ({ tag, onClose }) => {
  if (!tag) return null;

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Tag Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tag Name
            </label>
            <p className="mt-1 text-gray-800 font-mono bg-gray-50 p-2 rounded">
              {tag.tag}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              SAP Activate Task Reference
            </label>
            <p className="mt-1 text-gray-800 bg-blue-50 p-2 rounded">
              {tag.SAP_Activate_Task_Reference}
            </p>
          </div>

          {tag.SAP_Activate_Deliverable_Reference && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                SAP Activate Deliverable Reference
              </label>
              <p className="mt-1 text-gray-800 bg-blue-50 p-2 rounded">
                {tag.SAP_Activate_Deliverable_Reference}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">
              Supporting Resume Text
            </label>
            <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded italic">
              "{tag.supporting_resume_text}"
            </p>
          </div>

          {tag.summary && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Summary
              </label>
              <p className="mt-1 text-gray-800 bg-green-50 p-2 rounded">
                {tag.summary}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">
              Confidence Score
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                  tag.confidence_score || 0
                )}`}
              >
                {((tag.confidence_score || 0) * 100).toFixed(0)}%
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(tag.confidence_score || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
