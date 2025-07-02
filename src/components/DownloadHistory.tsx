import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, Clock, CheckCircle2 } from 'lucide-react';

interface DownloadRecord {
  id: string;
  filename: string;
  fileType: 'pptx' | 'docx' | 'xlsx';
  downloadedAt: string;
  downloadUrl: string;
  status: 'completed' | 'expired';
}

const DownloadHistory: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    // Simulate fetching download history
    const mockDownloads: DownloadRecord[] = [
      {
        id: '1',
        filename: 'Q4-Financial-Report.xlsx',
        fileType: 'xlsx',
        downloadedAt: '2024-01-15T15:30:00Z',
        downloadUrl: 'https://secure-app.com/download/abc123xyz',
        status: 'completed'
      },
      {
        id: '2',
        filename: 'Company-Presentation.pptx',
        fileType: 'pptx',
        downloadedAt: '2024-01-14T11:20:00Z',
        downloadUrl: 'https://secure-app.com/download/def456uvw',
        status: 'expired'
      },
      {
        id: '3',
        filename: 'Policy-Document.docx',
        fileType: 'docx',
        downloadedAt: '2024-01-13T09:15:00Z',
        downloadUrl: 'https://secure-app.com/download/ghi789rst',
        status: 'completed'
      },
      {
        id: '4',
        filename: 'Budget-Analysis.xlsx',
        fileType: 'xlsx',
        downloadedAt: '2024-01-12T14:45:00Z',
        downloadUrl: 'https://secure-app.com/download/jkl012mno',
        status: 'expired'
      }
    ];
    setDownloads(mockDownloads);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Download History</h3>
            <p className="text-sm text-blue-700 mt-1">
              Track your file downloads and access secure URLs. Note that download URLs expire after 24 hours for security.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secure URL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {downloads.map((download) => (
                <tr key={download.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{download.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(download.fileType)}`}>
                      {download.fileType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(download.downloadedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(download.status)}`}>
                      {download.status === 'completed' ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        'Expired'
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded break-all">
                        {download.downloadUrl}
                      </code>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {downloads.length === 0 && (
          <div className="text-center py-12">
            <Download className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No downloads yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your download history will appear here after you download files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadHistory;