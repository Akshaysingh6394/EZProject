import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import UploadedFiles from '../components/UploadedFiles';

const OpsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Operations Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Manage file uploads and monitor system activity</p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'upload'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'files'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Uploaded Files</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'files' && <UploadedFiles />}
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;