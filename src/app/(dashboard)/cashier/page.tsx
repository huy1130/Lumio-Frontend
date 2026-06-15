"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Shield, Plus, Loader2, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { userService, StaffMember } from "@/lib/services/userService";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const adminStats = [
  { title: "Total Cashiers",  value: "186", change: 12, changeLabel: "this month",   icon: <Users className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Active",       value: "172", change: 11, changeLabel: "this month",   icon: <UserCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Inactive",     value: "14",  change: 1,  changeLabel: "this month",   icon: <UserX className="h-4 w-4" />,     iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
  { title: "Roles",        value: "5",   change: 0,  changeLabel: "role types",   icon: <Shield className="h-4 w-4" />,    iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function CashierPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <CashierContent />
    </AccessGuard>
  );
}

function CashierContent() {
  const { role } = useAuth();
  if (role === "shop_owner") return <ShopOwnerCashierView />;
  
  return (
    <PlaceholderPage
      title="Thu ngân"
      description="Quản lý tài khoản thu ngân trên hệ thống"
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Cashiers" }]}
      stats={adminStats}
      tableTitle="Danh sách thu ngân"
    />
  );
}

function ShopOwnerCashierView() {
  const { user } = useAuth();
  const shopId = user?.shop_id;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });

  const fetchStaff = async () => {
    if (!shopId) return;
    setIsLoadingStaff(true);
    try {
      const response = await userService.getStaffByShop(shopId);
      setStaffList(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải danh sách nhân viên");
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchStaff();
    }
  }, [shopId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      toast.error("Không tìm thấy thông tin cửa hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.createCashier({
        ...formData,
        shop_id: shopId
      });
      toast.success("Tạo tài khoản thu ngân thành công!");
      setIsOpen(false);
      setFormData({ username: "", email: "", password: "", full_name: "" });
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi tạo tài khoản");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-1.5">
              <span>Quản lý Cửa hàng</span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-gray-900 dark:text-gray-200">Nhân sự</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Danh sách Thu ngân
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              Quản lý tài khoản đăng nhập vào hệ thống bán hàng (POS) của chi nhánh.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm rounded-xl px-5 h-10 font-semibold transition-all active:scale-95">
                <Plus className="h-4 w-4" /> Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm tài khoản thu ngân</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản mới để nhân viên có thể đăng nhập vào hệ thống bán hàng (POS).
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập (Username) <span className="text-red-500">*</span></Label>
                  <Input 
                    id="username" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    minLength={3}
                    placeholder="VD: thungan_01" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    placeholder="VD: nhanvien@example.com" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPw ? "text" : "password"} 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và tên</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    placeholder="VD: Nguyễn Văn A" 
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                    Hủy
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Xác nhận tạo
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden dark:bg-gray-900/50">
          <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 pb-5 bg-white/50 dark:bg-gray-900/50">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Danh sách nhân viên</CardTitle>
            <CardDescription className="text-[13px]">
              Hiển thị tất cả nhân viên thu ngân đang thuộc quyền quản lý của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingStaff ? (
              <div className="py-20 flex flex-col justify-center items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="text-sm font-medium text-gray-500">Đang tải danh sách...</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Chưa có nhân viên nào</p>
                <p className="text-sm text-gray-500 max-w-sm">Hãy thêm nhân viên đầu tiên bằng nút "Thêm nhân viên" phía trên để họ có thể đăng nhập POS.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <TableHead className="font-semibold text-gray-600 dark:text-gray-400 pl-6 h-12">Nhân viên</TableHead>
                    <TableHead className="font-semibold text-gray-600 dark:text-gray-400 h-12">Tên đăng nhập</TableHead>
                    <TableHead className="font-semibold text-gray-600 dark:text-gray-400 h-12">Vai trò</TableHead>
                    <TableHead className="font-semibold text-gray-600 dark:text-gray-400 h-12">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-gray-600 dark:text-gray-400 pr-6 h-12 text-right">Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm transition-transform hover:scale-105">
                            {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : staff.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{staff.full_name || "Chưa cập nhật"}</span>
                            <span className="text-xs font-medium text-gray-500 mt-0.5">{staff.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">@{staff.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50/80 text-blue-700 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 rounded-md px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                          {(staff.role?.description || staff.role?.role_code || "").replace(/nhân viên cửa hàng/i, "Nhân viên")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staff.is_active ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Hoạt động</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="text-[13px] font-semibold text-gray-500">Đã khóa</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] font-medium text-gray-500 pr-6 text-right">
                        {new Date(staff.created_at).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
