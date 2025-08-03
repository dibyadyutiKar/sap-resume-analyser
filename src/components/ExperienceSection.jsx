import React from "react";

export default function ExperienceSection({ title, data, onDetail }) {
  if (!data) return null;

  // Unwrap if data = { "SAP TM": {...} }
  const theData =
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.keys(data).length === 1 &&
    data["SAP TM"]
      ? data["SAP TM"]
      : data;

  // Helper: check if an object or array is fully empty
  const isCompletelyEmpty = (entry) => {
    if (!entry) return true;
    if (Array.isArray(entry)) return entry.length === 0;
    if (typeof entry === "object") {
      return Object.values(entry).every(
        (v) =>
          v == null ||
          (Array.isArray(v) && v.length === 0) ||
          (typeof v === "object" && Object.keys(v).length === 0)
      );
    }
    return false;
  };

  const entries = Array.isArray(theData)
    ? [["", theData]]
    : Object.entries(theData);

  // Remove categories where all entries are empty
  const filteredEntries = entries
    .map(([category, items]) => {
      if (!Array.isArray(items)) return null;
      const filteredItems = items.filter((item) => !isCompletelyEmpty(item));
      return filteredItems.length > 0 ? [category, filteredItems] : null;
    })
    .filter(Boolean);

  if (filteredEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600">No {title.toLowerCase()} found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      {filteredEntries.map(([category, items], i) => (
        <div key={category || i} className="mb-6">
          {category && (
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {category}
            </h3>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:shadow"
                onClick={() => onDetail(item)}
              >
                <h4 className="font-medium text-gray-800 mb-1">
                  {item.task || item.with_module || "Untitled"}
                </h4>

                <div className="text-sm text-gray-600 space-y-1">
                  {item.summary && (
                    <p>
                      <strong>Summary:</strong> {item.summary}
                    </p>
                  )}
                  {item.supporting_resume_text && (
                    <p>
                      <strong>Supporting Text:</strong>{" "}
                      {item.supporting_resume_text}
                    </p>
                  )}
                  {item.direction && (
                    <p>
                      <strong>Direction:</strong> {item.direction}
                    </p>
                  )}
                  {item.interface_type && (
                    <p>
                      <strong>Interface Type:</strong> {item.interface_type}
                    </p>
                  )}
                  {Array.isArray(item.integration_methodologies) && (
                    <p>
                      <strong>Methodologies:</strong>{" "}
                      {item.integration_methodologies.join(", ")}
                    </p>
                  )}
                  {Array.isArray(item.integration_technologies) && (
                    <p>
                      <strong>Technologies:</strong>{" "}
                      {item.integration_technologies.join(", ")}
                    </p>
                  )}
                  {item.confidence_level && (
                    <p>
                      <strong>Confidence Level:</strong> {item.confidence_level}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
