"use client";

import { useCallback, useRef, useState } from "react";
import { parseCsvForPreview, CsvPreview } from "../lib/csvParser";
import { importCsvFile } from "../api/apiServices";
import { ImportResult, ImportStage } from "../lib/types";

interface UseCsvImportState {
  stage: ImportStage;
  file: File | null;
  preview: CsvPreview | null;
  result: ImportResult | null;
  errorMessage: string | null;
}

const STAGE_MESSAGES = [
  "Uploading your file",
  "Reading CSV structure",
  "Mapping columns with AI",
  "Validating CRM fields",
  "Wrapping up",
];

export function useCsvImport() {
  const [state, setState] = useState<UseCsvImportState>({
    stage: "idle",
    file: null,
    preview: null,
    result: null,
    errorMessage: null,
  });
  const [processingStep, setProcessingStep] = useState(0);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectFile = useCallback(async (file: File) => {
    setState((s) => ({ ...s, errorMessage: null }));
    try {
      const preview = await parseCsvForPreview(file);
      setState({ stage: "preview", file, preview, result: null, errorMessage: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        stage: "error",
        errorMessage: err instanceof Error ? err.message : "Could not read this CSV file.",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    setProcessingStep(0);
    setState({ stage: "idle", file: null, preview: null, result: null, errorMessage: null });
  }, []);

  const confirmImport = useCallback(async () => {
    if (!state.file) return;

    setState((s) => ({ ...s, stage: "processing", errorMessage: null }));
    setProcessingStep(0);

    stepTimer.current = setInterval(() => {
      setProcessingStep((step) => Math.min(step + 1, STAGE_MESSAGES.length - 1));
    }, 1400);

    try {
      const response = await importCsvFile(state.file);
      if (stepTimer.current) clearInterval(stepTimer.current);
      
      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Something went wrong while processing your file. Please try again.");
      }
      
      setState((s) => ({ ...s, stage: "done", result: response.data || null }));
    } catch (err) {
      if (stepTimer.current) clearInterval(stepTimer.current);
      const message = err instanceof Error ? err.message : "Something went wrong while processing your file. Please try again.";
      setState((s) => ({ ...s, stage: "error", errorMessage: message }));
    }
  }, [state.file]);

  return {
    ...state,
    processingLabel: STAGE_MESSAGES[processingStep],
    selectFile,
    confirmImport,
    reset,
  };
}
