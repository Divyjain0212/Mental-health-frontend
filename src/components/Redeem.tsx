import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Voucher {
  _id: string;
  title: string;
  description: string;
  pointsCost: number;
  code: string;
  stock: number;
}

const Redeem: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/vouchers')
      .then(res => setVouchers(res.data))
      .catch(() => setVouchers([]));
  }, []);

  const redeem = async (id: string) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/vouchers/redeem', { voucherId: id });
      setMessage(`Redeemed! Code: ${data.redemption.code}. Remaining points: ${data.remainingPoints}`);
      setVouchers(prev => prev.map(v => v._id === id ? { ...v, stock: v.stock - 1 } : v));
    } catch (e: any) {
      setMessage(e?.response?.data?.message || 'Failed to redeem');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Redeem Vouchers</h2>
        {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">{message}</div>}
        <div className="space-y-4">
          {vouchers.map(v => (
            <div key={v._id} className="bg-white/80 backdrop-blur border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <div className="font-semibold">{v.title}</div>
                <div className="text-sm text-gray-600">{v.description}</div>
                <div className="text-sm mt-1">Cost: <span className="font-medium">{v.pointsCost} points</span></div>
                <div className="text-xs text-gray-500">Stock: {v.stock}</div>
              </div>
              <button disabled={v.stock <= 0} onClick={() => redeem(v._id)} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Redeem</button>
            </div>
          ))}
          {vouchers.length === 0 && (
            <div className="text-sm text-gray-500">No vouchers available.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Redeem;


