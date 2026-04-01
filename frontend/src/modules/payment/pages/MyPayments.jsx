import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';

const API = 'http://localhost:5000/api/payments';

const MyPayments = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { user } = useAuth();
    const userId = user ? user.email : 'USER_123';

    useEffect(() => { 
        if (user) {
            fetchPayments(); 
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/user/${userId}`);
            setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDownloadInvoice = async (paymentId) => {
        try {
            const response = await axios.get(`${API}/${paymentId}/invoice/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire('Error', 'Failed to download invoice', 'error');
        }
    };

    if (loading) return <div className="p-10 text-center flex items-center justify-center text-gray-600"><RefreshCw className="animate-spin mr-2" /> Loading payments...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Payments</h1>
            <p className="text-gray-500 text-sm mb-6">View your payment history and download invoices</p>

            {data.length === 0 ? (
                <div className="bg-gray-50 p-10 rounded-xl text-center border border-gray-200">
                    <CreditCard className="mx-auto text-gray-300 mb-3" size={40} />
                    <h2 className="text-lg text-gray-600 mb-1">No payments found</h2>
                    <p className="text-gray-400 text-sm">Your payment history will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Invoice</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Description</th>
                                <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                                <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                                <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(({ payment, invoice }) => {
                                const statusColors = {
                                    paid: 'bg-green-100 text-green-700',
                                    pending: 'bg-yellow-100 text-yellow-700',
                                    failed: 'bg-red-100 text-red-700',
                                    refunded: 'bg-purple-100 text-purple-700'
                                };
                                const stColor = statusColors[payment.paymentStatus] || 'bg-gray-100 text-gray-600';

                                return (
                                    <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        {/* Invoice */}
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-gray-900 text-sm">{invoice?.invoiceNumber || '—'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Sandbox •••• {Math.floor(1000 + Math.random() * 9000)}</p>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 text-gray-600">
                                            {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>

                                        {/* Description */}
                                        <td className="px-5 py-4 text-gray-700 font-medium">
                                            {payment.bookingType === 'room' ? 'Room Booking' : 'Event Hall Booking'}
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.bookingType === 'room' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {payment.bookingType === 'room' ? 'Room' : 'Event'}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-4 text-right font-bold text-gray-900">
                                            Rs. {payment.totalAmount?.toLocaleString()}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${stColor}`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-center">
                                            {invoice ? (
                                                <button
                                                    onClick={() => handleDownloadInvoice(payment._id)}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs transition"
                                                    title="Download PDF Invoice"
                                                >
                                                    <Download size={14} /> Download
                                                </button>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyPayments;

