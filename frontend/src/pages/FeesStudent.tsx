import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function FeesStudent() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees/my')
      .then(res => {
        setFees(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p className="text-gray-500">Loading fee details...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fee Details</h1>
      
      <div className="space-y-6">
        {fees.length > 0 ? fees.map(f => {
          const outstanding = f.total_amount - f.paid_amount;
          const percentPaid = Math.round((f.paid_amount / f.total_amount) * 100) || 0;
          return (
            <div key={f.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Semester Fee</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800">${f.total_amount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-700">${f.paid_amount.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg border ${outstanding > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-sm mb-1 ${outstanding > 0 ? 'text-red-600' : 'text-gray-500'}`}>Outstanding</p>
                  <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-red-700' : 'text-gray-800'}`}>${outstanding.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Payment Progress</span>
                  <span className="font-medium text-gray-700">{percentPaid}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${percentPaid}%` }}></div>
                </div>
              </div>
              
              {f.due_date && (
                <p className="mt-4 text-sm text-gray-500">
                  Due Date: <span className="font-medium">{new Date(f.due_date).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          );
        }) : (
          <p className="text-gray-500">No fee records found.</p>
        )}
      </div>
    </div>
  );
}
