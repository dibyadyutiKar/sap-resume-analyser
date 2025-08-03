// services/apiService.js

import axios from "axios";
import {
  PHASE_APIS,
  API_RESPONSE_KEYS,
  EXPERIENCE_APIS, // ← import this
} from "../utils/constants";

const apiClient = axios.create({ timeout: 30000 });
const ongoingCalls = new Set();

// ——— Analyze one SAP phase ———
export const analyzePDFForPhase = async (file, phaseName) => {
  const callId = `${phaseName}-${file.name}-${file.size}`;
  if (ongoingCalls.has(callId)) {
    throw new Error(`${phaseName} analysis already in progress`);
  }
  ongoingCalls.add(callId);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const resp = await apiClient.post(PHASE_APIS[phaseName], formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = resp.data;

    // look for nested key
    for (const key of API_RESPONSE_KEYS[phaseName] || [phaseName]) {
      if (data[key]) return data[key];
    }
    // fallback if any values are arrays
    if (Object.values(data).some((v) => Array.isArray(v))) {
      return data;
    }
    return {};
  } catch (err) {
    throw new Error(`Failed to analyze ${phaseName}: ${err.message}`);
  } finally {
    ongoingCalls.delete(callId);
  }
};

// ——— Analyze one experience section ———
export const analyzeExperience = async (file, expKey) => {
  const callId = `${expKey}-${file.name}-${file.size}`;
  if (ongoingCalls.has(callId)) {
    throw new Error(`${expKey} analysis already in progress`);
  }
  ongoingCalls.add(callId);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const resp = await apiClient.post(EXPERIENCE_APIS[expKey], formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data[expKey] ?? [];
  } catch (err) {
    throw new Error(`Failed to fetch ${expKey}: ${err.message}`);
  } finally {
    ongoingCalls.delete(callId);
  }
};

// ——— Orchestrate phases + experiences ———
export const analyzeAllPhasesAndExperiences = async (file, onUpdate) => {
  const phaseKeys = Object.keys(PHASE_APIS);
  const expKeys = Object.keys(EXPERIENCE_APIS);
  const allKeys = [...phaseKeys, ...expKeys];

  const results = {},
    errors = {};

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    onUpdate?.(key, null, null, "started");

    try {
      const data = phaseKeys.includes(key)
        ? await analyzePDFForPhase(file, key)
        : await analyzeExperience(file, key);

      results[key] = data;
      onUpdate?.(key, data, null, "completed");
    } catch (err) {
      results[key] = phaseKeys.includes(key) ? {} : [];
      errors[key] = err.message;
      onUpdate?.(key, results[key], err, "error");
    }

    if (i < allKeys.length - 1) {
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  return { results, errors };
};
