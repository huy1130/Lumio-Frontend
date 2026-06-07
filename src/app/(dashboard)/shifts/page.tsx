"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Loader2, Calendar, Settings, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { shiftService, type ApiShiftTemplate, type ApiShift } from "@/lib/services/shiftService";
import { userService, type StaffMember } from "@/lib/services/userService";
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
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "shifts"
                  ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              Lịch làm việc
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "templates"
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

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const getWeekDays = (start: Date) => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentWeekStart);

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    template_id: "",
    shift_date: new Date().toISOString().split('T')[0],
    selected_cashiers: [] as number[],
  });

  const openModal = (templateId?: number, dateStr?: string, existingShift?: any) => {
    setShowDeleteConfirm(false);
    if (existingShift) {
      setFormData({
        id: existingShift.id,
        template_id: String(existingShift.template_id || existingShift.template?.id || templateId || ""),
        shift_date: dateStr || existingShift.shift_date,
        selected_cashiers: existingShift.cashiers?.map((c: any) => c.id) || []
      });
    } else {
      setFormData({
        id: undefined,
        template_id: templateId ? String(templateId) : "",
        shift_date: dateStr || new Date().toISOString().split('T')[0],
        selected_cashiers: []
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen && shopId && staffList.length === 0) {
      setIsLoadingStaff(true);
      userService.getStaffByShop(shopId)
        .then(res => setStaffList(res.data || []))
        .catch(err => toast.error("Lỗi tải danh sách nhân viên"))
        .finally(() => setIsLoadingStaff(false));
    }
  }, [isOpen, shopId, staffList.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await shiftService.updateShift(formData.id, {
          template_id: Number(formData.template_id),
          shift_date: formData.shift_date,
          cashiers: formData.selected_cashiers,
        });
        toast.success("Cập nhật ca làm việc thành công!");
      } else {
        await shiftService.createShift({
          shop_id: shopId,
          template_id: Number(formData.template_id),
          shift_date: formData.shift_date,
          cashiers: formData.selected_cashiers,
          shift_status: "OPEN"
        });
        toast.success("Tạo ca làm việc thành công!");
      }
      setIsOpen(false);
      onReload();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý ca làm việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    setIsDeleting(true);
    try {
      await shiftService.deleteShift(formData.id);
      toast.success("Xóa ca làm việc thành công!");
      setIsOpen(false);
      setShowDeleteConfirm(false);
      onReload();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa ca");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCashier = (id: number) => {
    setFormData(prev => {
      const isSelected = prev.selected_cashiers.includes(id);
      if (isSelected) {
        return { ...prev, selected_cashiers: prev.selected_cashiers.filter(c => c !== id) };
      } else {
        return { ...prev, selected_cashiers: [...prev.selected_cashiers, id] };
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 dark:bg-gray-800/50 border-b gap-4">
        <div>
          <CardTitle>Lịch làm việc</CardTitle>
          <CardDescription>Các ca làm việc trong tuần của chi nhánh</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border rounded-md p-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {weekDays[0].toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })} - {weekDays[6].toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 w-full sm:w-auto" onClick={() => openModal()}>
            <Calendar className="h-4 w-4" /> Mở ca mới
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              {showDeleteConfirm ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                      <Trash2 className="h-5 w-5" /> Xác nhận xóa
                    </DialogTitle>
                    <DialogDescription className="py-4 text-sm text-gray-600 dark:text-gray-300">
                      Bạn có chắc chắn muốn xóa ca làm việc này không? Các nhân viên đã được phân công sẽ bị gỡ khỏi ca.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-2 flex sm:justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                      Quay lại
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Xác nhận xóa
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>{formData.id ? "Chỉnh sửa ca làm việc" : "Mở ca làm việc"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Ngày làm việc</Label>
                      <Input type="date" value={formData.shift_date} onChange={e => setFormData({ ...formData, shift_date: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Mẫu ca</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.template_id}
                        onChange={e => setFormData({ ...formData, template_id: e.target.value })}
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
                      <Label>Chọn nhân viên làm ca</Label>
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800/50">
                        {isLoadingStaff ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          </div>
                        ) : staffList.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">Không tìm thấy nhân viên nào.</p>
                        ) : (
                          staffList.map(staff => (
                            <label key={staff.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                checked={formData.selected_cashiers.includes(staff.id)}
                                onChange={() => toggleCashier(staff.id)}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {staff.full_name || staff.username}
                                </span>
                                {staff.full_name && (
                                  <span className="text-xs text-gray-500">@{staff.username}</span>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <DialogFooter className="flex items-center justify-between sm:justify-between">
                      {formData.id ? (
                        <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting || isSubmitting}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Xóa ca
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                        <Button type="submit" disabled={isSubmitting || templates.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Lưu lại
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Chưa có mẫu ca nào. Vui lòng sang tab "Cấu hình mẫu ca" để tạo trước khi lên lịch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[900px] border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px] border-r border-b bg-white dark:bg-gray-900 text-center font-semibold align-middle sticky left-0 z-10 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#1f2937]">
                    Ca \ Ngày
                  </TableHead>
                  {weekDays.map((day, idx) => {
                    const localDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const isToday = localDateStr === new Date().toLocaleDateString('en-CA');
                    return (
                      <TableHead key={idx} className={`border-r border-b text-center min-w-[120px] ${isToday ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'bg-white dark:bg-gray-900'}`}>
                        <div className="flex flex-col items-center justify-center py-2">
                          <span className={`text-xs ${isToday ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}
                          </span>
                          <span className={`text-lg font-semibold ${isToday ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'}`}>
                            {day.getDate()}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: any) => (
                  <TableRow key={template.id} className="hover:bg-transparent">
                    <TableCell className="border-r border-b bg-gray-50 dark:bg-gray-800/50 align-top p-4 sticky left-0 z-10 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#1f2937]">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1 font-medium">{template.start_time} - {template.end_time}</div>
                    </TableCell>
                    {weekDays.map((day, idx) => {
                      const localDateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                      const shiftsInCell = shifts.filter((s: any) => {
                        if (s.template_id !== template.id && s.template?.name !== template.name) return false;
                        return s.shift_date && s.shift_date.startsWith(localDateStr);
                      });

                      const isToday = localDateStr === new Date().toLocaleDateString('en-CA');

                      return (
                        <TableCell key={idx} className={`border-r border-b align-top p-2 h-28 group relative ${isToday ? 'bg-orange-50/20 dark:bg-orange-900/5' : ''}`}>
                          <div className="flex flex-col gap-2 min-h-full h-full pb-6">
                            {shiftsInCell.map((shift: any) => (
                              <div
                                key={shift.id}
                                className="bg-white dark:bg-gray-800 border rounded p-2 shadow-sm group/card cursor-pointer hover:border-orange-400 hover:shadow-md transition-all relative"
                                onClick={() => openModal(template.id, localDateStr, shift)}
                                title="Bấm để sửa ca"
                              >
                                <button className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 p-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 hover:text-orange-600 transition-opacity">
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                {shift.cashiers && shift.cashiers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {shift.cashiers.map((c: any) => (
                                      <Badge key={c.id} variant="secondary" className="text-[10px] font-normal px-1.5 py-0.5 leading-tight">
                                        {c.full_name || c.username}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-red-500 italic block mt-1">Chưa phân công</span>
                                )}
                              </div>
                            ))}

                            <button
                              onClick={() => openModal(template.id, localDateStr)}
                              title="Thêm ca"
                              className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-600 transition-opacity bg-white dark:bg-gray-800 border shadow-sm"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Ca Sáng" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ bắt đầu</Label>
                  <Input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Giờ kết thúc</Label>
                  <Input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required />
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
