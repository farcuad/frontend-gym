import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSpinner,
  faCalendarAlt,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { PaymentHistory } from "../services/services";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const PaymentHistoryView: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const MySwal = withReactContent(Swal);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHistoryPagos();
      const apiResponse = response.data;
      
      let data: PaymentHistory[] = [];

      if (apiResponse && Array.isArray(apiResponse.payment)) {
        data = apiResponse.payment;
      } else if (Array.isArray(apiResponse)) {
        data = apiResponse;
      } else {
        console.error("Unexpected response format:", apiResponse);
        data = [];
      }
      
      // Sort by date descending (created_at)
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      MySwal.fire("Error", "No se pudo obtener el historial de pagos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [startDate, endDate, payments]);

  const filterPayments = () => {
    let temp = [...payments];

    if (startDate) {
      temp = temp.filter(p => new Date(p.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      temp = temp.filter(p => new Date(p.created_at) <= end);
    }

    setFilteredPayments(temp);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number, currency: "USD" | "VES") => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return currency === "USD" 
      ? `$${value.toFixed(2)}` 
      : `Bs. ${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faHistory} className="text-teal-600" />
          Historial de Pagos
        </h2>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 w-full md:w-auto justify-center md:justify-end">
          <div className="flex items-center gap-2 px-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase">Filtrar:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 max-w-[110px]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 max-w-[110px]"
            />
          </div>
          
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1 bg-rose-50 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                #
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Fecha
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Cliente
              </th>
               <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Plan
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Referencia
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Monto
              </th>
            </tr>
          </thead>
          {filteredPayments.length === 0 && (
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 whitespace-nowrap text-center text-gray-400 font-bold text-[15px]"
                >
                  No se encontraron pagos registrados.
                </td>
              </tr>
            </tbody>
          )}
          {filteredPayments.length > 0 && (
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id || index}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap text-gray-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-bold text-gray-700 text-xs">
                      {formatDate(payment.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{payment.client_name}</span>
                    </div>
                  </td>
                   <td className="px-6 py-5 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                      {payment.plan_name}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-600">{payment.payment_method}</span>
                      {payment.reference && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md w-fit">
                          Ref: {payment.reference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                        {formatCurrency(payment.plan_price_usd, "USD")}
                      </span>
                      <span className="text-xs text-gray-400 font-bold ml-1">
                        {formatCurrency(payment.amount_paid_bs, "VES")} (Tasa: {parseFloat(payment.exchange_rate).toFixed(2)})
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredPayments.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay pagos que coincidan con la búsqueda
          </div>
        )}
        {filteredPayments.map((payment, index) => (
          <div key={payment.id || index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            
            <div className="flex justify-between items-start gap-3">
               <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 mb-1">{formatDate(payment.created_at)}</p>
                <h3 className="font-bold text-gray-800 text-lg truncate">{payment.client_name}</h3>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px] mt-1 inline-block">
                  {payment.plan_name}
                </span>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                    {formatCurrency(payment.plan_price_usd, "USD")}
                 </span>
                 <span className="text-[10px] text-gray-400">
                    {formatCurrency(payment.amount_paid_bs, "VES")}
                 </span>
               </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Método</span>
                  <span className="text-xs font-bold text-gray-700">{payment.payment_method}</span>
                </div>
              </div>
              
              {payment.reference && (
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-gray-400 uppercase">Referencia</span>
                   <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                     {payment.reference}
                   </span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistoryView;
