import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSpinner,
  faCalendarAlt,
  faFileInvoiceDollar,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { PaymentHistory } from "../services/services";
import { notify } from "../utils/toast";
import { useQuery } from "@tanstack/react-query";

const PaymentHistoryView: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: allPayments = [], isLoading: loading } = useQuery<PaymentHistory[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await apiService.getHistoryPagos();
      const apiResponse = response.data.payment;
      let data: PaymentHistory[] = [];
      if (apiResponse && Array.isArray(apiResponse.payment)) {
        data = apiResponse.payment;
      } else if (Array.isArray(apiResponse)) {
        data = apiResponse;
      }
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return data;
    },
  });

  const filteredPayments = useMemo(() => {
    let temp = [...allPayments];

    if (startDate) {
      temp = temp.filter(p => new Date(p.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      temp = temp.filter(p => new Date(p.created_at) <= end);
    }

    return temp;
  }, [startDate, endDate, allPayments]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-[2.5rem] border  border-gray-800 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-800 rounded-[2.5rem] border  border-gray-800 shadow-sm transition-colors duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-black text-gray-200 flex items-center gap-2">
          <FontAwesomeIcon icon={faHistory} className="text-teal-600" />
          Historial de Pagos
        </h2>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-800 p-2 rounded-2xl border  border-gray-800 w-full md:w-auto justify-center md:justify-end">
          <div className="flex items-center gap-2 px-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase">Filtrar:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 border  border-gray-700 text-gray-300 text-xs font-bold py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 max-w-[110px]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 border  border-gray-700 text-gray-300 text-xs font-bold py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 max-w-[110px]"
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

      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b  border-gray-800">
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
                #
              </th>
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
                Fecha
              </th>
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
                Cliente
              </th>
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
                Plan
              </th>
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
                Referencia
              </th>
              <th className="px-6 py-4 text-left font-bold text-white uppercase tracking-widest text-[10px] whitespace-nowrap">
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
          {currentPayments.length > 0 && (
            <tbody className="divide-y divide-gray-50">
              {currentPayments.map((payment, index) => (
                <tr
                  key={payment.id || index}
                  className="hover:bg-gray-900/50 transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap text-gray-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-bold text-gray-300 text-xs">
                      {formatDate(payment.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-200">{payment.client_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="bg-blue-700 text-white px-3 py-1 rounded-full font-bold text-xs">
                      {payment.plan_name}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white">{payment.payment_method}</span>
                      {payment.reference && (
                        <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-md w-fit">
                          Ref: {payment.reference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className="bg-green-700 text-white px-3 py-1 rounded-full font-bold text-xs">
                        {formatCurrency(payment.plan_price_usd, "USD")}
                      </span>
                      <span className="text-xs text-white font-bold ml-1">
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
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {currentPayments.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay pagos que coincidan con la búsqueda
          </div>
        )}
        {currentPayments.map((payment, index) => (
          <div key={payment.id || index} className="bg-gray-800 p-5 rounded-2xl border  border-gray-700 shadow-sm flex flex-col gap-3 relative overflow-hidden">

            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 mb-1">{formatDate(payment.created_at)}</p>
                <h3 className="font-bold text-gray-200 text-lg truncate">{payment.client_name}</h3>
                <span className="bg-blue-700 text-white px-2 py-0.5 rounded-md font-bold text-[12px] mt-1 inline-block">
                  {payment.plan_name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-green-700 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {formatCurrency(payment.plan_price_usd, "USD")}
                </span>
                <span className="text-[13px] text-white font-bold ml-1">
                  {formatCurrency(payment.amount_paid_bs, "VES")}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white uppercase">Método</span>
                  <span className="text-xs font-bold text-white">{payment.payment_method}</span>
                </div>
              </div>

              {payment.reference && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white uppercase">Referencia</span>
                  <span className="text-xs font-mono font-bold text-white bg-gray-700 px-2 py-0.5 rounded">
                    {payment.reference}
                  </span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      {filteredPayments.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 px-2 py‑4 border-t border-gray-700">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-900/30 rounded-xl disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-900/30 rounded-xl disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400 font-medium">
              Mostrando <span className="text-gray-200 font-bold">{indexOfFirstItem + 1}</span> a{" "}
              <span className="text-gray-200 font-bold">
                {Math.min(indexOfLastItem, filteredPayments.length)}
              </span>{" "}
              de <span className="text-gray-200 font-bold">{filteredPayments.length}</span> pagos
            </p>

            <nav className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-800 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`size-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === page
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                      : "text-gray-400 hover:bg-gray-700"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-800 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryView;
