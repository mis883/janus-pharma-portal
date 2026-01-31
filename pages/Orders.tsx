import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle, Truck, FileText, Upload, DollarSign, X, ChevronDown, ChevronUp, AlertCircle, Eye } from 'lucide-react';
import { Order, OrderStatus, UserRole, User } from '../types';

interface OrdersProps {
    orders: Order[];
    userRole: UserRole;
    user: User;
    onUpdateOrder: (order: Order) => void;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700 border-blue-200';
        case OrderStatus.PAYMENT_REQUESTED: return 'bg-orange-100 text-orange-700 border-orange-200';
        case OrderStatus.PAYMENT_SUBMITTED: return 'bg-purple-100 text-purple-700 border-purple-200';
        case OrderStatus.DISPATCHED: return 'bg-green-100 text-green-700 border-green-200';
        case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export const Orders: React.FC<OrdersProps> = ({ orders, userRole, user, onUpdateOrder }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    
    // Process Modal State (Staff)
    const [finalAmount, setFinalAmount] = useState<string>('');
    const [invoiceFile, setInvoiceFile] = useState<string>('');
    const [docketNumber, setDocketNumber] = useState('');

    // Filter Logic
    const myOrders = userRole === UserRole.CUSTOMER 
        ? orders.filter(o => o.userId === user.id)
        : orders;

    // Sorting
    const sortedOrders = [...myOrders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleFileMockUpload = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (val: string) => void) => {
        if (e.target.files?.[0]) {
            // Mock file URL creation
            const reader = new FileReader();
            reader.onloadend = () => {
                setFunc(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleDistributorUploadProof = () => {
        if (selectedOrder && invoiceFile) {
            onUpdateOrder({
                ...selectedOrder,
                paymentProofUrl: invoiceFile, // reusing state variable for simplicity
                status: OrderStatus.PAYMENT_SUBMITTED
            });
            setIsUploadModalOpen(false);
            setInvoiceFile('');
        }
    };

    const handleStaffProcessOrder = () => {
        if (!selectedOrder) return;
        
        const updates: Partial<Order> = {};
        
        if (selectedOrder.status === OrderStatus.PENDING || selectedOrder.status === OrderStatus.PROCESSING) {
            // Staff is requesting payment
            if (finalAmount && invoiceFile) {
                updates.status = OrderStatus.PAYMENT_REQUESTED;
                updates.finalPayableAmount = parseFloat(finalAmount);
                updates.invoiceUrl = invoiceFile;
            }
        } else if (selectedOrder.status === OrderStatus.PAYMENT_SUBMITTED || selectedOrder.status === OrderStatus.PAYMENT_REQUESTED) {
            // Staff is dispatching
            if (docketNumber) {
                updates.status = OrderStatus.DISPATCHED;
                updates.docketNumber = docketNumber;
            }
        }

        onUpdateOrder({ ...selectedOrder, ...updates });
        setIsProcessModalOpen(false);
        setFinalAmount('');
        setInvoiceFile('');
        setDocketNumber('');
    };

    const openProcessModal = (order: Order) => {
        setSelectedOrder(order);
        setFinalAmount(order.finalPayableAmount?.toString() || order.totalInquiryValue.toString());
        setIsProcessModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <ClipboardList size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{userRole === UserRole.CUSTOMER ? 'My Orders' : 'Manage Orders'}</h1>
                    <p className="text-slate-500">{userRole === UserRole.CUSTOMER ? 'Track your inquiries and payments' : 'Process incoming orders and dispatch'}</p>
                </div>
            </div>

            <div className="space-y-4">
                {sortedOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <p className="text-slate-400">No orders found.</p>
                    </div>
                ) : (
                    sortedOrders.map(order => (
                        <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-slate-800">#{order.id}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(order.date).toLocaleDateString()} • {userRole !== UserRole.CUSTOMER && <span className="font-bold text-blue-600">{order.userName}</span>}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Inquiry Value (Approx)</p>
                                    <p className="font-bold text-slate-800">₹{order.totalInquiryValue.toLocaleString()}</p>
                                    {order.finalPayableAmount && (
                                        <div className="mt-1">
                                            <p className="text-xs text-green-600 font-bold">Final Payable: ₹{order.finalPayableAmount.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details / Summary */}
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4">
                                <p className="font-medium mb-2">{order.items.length} Items:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <li key={idx}>{item.brandName} x {item.quantity}</li>
                                    ))}
                                    {order.items.length > 2 && <li>...and {order.items.length - 2} more</li>}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                                <button onClick={() => setSelectedOrder(order)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded">
                                    <Eye size={16} /> View Details
                                </button>

                                {/* Distributor Actions */}
                                {userRole === UserRole.CUSTOMER && order.status === OrderStatus.PAYMENT_REQUESTED && (
                                    <>
                                        {order.invoiceUrl && (
                                            <a href={order.invoiceUrl} download="invoice.png" className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:bg-slate-100 px-3 py-2 rounded">
                                                <FileText size={16} /> Download Bill
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => {setSelectedOrder(order); setIsUploadModalOpen(true)}} 
                                            className="flex items-center gap-1 text-sm font-bold bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded shadow-sm"
                                        >
                                            <Upload size={16} /> Upload Payment
                                        </button>
                                    </>
                                )}

                                {/* Staff Actions */}
                                {(userRole === UserRole.STAFF || userRole === UserRole.ADMIN) && (
                                    <button 
                                        onClick={() => openProcessModal(order)}
                                        className="flex items-center gap-1 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded shadow-sm ml-auto"
                                    >
                                        <CheckCircle size={16} /> Process Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Details Modal */}
            {selectedOrder && !isUploadModalOpen && !isProcessModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Order Details #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <span className={`text-sm font-bold px-2 py-1 rounded border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedOrder.docketNumber && (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-3">
                                    <Truck className="text-green-600" />
                                    <div>
                                        <p className="text-xs text-green-800 font-bold uppercase">Dispatched</p>
                                        <p className="text-sm font-medium text-green-900">Docket: {selectedOrder.docketNumber}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.brandName}</p>
                                                <p className="text-slate-500">{item.packing}</p>
                                            </div>
                                            <div className="text-right">
                                                <p>x {item.quantity}</p>
                                                <p className="text-slate-400 text-xs">MRP ₹{item.mrp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                                <span className="font-bold text-slate-600">Total Inquiry Value</span>
                                <span className="font-bold text-slate-800">₹{selectedOrder.totalInquiryValue.toLocaleString()}</span>
                            </div>
                            {selectedOrder.finalPayableAmount && (
                                <div className="bg-green-100 border border-green-200 p-4 rounded-lg flex justify-between items-center">
                                    <span className="font-bold text-green-800">Final Payable Amount</span>
                                    <span className="font-bold text-green-900 text-xl">₹{selectedOrder.finalPayableAmount.toLocaleString()}</span>
                                </div>
                            )}

                             {/* Attachments Section */}
                             <div className="flex gap-4">
                                {selectedOrder.invoiceUrl && (
                                    <div className="flex-1 border p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-2">Proforma Invoice</p>
                                        <img src={selectedOrder.invoiceUrl} className="h-20 w-auto mx-auto object-contain border" alt="Invoice" />
                                    </div>
                                )}
                                {selectedOrder.paymentProofUrl && (
                                    <div className="flex-1 border p-3 rounded text-center">
                                        <p className="text-xs text-slate-500 mb-2">Payment Proof</p>
                                        <img src={selectedOrder.paymentProofUrl} className="h-20 w-auto mx-auto object-contain border" alt="Proof" />
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Payment Modal (Distributor) */}
            {isUploadModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Upload Payment Proof</h2>
                        <p className="text-sm text-slate-600 mb-4">Please upload a screenshot of your UTR/Transaction for Order #{selectedOrder.id}.</p>
                        
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 relative mb-4">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFileMockUpload(e, setInvoiceFile)} />
                            {invoiceFile ? (
                                <img src={invoiceFile} className="h-32 mx-auto object-contain" alt="Preview" />
                            ) : (
                                <div className="text-slate-400">
                                    <Upload className="mx-auto mb-2" />
                                    <span className="text-sm">Click to select image</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => {setIsUploadModalOpen(false); setInvoiceFile('')}} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded">Cancel</button>
                            <button onClick={handleDistributorUploadProof} disabled={!invoiceFile} className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50">Submit Proof</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Process Modal */}
            {isProcessModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-2">Process Order #{selectedOrder.id}</h2>
                        <p className="text-xs text-slate-500 mb-6">Current Status: {selectedOrder.status}</p>

                        {(selectedOrder.status === OrderStatus.PENDING || selectedOrder.status === OrderStatus.PROCESSING) && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Final Payable Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded p-2" 
                                        value={finalAmount} 
                                        onChange={(e) => setFinalAmount(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Upload Invoice/Bill</label>
                                    <input type="file" onChange={(e) => handleFileMockUpload(e, setInvoiceFile)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                </div>
                                <div className="bg-orange-50 p-3 rounded text-xs text-orange-800">
                                    <p>Action: This will change status to <strong>Payment Requested</strong> and notify the distributor.</p>
                                </div>
                            </div>
                        )}

                        {(selectedOrder.status === OrderStatus.PAYMENT_SUBMITTED || selectedOrder.status === OrderStatus.PAYMENT_REQUESTED) && (
                            <div className="space-y-4">
                                {selectedOrder.paymentProofUrl && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold mb-1">Distributor Payment Proof:</p>
                                        <img src={selectedOrder.paymentProofUrl} className="h-24 object-contain border rounded" alt="Proof" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Courier Docket No / Transport Details</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2" 
                                        value={docketNumber} 
                                        onChange={(e) => setDocketNumber(e.target.value)}
                                        placeholder="e.g. DTDC-123456789" 
                                    />
                                </div>
                                <div className="bg-green-50 p-3 rounded text-xs text-green-800">
                                    <p>Action: This will mark order as <strong>Dispatched</strong>.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setIsProcessModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded">Cancel</button>
                            <button onClick={handleStaffProcessOrder} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Update Status</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};