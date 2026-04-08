"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, ChevronRight, AlertCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import api from "@/lib/api";

type ColumnInfo = {
  name: string;
  dtype: string;
  unique_count: number;
};

export default function AuditPage() {
  const router = useRouter();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [errorMSG, setErrorMSG] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [favorableLabel, setFavorableLabel] = useState<string>("1");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFileAPI = async (selectedFile: File) => {
    const isCSV = selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv");
    const isExcel = selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || selectedFile.name.endsWith(".xlsx");
    if (!isCSV && !isExcel) {
      setErrorMSG("Please upload a valid CSV or Excel (.xlsx) file.");
      setFile(null);
      setPreviewData([]);
      return;
    }
    setErrorMSG("");
    setFile(selectedFile);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await api.post("/upload", formData);
      
      setFileId(response.data.file_id);
      setColumns(response.data.columns);
      
      // Convert preview array of dicts to string[][]
      if (response.data.preview && response.data.preview.length > 0) {
        const header = Object.keys(response.data.preview[0]);
        const rows = response.data.preview.map((row: any) => 
          header.map(key => String(row[key]))
        );
        setPreviewData([header, ...rows]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMSG(err.response?.data?.detail || "Failed to upload and process the file.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileAPI(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFileAPI(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileId(null);
    setPreviewData([]);
    setColumns([]);
    setSelectedAttributes([]);
    setTargetColumn("");
  };

  const toggleAttribute = (attr: string) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr));
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!fileId) {
      setErrorMSG("Please upload a dataset first.");
      return;
    }
    if (!targetColumn) {
      setErrorMSG("Please select a target column for the model.");
      return;
    }
    if (selectedAttributes.length === 0) {
      setErrorMSG("Please select at least one sensitive attribute.");
      return;
    }
    
    setErrorMSG("");
    setIsAnalyzing(true);
    
    try {
      const payload = {
        file_id: fileId,
        target_column: targetColumn,
        sensitive_attributes: selectedAttributes,
        favorable_label: favorableLabel || "1"
      };
      const response = await api.post("/analyze-bias", payload);
      const reportId = response.data.report_id;
      router.push(`/results?reportId=${reportId}`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMSG("The analysis is taking longer than expected due to dataset size. Please try again or use a smaller sample.");
      } else {
        setErrorMSG(err.response?.data?.detail || "Failed to analyze bias. The process might have timed out or failed.");
      }
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col pt-24">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Start Bias Audit</h1>
        <p className="text-gray-400">Upload your dataset and select the attributes you want to test for fairness.</p>
      </div>

      {errorMSG && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{errorMSG}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Upload Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)] text-xs text-white">1</span>
              Upload Dataset
            </h2>
            
            <div 
              className={clsx(
                "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all relative overflow-hidden",
                dragActive ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--panel-border)] bg-black/20 hover:border-gray-500",
                file ? "border-[var(--success)]/50" : ""
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input type="file" id="fileDownload" className="hidden" accept=".csv,.xlsx" onChange={handleChange} disabled={isUploading || isAnalyzing} />
              
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-[var(--primary)]">
                     <Loader2 className="w-10 h-10 animate-spin mb-3" />
                     <p className="text-sm font-medium">Processing File...</p>
                  </motion.div>
                ) : file ? (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                    <CheckCircle2 className="w-12 h-12 text-[var(--success)] mb-3" />
                    <p className="text-white font-medium break-all">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB • Tabular Format</p>
                    <button onClick={clearFile} disabled={isAnalyzing} className="mt-4 text-xs text-gray-400 hover:text-white flex items-center gap-1 disabled:opacity-50">
                      <X className="w-3 h-3"/> Remove File
                    </button>
                  </motion.div>
                ) : (
                  <motion.label key="upload" htmlFor="fileDownload" className="flex flex-col items-center text-center cursor-pointer w-full h-full justify-center">
                    <UploadCloud className={clsx("w-12 h-12 mb-4 transition-colors", dragActive ? "text-[var(--primary)]" : "text-gray-500")} />
                    <p className="text-sm font-medium text-white mb-1">Drag and drop your file here</p>
                    <p className="text-xs text-gray-500">or click to browse (CSV or Excel format)</p>
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            {/* Preview Section */}
            {previewData.length > 0 && (
              <div className="mt-6 border border-[var(--panel-border)] rounded-lg overflow-hidden bg-black/40">
                <div className="bg-white/5 py-2 px-4 border-b border-[var(--panel-border)] text-xs font-semibold text-gray-400">
                  Data Preview (First few rows)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b border-[var(--panel-border)]/50 last:border-0 hover:bg-white/5">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={clsx("px-3 py-2", idx === 0 ? "font-bold text-gray-200" : "text-gray-400")}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-white">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)] text-xs text-white">2</span>
              Configure Analysis
            </h2>
            <p className="text-xs text-gray-400 mb-6">Select the target variable and sensitive attributes for auditing.</p>

            {columns.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500 border border-dashed border-[var(--panel-border)] rounded-lg p-6 text-center">
                Upload a dataset to configure the analysis.
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {/* Target Column */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Target Variable</label>
                  <select 
                    value={targetColumn} 
                    onChange={e => setTargetColumn(e.target.value)}
                    className="w-full bg-black/50 border border-[var(--panel-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="" disabled>Select the column to predict...</option>
                    {columns.map(col => (
                      <option key={`target-${col.name}`} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>

                {/* Favorable Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Favorable Outcome Label</label>
                  <input 
                    type="text" 
                    value={favorableLabel}
                    onChange={e => setFavorableLabel(e.target.value)}
                    placeholder="e.g. 1 or >50K"
                    className="w-full bg-black/50 border border-[var(--panel-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Specify which value in the target variable corresponds to the "favorable" (positive) outcome.</p>
                </div>

                {/* Sensitive Attributes */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">Sensitive Attributes</label>
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {columns.filter(col => col.name !== targetColumn).map(col => {
                      const isSelected = selectedAttributes.includes(col.name);
                      return (
                        <button
                          key={`sensitive-${col.name}`}
                          onClick={() => toggleAttribute(col.name)}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                            isSelected 
                              ? "bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)] shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
                              : "bg-black/30 border-[var(--panel-border)] text-gray-400 hover:text-white hover:border-gray-500"
                          )}
                        >
                          {col.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--panel-border)] flex items-center justify-between">
               <div className="text-sm text-gray-400">
                 <span className="text-white font-semibold">{selectedAttributes.length}</span> attributes selected
               </div>
               <button 
                 onClick={handleStartAnalysis}
                 disabled={isAnalyzing || !fileId || selectedAttributes.length === 0 || !targetColumn}
                 className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                 {isAnalyzing ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Model...</>
                 ) : (
                   <>Begin Audit <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                 )}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
