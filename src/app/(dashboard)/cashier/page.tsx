"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Shield, Plus, Loader2, MoreHorizontal } from "lucide-react";
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

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Nhân viên / Thu ngân
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Quản lý tài khoản thu ngân cho chi nhánh của bạn.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Plus className="h-4 w-4" /> Thêm thu ngân
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
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6}
                  />
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

        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhân viên</CardTitle>
            <CardDescription>
              Quản lý các tài khoản thu ngân và nhân viên trong chi nhánh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStaff ? (
              <div className="py-16 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Chưa có nhân viên nào</p>
                <p className="text-sm text-gray-400">Hãy thêm nhân viên đầu tiên bằng nút "Thêm thu ngân" phía trên.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                            {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : staff.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{staff.full_name || "Chưa cập nhật"}</p>
                            <p className="text-sm text-gray-500">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{staff.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {staff.role?.description || staff.role?.role_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staff.is_active ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            Ngừng h.động
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(staff.created_at).toLocaleDateString("vi-VN")}
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
