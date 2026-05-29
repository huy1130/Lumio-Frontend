"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Loader2, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { shiftService, type ApiShiftTemplate, type ApiShift } from "@/lib/services/shiftService";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export default function ShiftsPage() {
  return (
    <AccessGuard roles={["shop_owner"]}>
      <ShiftsContent />
    </AccessGuard>
  );
}

function ShiftsContent() {
  const { user } = useAuth();
  const shopId = user?.shop_id;

  const [activeTab, setActiveTab] = useState<"shifts" | "templates">("shifts");

  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [templates, setTemplates] = useState<ApiShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const [shiftsData, templatesData] = await Promise.all([
        shiftService.getShiftsByShop(shopId).catch(() => []),
        shiftService.getTemplates().catch(() => [])
      ]);
      setShifts(shiftsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shopId]);

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Quản lý Ca làm việc
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sắp xếp và quản lý thời gian làm việc của nhân viên.
            </p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("shifts")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "shifts" 
                  ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Lịch làm việc
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "templates" 
                  ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Cấu hình mẫu ca
            </button>
          </div>
        </div>

        {activeTab === "shifts" ? (
          <ShiftsTab shifts={shifts} templates={templates} shopId={shopId} onReload={loadData} loading={loading} />
        ) : (
          <TemplatesTab templates={templates} onReload={loadData} loading={loading} />
        )}
      </div>
    </div>
  );
}

// ── Shifts Tab ─────────────────────────────────────────────────────────────
function ShiftsTab({ shifts, templates, shopId, onReload, loading }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    template_id: "",
    shift_date: new Date().toISOString().split('T')[0],
    cashiers_input: "", // ID thu ngân cách nhau bằng dấu phẩy
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    
    setIsSubmitting(true);
    try {
      // Parse mảng ID từ chuỗi nhập vào
      const cashiersArray = formData.cashiers_input
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      await shiftService.createShift({
        shop_id: shopId,
        template_id: Number(formData.template_id),
        shift_date: formData.shift_date,
        cashiers: cashiersArray,
        shift_status: "OPEN"
      });
      toast.success("Tạo ca làm việc thành công!");
      setIsOpen(false);
      onReload();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo ca làm việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Lịch làm việc</CardTitle>
          <CardDescription>Các ca làm việc trong ngày của chi nhánh</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Calendar className="h-4 w-4" /> Mở ca mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mở ca làm việc</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Ngày làm việc</Label>
                <Input type="date" value={formData.shift_date} onChange={e => setFormData({...formData, shift_date: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Mẫu ca</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.template_id} 
                  onChange={e => setFormData({...formData, template_id: e.target.value})} 
                  required
                >
                  <option value="" disabled>Chọn mẫu ca...</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.start_time} - {t.end_time})</option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Chưa có mẫu ca nào. Vui lòng sang tab Cấu hình mẫu ca để tạo trước.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ID Thu ngân (Cách nhau bằng dấu phẩy)</Label>
                <Input 
                  placeholder="VD: 1, 2, 5" 
                  value={formData.cashiers_input} 
                  onChange={e => setFormData({...formData, cashiers_input: e.target.value})} 
                />
                <p className="text-xs text-gray-500">Nhập ID của các thu ngân sẽ làm trong ca này.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting || templates.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Xác nhận
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ca</TableHead>
                <TableHead>Mẫu ca</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Thu ngân</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">Chưa có ca làm việc nào.</TableCell>
                </TableRow>
              ) : (
                shifts.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold">#{s.id}</TableCell>
                    <TableCell>{s.template?.name || "N/A"}</TableCell>
                    <TableCell>{formatDate(s.shift_date).split(',')[0]}</TableCell>
                    <TableCell>{s.template?.start_time} - {s.template?.end_time}</TableCell>
                    <TableCell>
                      {s.cashiers && s.cashiers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {s.cashiers.map((c: any) => (
                            <span key={c.id} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                              {c.full_name || `ID: ${c.id}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa gán</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.shift_status === "OPEN" ? "success" : "secondary"}>
                        {s.shift_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Templates Tab ──────────────────────────────────────────────────────────
function TemplatesTab({ templates, onReload, loading }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await shiftService.createTemplate({
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: true
      });
      toast.success("Tạo mẫu ca thành công!");
      setIsOpen(false);
      setFormData({ name: "", start_time: "", end_time: "" });
      onReload();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo mẫu ca");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cấu hình Mẫu ca</CardTitle>
          <CardDescription>Định nghĩa các khung giờ làm việc cố định (Sáng, Chiều, Tối...)</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" /> Thêm mẫu ca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm mẫu ca mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên mẫu ca</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Ca Sáng" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ bắt đầu</Label>
                  <Input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Giờ kết thúc</Label>
                  <Input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Lưu cấu hình
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên ca</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">Chưa có mẫu ca nào được định nghĩa.</TableCell>
                </TableRow>
              ) : (
                templates.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.start_time} - {t.end_time}</TableCell>
                    <TableCell>
                      <Badge variant={t.is_active ? "success" : "secondary"}>
                        {t.is_active ? "Hoạt động" : "Tạm ngưng"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
