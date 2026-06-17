"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PendingCashRequest {
  id: number;
  payos_order_code: string;
  tenant_name: string;
  email: string;
  purchase_type: string;
  status: string;
  created_at: string;
  subscription: {
    package_code: string;
    price: string;
  };
}

export default function CashRequestsPage() {
  const { accessToken, isRealAdmin } = useAuth();
  const [requests, setRequests] = useState<PendingCashRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PendingCashRequest | null>(null);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/subscriptions/purchase/pending-cash`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isRealAdmin && accessToken) {
      fetchRequests();
    }
  }, [isRealAdmin, accessToken]);

  async function processConfirm() {
    if (!selectedRequest) return;
    
    setConfirmingId(selectedRequest.id);
    try {
      const res = await fetch(`${API_URL}/subscriptions/purchase/confirm-cash/${selectedRequest.payos_order_code}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Xác nhận thất bại");
      }
      
      toast.success("Duyệt đơn thành công", {
        description: `Mã đơn hàng ${selectedRequest.payos_order_code} đã được kích hoạt.`,
      });
      
      // Loại bỏ đơn hàng khỏi danh sách chờ
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Xác nhận thất bại";
      toast.error("Thất bại", { description: msg });
    } finally {
      setConfirmingId(null);
    }
  }

  if (!isRealAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <PageHeader
          title="Yêu Cầu Thanh Toán Tiền Mặt"
          description="Duyệt các yêu cầu kích hoạt gói/tài khoản thanh toán bằng thủ công."
          breadcrumbs={[{ label: "Admin" }, { label: "Duyệt yêu cầu" }]}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs font-semibold hover:bg-destructive/20"
              onClick={fetchRequests}
            >
              Thử lại
            </Button>
          </div>
        )}

        <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100/50 pb-5 bg-white/50 dark:border-gray-800/50 dark:bg-gray-900/50">
            <div>
              <CardTitle className="text-lg font-bold">Danh sách đang chờ duyệt</CardTitle>
              <CardDescription className="text-[13px] mt-1">
                Hiển thị các giao dịch chờ xác nhận nhận tiền thực tế.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchRequests}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Làm mới
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading && requests.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải dữ liệu…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold text-gray-600 px-6 py-4">Mã đơn</TableHead>
                      <TableHead className="font-semibold text-gray-600">Khách hàng</TableHead>
                      <TableHead className="font-semibold text-gray-600">Gói</TableHead>
                      <TableHead className="font-semibold text-gray-600">Số tiền</TableHead>
                      <TableHead className="font-semibold text-gray-600">Loại</TableHead>
                      <TableHead className="font-semibold text-gray-600">Thời gian</TableHead>
                      <TableHead className="text-right font-semibold text-gray-600 px-6">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Không có yêu cầu nào đang chờ duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-semibold px-6 py-4">
                          <span className="font-mono text-xs">{req.payos_order_code}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{req.tenant_name}</div>
                          <div className="text-xs text-gray-500">{req.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{req.subscription.package_code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(parseFloat(req.subscription.price))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.purchase_type === 'NEW' ? "default" : "secondary"}>
                            {req.purchase_type === 'NEW' ? "Mua mới" : "Gia hạn"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[13px]">
                          {new Date(req.created_at).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(req)}
                            disabled={confirmingId === req.id}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                          >
                            {confirmingId === req.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Đã nhận tiền
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modern Confirm Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Xác nhận nhận tiền
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-4 text-base">Bạn có chắc chắn muốn duyệt đơn hàng này?</p>
            
            {selectedRequest && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn:</span>
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">{selectedRequest.payos_order_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedRequest.tenant_name}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {formatCurrency(parseFloat(selectedRequest.subscription.price))}
                  </span>
                </div>
              </div>
            )}
            
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              Hệ thống sẽ ngay lập tức kích hoạt tài khoản hoặc gia hạn gói cước. Hành động này không thể hoàn tác.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              disabled={confirmingId !== null}
              className="rounded-xl h-10"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold"
              onClick={processConfirm}
              disabled={confirmingId !== null}
            >
              {confirmingId !== null ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý</>
              ) : (
                "Đã nhận đủ tiền"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
