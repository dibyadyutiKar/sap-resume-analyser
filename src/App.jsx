import React, { useState, useCallback, useRef } from "react";
import { CheckCircle } from "lucide-react";
import FileUpload from "./components/FileUpload";
import PhaseCards from "./components/PhaseCards";
import PhaseDetails from "./components/PhaseDetails";
import TagModal from "./components/TagModal";
import LoadingSpinner from "./components/LoadingSpinner";
import ExperienceSection from "./components/ExperienceSection";
import { analyzeAllPhasesAndExperiences } from "./services/apiService";
import { PHASE_NAMES, EXPERIENCE_NAMES } from "./utils/constants";

const ALL_STEPS = [...PHASE_NAMES, ...EXPERIENCE_NAMES];

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

  const currentAnalysisRef = useRef(null);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    console.log("📂 handleFileUpload:", file);
    if (file) {
      setUploadedFile(file);
      setAnalysisComplete(false);
      setExtractedData({});
      setAnalysisProgress({});
      setAnalysisErrors({});
      currentAnalysisRef.current = null;
    }
  }, []);

  const analyzeResume = useCallback(async () => {
    console.log(
      "▶️ analyzeResume called. uploadedFile:",
      uploadedFile,
      "isAnalyzing:",
      isAnalyzing
    );
    if (!uploadedFile) {
      console.warn("❌ No file uploaded, aborting analysis");
      return;
    }
    if (isAnalyzing) {
      console.warn("⏹️ Already analyzing, aborting duplicate");
      return;
    }

    const analysisId = `${uploadedFile.name}-${
      uploadedFile.size
    }-${Date.now()}`;
    currentAnalysisRef.current = analysisId;

    console.log("🔍 Starting analysis flow, analysisId=", analysisId);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setSelectedPhase(null);
    setAnalysisProgress(
      ALL_STEPS.reduce(
        (acc, key) => ({ ...acc, [key]: { status: "pending", error: null } }),
        {}
      )
    );

    try {
      const { results, errors } = await analyzeAllPhasesAndExperiences(
        uploadedFile,
        (key, result, error, status) => {
          console.log(`↪️ onProgress: ${key} → ${status}`, { error, result });
          if (currentAnalysisRef.current !== analysisId) return;
          setAnalysisProgress((prev) => ({
            ...prev,
            [key]: { status, error: error?.message || null },
          }));
          if (status === "completed") {
            setExtractedData((prev) => ({ ...prev, [key]: result }));
          }
        }
      );

      console.log("✅ analyzeAllPhasesAndExperiences resolved", {
        results,
        errors,
      });
      if (currentAnalysisRef.current === analysisId) {
        setExtractedData(results);
        setAnalysisErrors(errors);
        setAnalysisComplete(true);
      }
    } catch (err) {
      console.error("❌ analyzeAllPhasesAndExperiences threw", err);
      if (currentAnalysisRef.current === analysisId) {
        setAnalysisErrors({ general: err.message });
      }
    } finally {
      console.log("🏁 analysis flow complete, cleaning up loading state");
      if (currentAnalysisRef.current === analysisId) {
        setIsAnalyzing(false);
      }
    }
  }, [uploadedFile, isAnalyzing]);

  const canAnalyze = Boolean(uploadedFile) && !isAnalyzing;

  // Filter out experience data for PhaseCards - only show phase data
  const phaseOnlyData = Object.fromEntries(
    Object.entries(extractedData).filter(
      ([key]) =>
        ![
          "business_process_experience",
          "wricef_development_experience",
          "integration_experience",
        ].includes(key)
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SAP Resume Project Analyzer
          </h1>
          <p className="text-gray-600">
            Upload your SAP resume to extract across project phases and
            experiences
          </p>
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
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">
                Analyzing Resume...
              </h2>
            </div>

            {/* progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>
                  {
                    Object.values(analysisProgress).filter(
                      (p) => p.status === "completed" || p.status === "error"
                    ).length
                  }{" "}
                  / {ALL_STEPS.length} completed
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
                        ALL_STEPS.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* per-step spinners */}
            <div className="space-y-2">
              {ALL_STEPS.map((step) => (
                <LoadingSpinner
                  key={step}
                  phaseName={step}
                  status={analysisProgress[step]?.status || "pending"}
                  error={analysisProgress[step]?.error}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 h-8 w-8 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Analysis Complete
                </h2>
              </div>
              <p className="text-gray-600 mt-2">File: {uploadedFile.name}</p>
              {Object.keys(analysisErrors).length > 0 && (
                <p className="text-yellow-600 mt-2">
                  ⚠️ Some steps had errors—check individual results
                </p>
              )}
            </div>

            {/* Phase Cards - Only show phase data, not experience data */}
            <PhaseCards
              extractedData={phaseOnlyData}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPhase={selectedPhase}
              onPhaseSelect={setSelectedPhase}
              analysisProgress={analysisProgress}
              uploadedFileName={uploadedFile.name}
            />

            <PhaseDetails
              extractedData={phaseOnlyData}
              selectedPhase={selectedPhase}
              onTagSelect={setSelectedTag}
              searchTerm={searchTerm}
            />

            {/* Experience Sections - Only show these dedicated sections */}
            <ExperienceSection
              title="Business Process Experience"
              data={extractedData.business_process_experience?.["SAP TM"]}
              onDetail={setSelectedTag}
            />
            <ExperienceSection
              title="WRICEF Development Experience"
              data={extractedData.wricef_development_experience?.["SAP TM"]}
              onDetail={setSelectedTag}
            />
            <ExperienceSection
              title="Integration Experience"
              data={extractedData.integration_experience}
              onDetail={setSelectedTag}
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
