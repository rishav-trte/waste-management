'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Building2, Users, Tags, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSummary(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an Excel or CSV file');
      return;
    }

    setUploading(true);
    setSummary(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/excel-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Excel records processed successfully!');
        setSummary(data.summary);
        setFile(null);
      } else {
        toast.error(data.error || 'Failed to import Excel file');
      }
    } catch (err) {
      toast.error('An error occurred during file upload');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Owner Name,Address,Property Type,Phone,Price,Latitude,Longitude\n' +
      'Ramesh Kumar,House #10, Sector 12,Residential,+91 9876543210,150,28.6139,77.2090\n' +
      'Bikanervala Sweets,Shop 44, Main Market,Commercial,+91 9876543211,500,28.6250,77.2180\n' +
      'City General Hospital,Ring Road Ph-2,Institutional,+91 9876543212,400,28.5678,77.2433\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'waste_management_sample_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-indigo-500" /> Excel Bulk Data Importer
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Sub-Admin tool to populate properties, property category tariffs, and user accounts via spreadsheet upload.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100/20 hover:bg-blue-300/30 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-xl transition-all"
        >
          <Download className="w-4 h-4 text-blue-400" /> Download Sample CSV Template
        </button>
      </div>

      {/* Upload Card */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <form onSubmit={handleUpload} className="space-y-5">
          <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-all bg-gray-50 dark:bg-gray-50 dark:bg-slate-950/50">
            <input
              type="file"
              id="excel-file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="excel-file" className="cursor-pointer space-y-3 block">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {file ? file.name : 'Click to select Excel (.xlsx, .csv) file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Supports Property listings, pricing rules, and user rosters.</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-white disabled:text-gray-500 dark:disabled:text-slate-500 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Parsing Spreadsheet...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Start Bulk Import & Populate Records
              </>
            )}
          </button>
        </form>

        {/* Results Summary */}
        {summary && (
          <div className="p-5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Import Process Completed Successfully!
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                <Building2 className="w-4 h-4 text-emerald-400 mx-auto" />
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">{summary.propertiesCreated}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase">Properties</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                <Tags className="w-4 h-4 text-emerald-400 mx-auto" />
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">{summary.propertyTypesCreated}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase">Property Categories</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                <Users className="w-4 h-4 text-emerald-400 mx-auto" />
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">{summary.usersCreated}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase">User Accounts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
