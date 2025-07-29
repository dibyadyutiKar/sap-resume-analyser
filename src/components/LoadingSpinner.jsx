import React from "react";

const LoadingSpinner = ({
  phaseName,
  status,
  error,
  currentPhase,
  totalPhases,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "started":
        return (
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        );
      case "completed":
        return <span className="text-green-600 text-xs font-bold">✓</span>;
      case "error":
        return <span className="text-red-600 text-xs font-bold">✗</span>;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "started":
        return "bg-blue-50 border-blue-200";
      case "completed":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "started":
        return `Analyzing: ${phaseName}...`;
      case "completed":
        return `✅ Completed: ${phaseName}`;
      case "error":
        return `❌ Failed: ${phaseName}`;
      default:
        return `⏳ Pending: ${phaseName}`;
    }
  };

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor()}`}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white">
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <span
          className={`text-sm font-medium ${
            status === "error"
              ? "text-red-700"
              : status === "completed"
              ? "text-green-700"
              : status === "started"
              ? "text-blue-700"
              : "text-gray-700"
          }`}
        >
          {getStatusText()}
        </span>
        {status === "started" && (
          <div className="text-xs text-blue-600 mt-1">
            Phase {currentPhase} of {totalPhases}
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
