"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { cn } from "../lib/cn";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  errorMessage?: string | null;
}

const MAX_SIZE_MB = 5;

export function FileUpload({ onFileSelected, errorMessage }: FileUploadProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
      setLocalError(null);
      if (rejected.length > 0) {
        setLocalError(
          rejected[0].errors[0]?.code === "file-too-large"
            ? `File is larger than ${MAX_SIZE_MB}MB.`
            : "Please upload a valid .csv file."
        );
        return;
      }
      if (accepted[0]) onFileSelected(accepted[0]);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    accept: { "text/csv": [".csv"] },
  });

  const displayError = errorMessage ?? localError;

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-6 py-16 text-center transition-colors duration-200",
          isDragActive
            ? "border-brand-500 bg-brand-50"
            : "border-ink-300 bg-white hover:border-brand-400 hover:bg-brand-50/40"
        )}
      >
        <input {...getInputProps()} aria-label="Upload CSV file" />

        <div
          className={cn(
            "mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform duration-200",
            isDragActive && "scale-110 animate-pulse-ring"
          )}
        >
          {isDragActive ? <FileSpreadsheet size={28} /> : <UploadCloud size={28} />}
        </div>

        <p className="font-display text-lg font-semibold text-ink-900">
          {isDragActive ? "Drop it right here" : "Drag & drop your CSV file here"}
        </p>
        <p className="mt-1.5 text-sm text-ink-500">
          or <span className="font-medium text-brand-600 underline underline-offset-2">browse from your computer</span>
        </p>
        <p className="mt-5 text-xs uppercase tracking-wide text-ink-300">
          .csv only · max {MAX_SIZE_MB}MB · any column layout works
        </p>
      </div>

      {displayError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 animate-fade-up">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
