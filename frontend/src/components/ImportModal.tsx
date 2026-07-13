"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { parseCsvForPreview, CsvPreview } from "../lib/csvParser";
import Papa from "papaparse";
import { Button } from "./ui/Button";
import { ResultsTable } from "./ResultsTable";
import { importCsvFile } from "../lib/api";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (stats: { totalImported: number; totalSkipped: number; totalRows: number }) => void;
}

const MAX_SIZE_MB = 5;

const STAGES = [
  "Uploading your CSV file...",
  "Reading CSV structure...",
  "Extracting CRM fields with OpenRouter AI...",
  "Validating records & applying CRM rules...",
  "Saving imported leads to PostgreSQL database..."
];

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [processingLabel, setProcessingLabel] = useState("Uploading file...");
  const [importStats, setImportStats] = useState<{
    totalImported: number;
    totalSkipped: number;
    totalRows: number;
    durationMs: number;
    importedRecords: any[];
    skippedRecords: any[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onDrop = useCallback(async (accepted: File[]) => {
    setError(null);
    const selectedFile = accepted[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is larger than ${MAX_SIZE_MB}MB.`);
      return;
    }

    try {
      const parsedPreview = await parseCsvForPreview(selectedFile);
      setFile(selectedFile);
      setPreview(parsedPreview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this CSV file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setImportStats(null);
  };

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description\n" +
      "2026-06-01 10:00:00,Rahil Mohammad,rahil@test.com,91,9579290000,GrowEasy,Mumbai,Maharashtra,India,VK Owner,GOOD_LEAD_FOLLOW_UP,Wants site visit,leads_on_demand,2026,Interested in 3BHK\n" +
      "2026-06-02 11:30:00,Tarvinder Pal,tarvinderpal@beauty.com,91,9811360000,,Delhi,Delhi,India,,Not Dialed,Called twice,sarjapur_plots,,";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "groweasy_crm_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setCurrentStageIndex(0);

    try {
      const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        });
      });

      const allRows = parseResult.data;
      const CHUNK_SIZE = 20;
      const chunks = [];
      
      for (let i = 0; i < allRows.length; i += CHUNK_SIZE) {
        chunks.push(allRows.slice(i, i + CHUNK_SIZE));
      }

      if (chunks.length === 0) {
        throw new Error("CSV file is empty or has no valid rows.");
      }

      const aggregatedStats = {
        totalImported: 0,
        totalSkipped: 0,
        totalRows: 0,
        durationMs: 0,
        importedRecords: [] as any[],
        skippedRecords: [] as any[],
      };

      for (let i = 0; i < chunks.length; i++) {
        setCurrentStageIndex(Math.min(3, Math.floor((i / chunks.length) * 4)));
        
        const chunkCsv = Papa.unparse(chunks[i]);
        const chunkFile = new File([chunkCsv], `chunk-${i}-${file.name}`, { type: "text/csv" });
        
        const response = await importCsvFile(chunkFile);

        if (!response.success || !response.data) {
          throw new Error(response.error ?? `Failed to import chunk ${i + 1}`);
        }

        const stats = response.data;
        aggregatedStats.totalImported += stats.totalImported;
        aggregatedStats.totalSkipped += stats.totalSkipped;
        aggregatedStats.totalRows += stats.totalRows;
        aggregatedStats.durationMs += stats.durationMs;
        aggregatedStats.importedRecords.push(...(stats.importedRecords || []));
        aggregatedStats.skippedRecords.push(...(stats.skippedRecords || []));
      }
      
      setCurrentStageIndex(4); 

      setImportStats(aggregatedStats);
      
      onImportComplete({
        totalImported: aggregatedStats.totalImported,
        totalSkipped: aggregatedStats.totalSkipped,
        totalRows: aggregatedStats.totalRows,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during file upload.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className={`relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full overflow-hidden flex flex-col max-h-[90vh] p-8 font-sans transition-all duration-300 ${
        importStats ? "max-w-5xl" : "max-w-2xl"
      }`}>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Import Leads via CSV</h2>
            <p className="text-sm text-slate-500 mt-1">Upload a CSV file to bulk import leads into your system.</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 min-h-[300px] flex flex-col justify-center">
          {isProcessing ? (
            <div className="text-center py-10 px-8 flex flex-col items-center justify-center animate-fade-in max-w-md mx-auto w-full">
              <Loader2 size={40} className="text-[#ff7b4b] animate-spin mb-4" />
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">AI Extraction Processing</h3>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6 mt-1 border border-slate-200/20 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-[#ff7b4b] h-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${((currentStageIndex + 1) / STAGES.length) * 100}%` }}
                />
              </div>

              <div className="w-full text-left space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                {STAGES.map((stageName, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {isCompleted ? (
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-[#ff7b4b] animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-250 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <span className={`${
                        isCompleted 
                          ? "text-slate-450 line-through decoration-slate-300 dark:decoration-slate-700" 
                          : isCurrent 
                            ? "text-slate-800 dark:text-slate-200 font-semibold" 
                            : "text-slate-400 dark:text-slate-650"
                      } transition-colors duration-200`}>
                        {stageName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : importStats ? (
            <div className="flex flex-col h-full overflow-hidden animate-fade-in flex-1">
              <div className="text-center pb-4 flex flex-col items-center justify-center">
                <CheckCircle size={44} className="text-emerald-500 mb-2" />
                <h3 className="font-bold text-slate-800 text-lg">Import Completed!</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Successfully processed CSV file with AI mapping.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5 max-w-md mx-auto w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Rows</span>
                  <span className="text-base font-bold text-slate-800 mt-0.5 block">{importStats.totalRows}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Imported</span>
                  <span className="text-base font-bold text-emerald-600 mt-0.5 block">{importStats.totalImported}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Skipped</span>
                  <span className="text-base font-bold text-rose-500 mt-0.5 block">{importStats.totalSkipped}</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden min-h-[260px] flex flex-col">
                <h4 className="font-bold text-slate-700 text-xs mb-2">Parsed Lead Results:</h4>
                <div className="flex-1 overflow-hidden">
                  <ResultsTable 
                    imported={importStats.importedRecords} 
                    skipped={importStats.skippedRecords} 
                  />
                </div>
              </div>
            </div>
          ) : !file ? (
            <div className="animate-fade-in">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isDragActive
                    ? "border-[#ff7b4b] bg-orange-50/20"
                    : "border-slate-200 bg-slate-50/50 hover:border-[#ff7b4b] hover:bg-orange-50/10"
                }`}
              >
                <input {...getInputProps()} />
                <div className="h-12 w-12 rounded-full bg-[#f0f9ff] text-[#0369a1] flex items-center justify-center mb-4">
                  <Upload size={22} />
                </div>
                <h4 className="font-semibold text-slate-800 text-base">Drop your CSV file here</h4>
                <p className="text-xs text-slate-400 mt-1">or click to browse files</p>
                <span className="mt-4 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full text-[10px] text-slate-500 font-semibold tracking-wide">
                  Supported file: .csv (max 5MB)
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mt-5 leading-relaxed text-center px-4">
                Required headers: created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note. Template includes default + custom CRM fields to reduce upload errors.
              </p>

              <div className="flex justify-center mt-5">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#ff7b4b] hover:text-[#ff7b4b] rounded-full text-xs font-semibold text-slate-600 bg-white transition-all shadow-sm"
                >
                  <Download size={13} />
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{file.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {(file.size / 1024).toFixed(2)} KB · {preview?.totalRows} rows detected
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 border border-slate-100 rounded-2xl overflow-hidden max-h-56 min-h-[160px] flex flex-col bg-white">
                <div className="overflow-auto scrollbar-thin flex-1 text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase sticky top-0 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        {preview?.headers.map((h) => (
                          <th key={h} className="px-4 py-2 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600">
                      {preview?.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 font-medium text-slate-400">{idx + 1}</td>
                          {preview?.headers.map((h) => (
                            <td key={h} className="px-4 py-2 max-w-[120px] truncate whitespace-nowrap">
                              {row[h] || <span className="text-slate-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 animate-fade-up">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isProcessing}
            className="px-6 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold py-2.5"
          >
            Cancel
          </Button>

          {importStats ? (
            <Button
              onClick={removeFile}
              className="bg-[#ff7b4b] hover:bg-[#ff6e40] text-white text-xs font-semibold px-8 py-2.5 rounded-full shadow-md"
            >
              Upload Another
            </Button>
          ) : (
            <Button
              disabled={!file || isProcessing}
              onClick={handleUpload}
              className={`text-white text-xs font-semibold px-8 py-2.5 rounded-full shadow-md ${
                !file 
                  ? "bg-[#ff7b4b]/50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#ff7b4b] to-[#ff5d2b] hover:from-[#ff8b5d] hover:to-[#ff6d3d] active:scale-[0.98]"
              }`}
            >
              Confirm & Import
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
