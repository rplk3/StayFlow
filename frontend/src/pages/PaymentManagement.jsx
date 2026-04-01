import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CreditCard, FileText, RotateCcw, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Search, Filter, Eye, Download, ShieldCheck, X, FileMinus, Landmark, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:5000/api/payments';
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Modal
    const [selectedPayment, setSelectedPayment] = useState(null);

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
            const res = await axios.get(`${API}/admin/all`, { params, headers: headers() });
            setPayments(res.data.payments);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) { 
            console.error(err); 
            Swal.fire({ title: 'Error!', text: 'Failed to fetch payments', icon: 'error', background: dk.card, color: dk.text });
        } finally { setLoading(false); }
    };

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const params = { page: refundPage, limit: 15 };
            if (refundStatusFilter) params.status = refundStatusFilter;
            const res = await axios.get(`${API}/admin/refunds`, { params, headers: headers() });
            setRefunds(res.data.refunds);
            setRefundTotal(res.data.total);
            setRefundTotalPages(res.data.totalPages);
        } catch (err) { 
            console.error(err); 
            Swal.fire({ title: 'Error!', text: 'Failed to fetch refunds', icon: 'error', background: dk.card, color: dk.text });
        } finally { setLoading(false); }
    };

    const handleSearch = () => { setPage(1); fetchPayments(); };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        try {
            await axios.put(`${API}/admin/${paymentId}/status`, { paymentStatus: newStatus }, { headers: headers() });
            Swal.fire({ title: 'Updated!', text: `Payment marked as ${newStatus}`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            fetchPayments();
            if (selectedPayment?.payment?._id === paymentId) setSelectedPayment(null);
        } catch (err) { 
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to update status', icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const handleVerify = async (paymentId) => {
        try {
            await axios.put(`${API}/admin/${paymentId}/verify`, {}, { headers: headers() });
            Swal.fire({ title: 'Verified!', text: `Payment verified successfully`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            fetchPayments();
            if (selectedPayment?.payment?._id === paymentId) setSelectedPayment(null);
        } catch (err) { 
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to verify', icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const handleGenerateInvoice = async (paymentId) => {
        try {
            await axios.post(`${API}/admin/${paymentId}/generate-invoice`, {}, { headers: headers() });
            Swal.fire({ title: 'Generated!', text: `Invoice generated successfully`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            fetchPayments();
            if (selectedPayment?.payment?._id === paymentId) {
                // Just close modal to force refresh
                setSelectedPayment(null);
            }
        } catch (err) { 
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to generate invoice', icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const handleRefundAction = async (refundId, action) => {
        const confirmResult = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Refund?`,
            text: `Are you sure you want to ${action} this refund request?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#3b82f6',
            background: dk.card,
            color: dk.text
        });

        if (confirmResult.isConfirmed) {
            try {
                setProcessingId(refundId);
                await axios.put(`${API}/admin/refunds/${refundId}/process`, { action }, { headers: headers() });
                Swal.fire({ title: 'Success!', text: `Refund ${action}d successfully.`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
                fetchRefunds();
            } catch (err) { 
                Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed', icon: 'error', background: dk.card, color: dk.text }); 
            } finally { setProcessingId(null); }
        }
    };

    const downloadPDF = (payment, invoice) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor('#1E3A8A');
        doc.text("INVOICE", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor('#374151');
        doc.text(`Invoice #      : ${invoice ? invoice.invoiceNumber : 'N/A'}`, 14, 32);
        doc.text(`Date           : ${invoice ? new Date(invoice.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 14, 38);
        doc.text(`Transaction Ref: ${payment.transactionReference}`, 14, 44);
        doc.text(`Booking Type   : ${payment.bookingType.toUpperCase()}`, 14, 50);

        doc.text("Billed To:", 140, 32);
        doc.setFont(undefined, 'bold');
        doc.text(payment.userId, 140, 38);
        doc.setFont(undefined, 'normal');

        const tableColumn = ["Description", "Amount (LKR)"];
        const tableRows = [
            ["Subtotal", payment.amount?.toLocaleString()],
            ["Tax", payment.taxAmount?.toLocaleString()],
            ["Service Charge", payment.serviceCharge?.toLocaleString()],
            ["Total Paid", payment.totalAmount?.toLocaleString()]
        ];

        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        doc.setFontSize(10);
        doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`, 14, doc.lastAutoTable.finalY + 15);
        if (payment.paidAt) {
            doc.text(`Paid Date: ${new Date(payment.paidAt).toLocaleString()}`, 14, doc.lastAutoTable.finalY + 21);
        }

        doc.save(`Invoice_${payment.transactionReference}.pdf`);
    };

    const statusColors = {
        paid: 'bg-green-900/30 text-green-400 border border-green-500/30',
        pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
        failed: 'bg-red-900/30 text-red-500 border border-red-500/30',
        refunded: 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
    };

    const refundStatusColors = {
        requested: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
        approved: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
        processed: 'bg-green-900/30 text-green-400 border border-green-500/30',
        rejected: 'bg-red-900/30 text-red-500 border border-red-500/30'
    };

    const buttonClass = "px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5";

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-3xl font-extrabold text-white">Payment Management</h1>
                </div>
                <div className="flex gap-2">
                    {['payments', 'refunds'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === t ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {t === 'payments' ? <Landmark size={16} /> : <RefreshCcw size={16} />}
                            {t === 'payments' ? 'Payments' : 'Refunds'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== PAYMENTS TAB ===== */}
            {activeTab === 'payments' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 p-4 rounded-xl border shadow-sm mb-6" style={{ background: dk.card, borderColor: dk.border }}>
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder="Search by transaction ref or user..." value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                        </div>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2.5 border rounded-lg text-sm outline-none transition" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2.5 border rounded-lg text-sm outline-none transition" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Types</option>
                            <option value="room">Room</option>
                            <option value="event">Event</option>
                        </select>
                        <button onClick={handleSearch} className={buttonClass}>Search</button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total', value: total, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-900/10' },
                            { label: 'Paid', value: payments.filter(p => p.payment.paymentStatus === 'paid').length, color: 'text-green-400 border-green-500/20 bg-green-900/10' },
                            { label: 'Pending', value: payments.filter(p => p.payment.paymentStatus === 'pending').length, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-900/10' },
                            { label: 'Failed', value: payments.filter(p => p.payment.paymentStatus === 'failed').length, color: 'text-red-400 border-red-500/20 bg-red-900/10' }
                        ].map(s => (
                            <div key={s.label} className={`p-4 rounded-xl border ${s.color}`}>
                                <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-extrabold mt-1">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-indigo-500" /></div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl border" style={{ background: dk.card, borderColor: dk.border }}><CreditCard className="w-16 h-16 text-indigo-400/30 mx-auto mb-4" /><h3 className="text-xl" style={{ color: dk.textSec }}>No payments found</h3></div>
                    ) : (
                        <div className="rounded-xl border shadow-sm overflow-hidden" style={{ background: dk.card, borderColor: dk.border }}>
                            <table className="w-full text-sm">
                                <thead className="border-b" style={{ background: dk.elevated, borderColor: dk.border }}>
                                    <tr>
                                        <th className="text-left px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>Transaction</th>
                                        <th className="text-left px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>Type</th>
                                        <th className="text-left px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>User</th>
                                        <th className="text-right px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>Amount</th>
                                        <th className="text-center px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>Status</th>
                                        <th className="text-center px-5 py-4 font-bold uppercase tracking-wider text-xs" style={{ color: dk.textSec }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: dk.border }}>
                                    {payments.map((p) => (
                                        <tr key={p.payment._id} className="transition-colors hover:bg-white/5">
                                            <td className="px-5 py-4">
                                                <p className="font-mono text-xs font-semibold text-indigo-300">{p.payment.transactionReference}</p>
                                                <p className="text-[10px] opacity-60 mt-0.5">{new Date(p.payment.createdAt).toLocaleString()}</p>
                                            </td>
                                            <td className="px-5 py-4"><span className={`px-2.5 py-1 border rounded-full text-xs font-bold uppercase ${p.payment.bookingType === 'room' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/20' : 'bg-purple-900/30 text-purple-400 border-purple-500/20'}`}>{p.payment.bookingType}</span></td>
                                            <td className="px-5 py-4 text-xs opacity-90">{p.payment.userId}</td>
                                            <td className="px-5 py-4 text-right font-bold text-white">Rs. {p.payment.totalAmount?.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[p.payment.paymentStatus]}`}>{p.payment.paymentStatus.toUpperCase()}</span></td>
                                            <td className="px-5 py-4 text-center">
                                                <button onClick={() => setSelectedPayment(p)} className="p-2 rounded-lg hover:bg-indigo-500/20 transition group">
                                                    <Eye size={18} className="text-indigo-400 group-hover:text-indigo-300" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: dk.border, background: dk.card }}>
                                    <span className="text-xs" style={{ color: dk.textSec }}>Page {page} of {totalPages} ({total} total)</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 border rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border }}>Prev</button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 border rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border }}>Next</button>
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
                    <div className="flex gap-3 p-4 rounded-xl border shadow-sm mb-6" style={{ background: dk.card, borderColor: dk.border }}>
                        <select value={refundStatusFilter} onChange={e => { setRefundStatusFilter(e.target.value); setRefundPage(1); }}
                            className="px-4 py-2.5 border rounded-lg text-sm outline-none transition" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="processed">Processed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-indigo-500" /></div>
                    ) : refunds.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl border" style={{ background: dk.card, borderColor: dk.border }}><RotateCcw className="w-16 h-16 text-gray-500/50 mx-auto mb-4" /><h3 className="text-xl" style={{ color: dk.textSec }}>No refund requests</h3></div>
                    ) : (
                        <div className="space-y-4">
                            {refunds.map(refund => (
                                <div key={refund._id} className="rounded-xl border shadow-sm p-6" style={{ background: dk.card, borderColor: dk.border }}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${refundStatusColors[refund.refundStatus]}`}>{refund.refundStatus.toUpperCase()}</span>
                                                <span className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase ${refund.bookingType === 'room' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/20' : 'bg-purple-900/30 text-purple-400 border-purple-500/20'}`}>{refund.bookingType}</span>
                                            </div>
                                            <p className="text-lg font-bold text-white mb-1">Rs. {refund.refundAmount?.toLocaleString()}</p>
                                            <p className="text-sm text-gray-400 mb-2">Reason: {refund.refundReason}</p>
                                            <p className="text-xs text-gray-500">User: {refund.userId} • Requested: {new Date(refund.requestedAt).toLocaleString()}</p>
                                            {refund.processedAt && <p className="text-xs text-gray-500 mt-0.5">Processed: {new Date(refund.processedAt).toLocaleString()}</p>}
                                        </div>

                                        {['requested', 'approved'].includes(refund.refundStatus) && (
                                            <div className="flex gap-2">
                                                {refund.refundStatus === 'requested' && (
                                                    <>
                                                        <button onClick={() => handleRefundAction(refund._id, 'approve')} disabled={processingId === refund._id}
                                                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-md">Approve</button>
                                                        <button onClick={() => handleRefundAction(refund._id, 'reject')} disabled={processingId === refund._id}
                                                            className="px-5 py-2.5 bg-red-900/30 border border-red-500/30 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-900/50 disabled:opacity-50 transition shadow-sm">Reject</button>
                                                    </>
                                                )}
                                                {refund.refundStatus === 'approved' && (
                                                    <button onClick={() => handleRefundAction(refund._id, 'process')} disabled={processingId === refund._id}
                                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-md">
                                                        {processingId === refund._id ? 'Processing...' : 'Process Refund'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {refundTotalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 rounded-xl border mt-6" style={{ background: dk.card, borderColor: dk.border }}>
                                    <span className="text-xs" style={{ color: dk.textSec }}>Page {refundPage} of {refundTotalPages} ({refundTotal} total)</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setRefundPage(p => Math.max(1, p - 1))} disabled={refundPage <= 1} className="px-4 py-2 border rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border }}>Prev</button>
                                        <button onClick={() => setRefundPage(p => Math.min(refundTotalPages, p + 1))} disabled={refundPage >= refundTotalPages} className="px-4 py-2 border rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border }}>Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ===== Payment Detail Modal ===== */}
            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard size={20} className="text-indigo-400" /> Payment Details</h2>
                            <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-white/10 rounded-lg transition" style={{ color: dk.textSec }}><X size={20} /></button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Details Column */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-indigo-400">Transaction Breakdown</h4>
                                    <div className="p-5 rounded-xl border space-y-3" style={{ background: dk.elevated, borderColor: dk.border }}>
                                        <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Subtotal</span><span className="font-semibold text-white">Rs. {selectedPayment.payment.amount?.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Tax</span><span className="font-semibold text-white">Rs. {selectedPayment.payment.taxAmount?.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Service Charge</span><span className="font-semibold text-white">Rs. {selectedPayment.payment.serviceCharge?.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm border-t pt-2" style={{ borderColor: dk.border }}><span className="font-bold text-white">Total</span><span className="font-bold text-lg text-indigo-300">Rs. {selectedPayment.payment.totalAmount?.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm mt-2"><span style={{ color: dk.textSec }}>Method</span><span className="font-semibold capitalize text-white">{selectedPayment.payment.paymentMethod}</span></div>
                                        {selectedPayment.payment.paidAt && <div className="flex justify-between text-xs mt-2"><span style={{ color: dk.textSec }}>Paid At</span><span className="font-semibold text-gray-300">{new Date(selectedPayment.payment.paidAt).toLocaleString()}</span></div>}
                                    </div>
                                </div>

                                {/* Invoice Column */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-indigo-400">Invoice</h4>
                                    <div className="p-5 rounded-xl border space-y-4" style={{ background: dk.elevated, borderColor: dk.border }}>
                                        {selectedPayment.invoice ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Invoice #</span><span className="font-mono font-semibold text-white bg-white/5 px-2 py-0.5 rounded">{selectedPayment.invoice.invoiceNumber}</span></div>
                                                <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Date</span><span className="font-semibold text-white">{new Date(selectedPayment.invoice.invoiceDate).toLocaleDateString()}</span></div>
                                                <div className="flex justify-between text-sm"><span style={{ color: dk.textSec }}>Status</span><span className="font-semibold capitalize text-white">{selectedPayment.invoice.invoiceStatus}</span></div>
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center">
                                                <FileMinus size={24} className="mx-auto text-gray-500 mb-2" />
                                                <p className="text-sm" style={{ color: dk.textSec }}>No invoice generated yet</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 flex-col pt-2 border-t" style={{ borderColor: dk.border }}>
                                            <button onClick={() => handleGenerateInvoice(selectedPayment.payment._id)} className="w-full justify-center px-4 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-semibold hover:bg-indigo-600/40 transition flex items-center gap-2">
                                                <FileText size={16} /> {selectedPayment.invoice ? 'Regenerate Invoice' : 'Generate DB Invoice'}
                                            </button>
                                            <button onClick={() => downloadPDF(selectedPayment.payment, selectedPayment.invoice)} className="w-full justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition flex items-center gap-2">
                                                <Download size={16} /> Download PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Column */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-indigo-400">Administration</h4>
                                    <div className="p-5 rounded-xl border space-y-4" style={{ background: dk.elevated, borderColor: dk.border }}>
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                {['paid', 'pending', 'failed', 'refunded'].map(s => (
                                                    <button key={s} onClick={() => handleStatusUpdate(selectedPayment.payment._id, s)}
                                                        disabled={selectedPayment.payment.paymentStatus === s}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-30 border ${s === 'paid' ? 'border-green-500/30 bg-green-900/20 text-green-400 hover:bg-green-900/40' : s === 'pending' ? 'border-yellow-500/30 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40' : s === 'failed' ? 'border-red-500/30 bg-red-900/20 text-red-500 hover:bg-red-900/40' : 'border-purple-500/30 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40'}`}>
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => handleVerify(selectedPayment.payment._id)} className="w-full justify-center px-4 py-2.5 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-semibold hover:bg-emerald-900/50 transition flex items-center gap-2">
                                            <ShieldCheck size={16} /> Verify Payment Authenticity
                                        </button>

                                        {/* Refund info */}
                                        {selectedPayment.refund && (
                                            <div className={`mt-4 p-3 rounded-lg text-xs border ${selectedPayment.refund.refundStatus === 'rejected' ? 'border-red-500/30 bg-red-900/10' : 'border-indigo-500/30 bg-indigo-900/10'}`}>
                                                <p className="font-bold uppercase tracking-wider mb-1 text-white flex items-center gap-1"><RefreshCcw size={12} /> Linked Refund</p>
                                                <div className="space-y-1 mt-2">
                                                    <div className="flex justify-between"><span className="opacity-70">Status</span><span className="font-bold capitalize">{selectedPayment.refund.refundStatus}</span></div>
                                                    <div className="flex justify-between"><span className="opacity-70">Amount</span><span className="font-semibold">Rs. {selectedPayment.refund.refundAmount?.toLocaleString()}</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
