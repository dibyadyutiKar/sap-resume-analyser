// Updated App.jsx to pass uploadedFileName to PhaseCards
import React, { useState, useCallback, useRef } from "react";
import { CheckCircle } from "lucide-react";
import FileUpload from "./components/FileUpload";
import PhaseCards from "./components/PhaseCards";
import PhaseDetails from "./components/PhaseDetails";
import TagModal from "./components/TagModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { analyzeAllPhases } from "./services/apiService";
import { PHASE_NAMES } from "./utils/constants";

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [analysisProgress, setAnalysisProgress] = useState({});
  const [analysisErrors, setAnalysisErrors] = useState({});

  // Track the current analysis to prevent multiple concurrent analyses
  const currentAnalysisRef = useRef(null);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisComplete(false);
      setExtractedData({});
      setAnalysisProgress({});
      setAnalysisErrors({});
      // Clear any previous analysis reference
      currentAnalysisRef.current = null;
    }
  }, []);

  const analyzeResume = useCallback(async () => {
    if (!uploadedFile) {
      console.warn("No file uploaded");
      return;
    }

    // Prevent multiple concurrent analyses
    if (isAnalyzing) {
      console.warn("Analysis already in progress, ignoring duplicate request");
      return;
    }

    // Create unique analysis ID
    const analysisId = `${uploadedFile.name}-${
      uploadedFile.size
    }-${Date.now()}`;
    currentAnalysisRef.current = analysisId;

    console.log(`🎯 Starting new analysis: ${analysisId}`);

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setSelectedPhase(null);

    // Initialize progress tracking for sequential processing
    const initialProgress = {};
    PHASE_NAMES.forEach((phase) => {
      initialProgress[phase] = { status: "pending", error: null };
    });
    setAnalysisProgress(initialProgress);

    try {
      // Track API calls for this analysis
      let apiCallCount = 0;

      const { results, errors } = await analyzeAllPhases(
        uploadedFile,
        (phaseName, result, error, status) => {
          // Verify this callback belongs to the current analysis
          if (currentAnalysisRef.current !== analysisId) {
            console.warn(
              `Ignoring callback for outdated analysis: ${phaseName}`
            );
            return;
          }

          console.log(
            `Phase update for ${analysisId}: ${phaseName} - ${status}`,
            { result, error }
          );

          // Count API calls
          if (status === "started") {
            apiCallCount++;
            console.log(`📊 API Call #${apiCallCount} started: ${phaseName}`);
          }

          // Update progress for each phase change
          setAnalysisProgress((prev) => ({
            ...prev,
            [phaseName]: {
              status: status || (error ? "error" : "completed"),
              error: error?.message || null,
            },
          }));

          // Update extracted data when phase completes successfully
          if (status === "completed" && result) {
            setExtractedData((prev) => {
              const updated = { ...prev, [phaseName]: result };
              console.log(`Updated extracted data for ${phaseName}:`, updated);
              return updated;
            });
          }
        }
      );

      // Verify this is still the current analysis before updating state
      if (currentAnalysisRef.current !== analysisId) {
        console.warn(`Analysis ${analysisId} was superseded, ignoring results`);
        return;
      }

      console.log(`✅ Analysis ${analysisId} completed:`, { results, errors });
      console.log(
        `📊 Total API calls made: ${apiCallCount} (should equal ${PHASE_NAMES.length})`
      );

      setExtractedData(results);
      setAnalysisErrors(errors);
      setAnalysisComplete(true);

      // Show completion message
      const successCount = Object.keys(results).filter(
        (phase) => results[phase] && Object.keys(results[phase]).length > 0
      ).length;

      console.log(
        `🎉 Analysis ${analysisId} completed: ${successCount}/${PHASE_NAMES.length} phases successful`
      );
    } catch (error) {
      // Verify this is still the current analysis
      if (currentAnalysisRef.current !== analysisId) {
        console.warn(`Analysis ${analysisId} was superseded, ignoring error`);
        return;
      }

      console.error(`❌ Analysis ${analysisId} failed:`, error);
      setAnalysisErrors({ general: error.message });
    } finally {
      // Only update loading state if this is still the current analysis
      if (currentAnalysisRef.current === analysisId) {
        setIsAnalyzing(false);
        console.log(`🏁 Analysis ${analysisId} finalized`);
      }
    }
  }, [uploadedFile, isAnalyzing]);

  // Additional safeguard: Disable analyze button during analysis
  const canAnalyze = uploadedFile && !isAnalyzing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SAP Resume Project Analyzer
          </h1>
          <p className="text-gray-600">
            Upload your SAP resume to extract across 6 project phases
          </p>
          {/* {isAnalyzing && (
            <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-700 text-sm font-medium">
                ⚡ Analysis in progress - Each phase will be called exactly once
              </p>
              <p className="text-blue-600 text-xs mt-1">
                File: {uploadedFile?.name} | Analysis ID:{" "}
                {currentAnalysisRef.current?.split("-").pop()}
              </p>
            </div>
          )} */}
        </div>

        {/* Upload Section */}
        {!analysisComplete && (
          <FileUpload
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onAnalyze={analyzeResume}
            isAnalyzing={isAnalyzing}
            canAnalyze={canAnalyze}
          />
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Analyzing Resume...
                </h2>
                {/* <p className="text-sm text-gray-600">
                  Processing phases sequentially - 1 API call per phase
                </p> */}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>
                  {
                    Object.values(analysisProgress).filter(
                      (p) => p.status === "completed" || p.status === "error"
                    ).length
                  }{" "}
                  / {PHASE_NAMES.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (Object.values(analysisProgress).filter(
                        (p) => p.status === "completed" || p.status === "error"
                      ).length /
                        PHASE_NAMES.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* API Call Counter */}
            {/* <div className="mb-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                📊 API Calls:{" "}
                {
                  Object.values(analysisProgress).filter(
                    (p) =>
                      p.status === "started" ||
                      p.status === "completed" ||
                      p.status === "error"
                  ).length
                }{" "}
                / {PHASE_NAMES.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ✅ Each phase is called exactly once with no retries
              </p>
            </div> */}

            {/* Individual Phase Progress */}
            <div className="space-y-3">
              {PHASE_NAMES.map((phaseName, index) => (
                <LoadingSpinner
                  key={phaseName}
                  phaseName={phaseName}
                  status={analysisProgress[phaseName]?.status || "pending"}
                  error={analysisProgress[phaseName]?.error}
                  currentPhase={index + 1}
                  totalPhases={PHASE_NAMES.length}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Analysis Complete
                  </h2>
                  <p className="text-gray-600">Resume: {uploadedFile?.name}</p>
                  {/* <p className="text-green-600 text-sm mt-1">
                    ✅ Total API calls made: {PHASE_NAMES.length} (1 per phase)
                  </p> */}
                  {Object.keys(analysisErrors).length > 0 && (
                    <p className="text-yellow-600 text-sm mt-1">
                      ⚠️ Some phases had errors - check individual phase results
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phase Cards with Export */}
            <PhaseCards
              extractedData={extractedData}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPhase={selectedPhase}
              onPhaseSelect={setSelectedPhase}
              analysisProgress={analysisProgress}
              uploadedFileName={uploadedFile?.name}
            />

            {/* Phase Details */}
            <PhaseDetails
              extractedData={extractedData}
              selectedPhase={selectedPhase}
              onTagSelect={setSelectedTag}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* Tag Detail Modal */}
        <TagModal tag={selectedTag} onClose={() => setSelectedTag(null)} />
      </div>
    </div>
  );
}

export default App;
