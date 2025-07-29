import axios from "axios";
import { PHASE_APIS, API_RESPONSE_KEYS } from "../utils/constants";

const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout
});

// Track ongoing API calls to prevent duplicates
const ongoingCalls = new Set();

export const analyzePDFForPhase = async (file, phaseName) => {
  // Create unique identifier for this specific call
  const callId = `${phaseName}-${file.name}-${file.size}`;

  // Prevent duplicate calls for the same file and phase
  if (ongoingCalls.has(callId)) {
    console.warn(`Duplicate API call prevented for ${phaseName}`);
    throw new Error(`Analysis for ${phaseName} is already in progress`);
  }

  // Mark this call as ongoing
  ongoingCalls.add(callId);

  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log(`🚀 API Call Starting: ${phaseName} (Call ID: ${callId})`);

    const response = await apiClient.post(PHASE_APIS[phaseName], formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`✅ API Call Completed: ${phaseName} (Call ID: ${callId})`);

    // Handle nested response structure
    const responseData = response.data;
    console.log(`API Response for ${phaseName}:`, responseData);

    // Get possible API response keys for this phase
    const possibleKeys = API_RESPONSE_KEYS[phaseName] || [phaseName];

    // Try to find the correct key in the response
    for (const key of possibleKeys) {
      if (responseData[key]) {
        console.log(`Found data for ${phaseName} under key: ${key}`);
        return responseData[key];
      }
    }

    // If no nested structure found, check if response data itself is the categories
    if (typeof responseData === "object" && responseData !== null) {
      // Check if this looks like categories (has arrays as values)
      const values = Object.values(responseData);
      const hasArrayValues = values.some((value) => Array.isArray(value));

      if (hasArrayValues) {
        console.log(`Using direct response data for ${phaseName}`);
        return responseData;
      }
    }

    // Fallback: return empty object if no valid structure found
    console.warn(
      `No valid structure found for ${phaseName}, returning empty object`
    );
    return {};
  } catch (error) {
    console.error(
      `❌ API Call Failed: ${phaseName} (Call ID: ${callId})`,
      error
    );
    throw new Error(
      `Failed to analyze ${phaseName}: ${
        error.response?.data?.message || error.message
      }`
    );
  } finally {
    // Always remove the call from ongoing set
    ongoingCalls.delete(callId);
    console.log(`🧹 Cleaned up call: ${phaseName} (Call ID: ${callId})`);
  }
};

export const analyzeAllPhases = async (file, onPhaseComplete) => {
  // Additional safeguard: Check if any calls are already ongoing for this file
  const fileId = `${file.name}-${file.size}`;
  const ongoingForFile = Array.from(ongoingCalls).filter((id) =>
    id.includes(fileId)
  );

  if (ongoingForFile.length > 0) {
    console.warn(`Analysis already in progress for file: ${file.name}`);
    throw new Error(`Analysis is already in progress for this file`);
  }

  const results = {};
  const errors = {};
  const phaseNames = Object.keys(PHASE_APIS);

  console.log(
    `🎯 Starting sequential analysis for ${phaseNames.length} phases`
  );

  // Process phases sequentially (one after another)
  for (let i = 0; i < phaseNames.length; i++) {
    const phaseName = phaseNames[i];

    try {
      console.log(
        `📊 [${i + 1}/${phaseNames.length}] Processing: ${phaseName}`
      );

      // Notify that this phase is starting
      onPhaseComplete?.(phaseName, null, null, "started");

      // Single API call per phase - this is the only place where the API is called
      const result = await analyzePDFForPhase(file, phaseName);

      console.log(
        `✅ [${i + 1}/${phaseNames.length}] Completed: ${phaseName}`,
        result
      );

      results[phaseName] = result;

      // Notify that this phase is complete with results
      onPhaseComplete?.(phaseName, result, null, "completed");

      // Track successful API calls for debugging
      console.log(`📈 Token usage: 1 API call completed for ${phaseName}`);
    } catch (error) {
      console.error(
        `❌ [${i + 1}/${phaseNames.length}] Error in ${phaseName}:`,
        error
      );

      errors[phaseName] = error.message;
      results[phaseName] = {}; // Empty result for failed phase

      // Notify that this phase failed
      onPhaseComplete?.(phaseName, {}, error, "error");

      // Log failed API call for debugging
      console.log(`⚠️ Token usage: 1 API call failed for ${phaseName}`);
    }

    // Small delay between API calls to avoid overwhelming the server
    // This also helps prevent any potential race conditions
    if (i < phaseNames.length - 1) {
      console.log(`⏳ Waiting 500ms before next API call...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Final summary
  const successfulCalls = Object.keys(results).filter(
    (phase) => results[phase] && Object.keys(results[phase]).length > 0
  ).length;

  console.log(
    `🏁 Analysis completed: ${successfulCalls}/${phaseNames.length} phases successful`
  );
  console.log(
    `📊 Total API calls made: ${phaseNames.length} (1 per phase, no retries)`
  );

  return { results, errors };
};
