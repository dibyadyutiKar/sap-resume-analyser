import React from "react";
import { Upload, FileText } from "lucide-react";

const FileUpload = ({
  uploadedFile,
  onFileUpload,
  onAnalyze,
  isAnalyzing,
  canAnalyze = true,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="text-center">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700">
                  {uploadedFile ? uploadedFile.name : "Choose SAP Resume File"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={onFileUpload}
                  disabled={isAnalyzing}
                />
              </label>
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-center space-x-4">
                <FileText className="h-6 w-6 text-blue-500" />
                <span className="text-green-600 font-medium">
                  File uploaded successfully!
                </span>
              </div>
            )}

            <button
              onClick={onAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            {!uploadedFile && (
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
