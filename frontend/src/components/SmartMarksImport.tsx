import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UploadCloud, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SmartMarksImport() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessmentId, setAssessmentId] = useState('INTERNAL_1');
  const [source, setSource] = useState('CSV_IMPORT');
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const [step, setStep] = useState(1);
  const [importResult, setImportResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file || !selectedSubject) return;
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/smart/marks/import/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setParsedData(res.data.extracted_rows);
      
      // Basic validation to show preview
      const preview = res.data.extracted_rows.map((row: any) => {
        const markVal = parseFloat(row.mark);
        const valid = !isNaN(markVal) && markVal >= 0 && markVal <= 100; // max score assumed 100
        return {
          ...row,
          status: valid ? 'Valid' : 'Invalid',
          issue: valid ? '' : 'Invalid mark format'
        };
      });
      setPreviewData(preview);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Error parsing file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const payload = {
        subject_id: parseInt(selectedSubject),
        assessment_id: assessmentId,
        file_name: file?.name || 'unknown',
        source: source,
        rows: previewData
      };
      
      const res = await api.post('/smart/marks/import/confirm', payload);
      setImportResult(res.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Error confirming import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Smart Marks Import</h2>
        <div className="flex gap-2 items-center text-sm font-medium">
          <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>1. Upload</span>
          <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>2. Preview</span>
          <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>3. Result</span>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={assessmentId}
                  onChange={e => setAssessmentId(e.target.value)}
                >
                  <option value="INTERNAL_1">Internal 1</option>
                  <option value="INTERNAL_2">Internal 2</option>
                  <option value="SEMESTER">Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source Type</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                >
                  <option value="CSV_IMPORT">CSV / Excel</option>
                  <option value="PDF_IMPORT">PDF Document</option>
                  <option value="IMAGE_OCR">Image (OCR)</option>
                  <option value="GOOGLE_SHEET">Google Sheet</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
              />
              <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
              <p className="text-gray-700 font-medium mb-1">
                {file ? file.name : "Drag and drop your file here"}
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse from your computer
              </p>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleExtract}
                disabled={!file || !selectedSubject || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow hover:shadow-lg disabled:opacity-50 transition"
              >
                {isLoading ? "Extracting..." : "Extract Data"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Preview & Validate</h4>
                <p className="text-amber-700 text-sm">Review the extracted marks. The system will match students by Register Number. Unmatched students will be marked as Failed.</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 text-sm">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Register No</th>
                    <th className="py-3 px-4 font-semibold">Name (Extracted)</th>
                    <th className="py-3 px-4 font-semibold">Mark</th>
                    <th className="py-3 px-4 font-semibold">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {row.status === 'Valid' ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Valid</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-medium"><XCircle className="w-4 h-4" /> Invalid</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{row.register_number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{row.name}</td>
                      <td className="py-3 px-4 text-sm font-bold">{row.mark}</td>
                      <td className="py-3 px-4 text-sm text-red-500">{row.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Total records extracted: {previewData.length}</span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow hover:shadow-lg disabled:opacity-50 transition"
                >
                  {isLoading ? "Updating..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && importResult && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Import Successful</h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              Marks have been successfully imported and mapped to students. Analytics have been automatically updated.
            </p>
            
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{importResult.matched}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Matched</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">{importResult.updated}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{importResult.failed}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</div>
              </div>
            </div>

            <button 
              onClick={() => {
                setStep(1);
                setFile(null);
                setParsedData([]);
                setPreviewData([]);
                setImportResult(null);
              }}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Start New Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
