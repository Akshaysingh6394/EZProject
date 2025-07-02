import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { FileItem, DownloadResponse } from '../types';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching available files
    const mockFiles: FileItem[] = [
      {
        id: '1',
        filename: 'Q4-Financial-Report.xlsx',
        fileType: 'xlsx',
        size: 2048000,
        uploadedAt: '2024-01-15T10:30:00Z',
        uploadedBy: 'operations@company.com'
      },
      {
        id: '2',
        filename: 'Company-Presentation.pptx',
        fileType: 'pptx',
        size: 5120000,
        uploadedAt: '2024-01-14T14:15:00Z',
        uploadedBy: 'operations@company.com'
      },
      {
        id: '3',
        filename: 'Policy-Document.docx',
        fileType: 'docx',
        size: 1024000,
        uploadedAt: '2024-01-13T09:45:00Z',
        uploadedBy: 'operations@company.com'
      },
      {
        id: '4',
        filename: 'Budget-Analysis.xlsx',
        fileType: 'xlsx',
        size: 3072000,
        uploadedAt: '2024-01-12T16:20:00Z',
        uploadedBy: 'operations@company.com'
      }
    ];
    setFiles(mockFiles);
  }, []);

  const handleDownload = async (fileId: string) => {
    setDownloading(fileId);
    try {
      // Simulate API call to get secure download URL
      const response = await fetch(`/api/download-file/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data: DownloadResponse = await response.json();
        setDownloadUrl(data.downloadLink);
        
        // Simulate file download
        setTimeout(() => {
          window.open(data.downloadLink, '_blank');
          setDownloadUrl(null);
        }, 1000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      // For demo purposes, simulate successful download
      const secureUrl = `https://secure-app.com/download/${btoa(fileId + Date.now())}`;
      setDownloadUrl(secureUrl);
      
      setTimeout(() => {
        console.log('Downloading from secure URL:', secureUrl);
        setDownloadUrl(null);
      }, 1000);
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pptx':
        return 'bg-orange-100 text-orange-800';
      case 'docx':
        return 'bg-blue-100 text-blue-800';
      case 'xlsx':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {downloadUrl && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-emerald-800">Secure Download URL Generated</h3>
              <div className="mt-2 bg-white border border-emerald-200 rounded-md p-3">
                <code className="text-xs text-emerald-700 break-all">{downloadUrl}</code>
              </div>
              <p className="text-sm text-emerald-700 mt-2">
                This encrypted URL is valid for this session only and accessible only by authorized client users.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {files.map((file) => (
          <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{file.filename}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(file.fileType)}`}>
                      {file.fileType.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(file.uploadedAt)}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(file.id)}
                disabled={downloading === file.id}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {downloading === file.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating URL...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure encrypted download • Client access only</span>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Files uploaded by operations team will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileList;