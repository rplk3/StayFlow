import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, RotateCcw, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Search, Filter, Eye, Download, ShieldCheck } from 'lucide-react';

const API = 'http://localhost:5000/api/payments';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [searchText, setSearchText] = useState('');

    // Refunds
    const [activeTab, setActiveTab] = useState('payments'); // payments | refunds
    const [refunds, setRefunds] = useState([]);
    const [refundTotal, setRefundTotal] = useState(0);
    const [refundPage, setRefundPage] = useState(1);
    const [refundTotalPages, setRefundTotalPages] = useState(1);
    const [refundStatusFilter, setRefundStatusFilter] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => { if (activeTab === 'payments') fetchPayments(); else fetchRefunds(); }, [page, statusFilter, typeFilter, activeTab, refundPage, refundStatusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.bookingType = typeFilter;
            if (searchText) params.search = searchText;
            const res = await axios.get(`${API}/admin/all`, { params });
            setPayments(res.data.payments);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const params = { page: refundPage, limit: 15 };
            if (refundStatusFilter) params.status = refundStatusFilter;
            const res = await axios.get(`${API}/admin/refunds`, { params });
            setRefunds(res.data.refunds);
            setRefundTotal(res.data.total);
            setRefundTotalPages(res.data.totalPages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = () => { setPage(1); fetchPayments(); };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        try {
            await axios.put(`${API}/admin/${paymentId}/status`, { paymentStatus: newStatus });
            fetchPayments();
        } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
    };

    const handleVerify = async (paymentId) => {
        try {
            await axios.put(`${API}/admin/${paymentId}/verify`);
            fetchPayments();
        } catch (err) { alert(err.response?.data?.message || 'Failed to verify'); }
    };

    const handleGenerateInvoice = async (paymentId) => {
        try {
            await axios.post(`${API}/admin/${paymentId}/generate-invoice`);
            fetchPayments();
        } catch (err) { alert(err.response?.data?.message || 'Failed to generate invoice'); }
    };

    const handleRefundAction = async (refundId, action) => {
        try {
            setProcessingId(refundId);
            await axios.put(`${API}/admin/refunds/${refundId}/process`, { action });
            fetchRefunds();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        finally { setProcessingId(null); }
    };

    const statusColors = {
        paid: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-purple-100 text-purple-700'
    };

    const refundStatusColors = {
        requested: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-blue-100 text-blue-700',
        processed: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                <div className="flex gap-2">
                    {['payments', 'refunds'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === t ? 'bg-[#003B95] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {t === 'payments' ? '💳 Payments' : '↩️ Refunds'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== PAYMENTS TAB ===== */}
            {activeTab === 'payments' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by transaction ref or user..." value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                        </div>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">All Types</option>
                            <option value="room">Room</option>
                            <option value="event">Event</option>
                        </select>
                        <button onClick={handleSearch} className="px-5 py-2.5 bg-[#003B95] text-white rounded-lg text-sm font-semibold hover:bg-[#002b6b] transition">Search</button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total', value: total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            { label: 'Paid', value: payments.filter(p => p.payment.paymentStatus === 'paid').length, color: 'bg-green-50 text-green-700 border-green-200' },
                            { label: 'Pending', value: payments.filter(p => p.payment.paymentStatus === 'pending').length, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                            { label: 'Failed', value: payments.filter(p => p.payment.paymentStatus === 'failed').length, color: 'bg-red-50 text-red-700 border-red-200' }
                        ].map(s => (
                            <div key={s.label} className={`p-4 rounded-xl border ${s.color}`}>
                                <p className="text-xs font-semibold opacity-70">{s.label}</p>
                                <p className="text-2xl font-extrabold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-blue-500" /></div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border"><CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500">No payments found</h3></div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Transaction</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(({ payment, invoice, refund }) => (
                                        <React.Fragment key={payment._id}>
                                            <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === payment._id ? null : payment._id)}>
                                                <td className="px-4 py-3">
                                                    <p className="font-mono text-xs font-semibold">{payment.transactionReference}</p>
                                                    <p className="text-[10px] text-gray-400">{new Date(payment.createdAt).toLocaleString()}</p>
                                                </td>
                                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.bookingType === 'room' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{payment.bookingType}</span></td>
                                                <td className="px-4 py-3 text-xs">{payment.userId}</td>
                                                <td className="px-4 py-3 text-right font-bold">Rs. {payment.totalAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[payment.paymentStatus]}`}>{payment.paymentStatus.toUpperCase()}</span></td>
                                                <td className="px-4 py-3 text-center">{expandedId === payment._id ? <ChevronUp size={16} className="mx-auto text-gray-400" /> : <ChevronDown size={16} className="mx-auto text-gray-400" />}</td>
                                            </tr>
                                            {expandedId === payment._id && (
                                                <tr>
                                                    <td colSpan={6} className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {/* Details */}
                                                            <div className="space-y-2">
                                                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Payment Details</h4>
                                                                <div className="text-xs space-y-1">
                                                                    <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="font-semibold">Rs. {payment.amount?.toLocaleString()}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Tax</span><span className="font-semibold">Rs. {payment.taxAmount?.toLocaleString()}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Service Charge</span><span className="font-semibold">Rs. {payment.serviceCharge?.toLocaleString()}</span></div>
                                                                    <div className="flex justify-between border-t pt-1"><span className="font-bold">Total</span><span className="font-bold">Rs. {payment.totalAmount?.toLocaleString()}</span></div>
                                                                    <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="font-semibold capitalize">{payment.paymentMethod}</span></div>
                                                                    {payment.paidAt && <div className="flex justify-between"><span className="text-gray-400">Paid At</span><span className="font-semibold">{new Date(payment.paidAt).toLocaleString()}</span></div>}
                                                                </div>
                                                            </div>

                                                            {/* Invoice */}
                                                            <div className="space-y-2">
                                                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Invoice</h4>
                                                                {invoice ? (
                                                                    <div className="bg-white p-3 rounded-lg border text-xs space-y-1">
                                                                        <div className="flex justify-between"><span className="text-gray-400">Invoice #</span><span className="font-mono font-semibold">{invoice.invoiceNumber}</span></div>
                                                                        <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString()}</span></div>
                                                                        <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="font-semibold capitalize">{invoice.invoiceStatus}</span></div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400">No invoice generated</p>
                                                                )}
                                                                <button onClick={() => handleGenerateInvoice(payment._id)} className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1">
                                                                    <FileText size={12} /> {invoice ? 'Regenerate' : 'Generate'} Invoice
                                                                </button>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="space-y-2">
                                                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Status Actions</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['paid', 'pending', 'failed', 'refunded'].map(s => (
                                                                        <button key={s} onClick={() => handleStatusUpdate(payment._id, s)}
                                                                            disabled={payment.paymentStatus === s}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-30 ${statusColors[s]} hover:opacity-80`}>
                                                                            Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <button onClick={() => handleVerify(payment._id)} className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1">
                                                                    <ShieldCheck size={12} /> Verify Payment
                                                                </button>

                                                                {/* Refund info */}
                                                                {refund && (
                                                                    <div className={`mt-3 p-3 rounded-lg text-xs ${refundStatusColors[refund.refundStatus]}`}>
                                                                        <p className="font-bold">Refund: {refund.refundStatus}</p>
                                                                        <p>Amount: Rs. {refund.refundAmount?.toLocaleString()}</p>
                                                                        <p>Reason: {refund.refundReason}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                                    <span className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-50">Prev</button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded text-xs disabled:opacity-50">Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ===== REFUNDS TAB ===== */}
            {activeTab === 'refunds' && (
                <>
                    {/* Filter */}
                    <div className="flex gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <select value={refundStatusFilter} onChange={e => { setRefundStatusFilter(e.target.value); setRefundPage(1); }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="processed">Processed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-blue-500" /></div>
                    ) : refunds.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border"><RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500">No refund requests</h3></div>
                    ) : (
                        <div className="space-y-4">
                            {refunds.map(refund => (
                                <div key={refund._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${refundStatusColors[refund.refundStatus]}`}>{refund.refundStatus.toUpperCase()}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${refund.bookingType === 'room' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{refund.bookingType}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">Rs. {refund.refundAmount?.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Reason: {refund.refundReason}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">User: {refund.userId} • Requested: {new Date(refund.requestedAt).toLocaleString()}</p>
                                            {refund.processedAt && <p className="text-xs text-gray-400">Processed: {new Date(refund.processedAt).toLocaleString()}</p>}
                                        </div>

                                        {['requested', 'approved'].includes(refund.refundStatus) && (
                                            <div className="flex gap-2">
                                                {refund.refundStatus === 'requested' && (
                                                    <>
                                                        <button onClick={() => handleRefundAction(refund._id, 'approve')} disabled={processingId === refund._id}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition">Approve</button>
                                                        <button onClick={() => handleRefundAction(refund._id, 'reject')} disabled={processingId === refund._id}
                                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition">Reject</button>
                                                    </>
                                                )}
                                                {refund.refundStatus === 'approved' && (
                                                    <button onClick={() => handleRefundAction(refund._id, 'process')} disabled={processingId === refund._id}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                                                        {processingId === refund._id ? 'Processing...' : 'Process Refund'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {refundTotalPages > 1 && (
                                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                                    <span className="text-xs text-gray-500">Page {refundPage} of {refundTotalPages} ({refundTotal} total)</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setRefundPage(p => Math.max(1, p - 1))} disabled={refundPage <= 1} className="px-3 py-1 border rounded text-xs disabled:opacity-50">Prev</button>
                                        <button onClick={() => setRefundPage(p => Math.min(refundTotalPages, p + 1))} disabled={refundPage >= refundTotalPages} className="px-3 py-1 border rounded text-xs disabled:opacity-50">Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentManagement;
