"use client";

import { useState } from "react";
import { Users, UserCheck, UserX, Shield, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/lib/services/userService";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const adminStats = [
  { title: "Total Users",  value: "186", change: 12, changeLabel: "this month",   icon: <Users className="h-4 w-4" />,     iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"     },
  { title: "Active",       value: "172", change: 11, changeLabel: "this month",   icon: <UserCheck className="h-4 w-4" />, iconClassName: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"  },
  { title: "Inactive",     value: "14",  change: 1,  changeLabel: "this month",   icon: <UserX className="h-4 w-4" />,     iconClassName: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"          },
  { title: "Roles",        value: "5",   change: 0,  changeLabel: "role types",   icon: <Shield className="h-4 w-4" />,    iconClassName: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
];

export default function UsersPage() {
  return (
    <AccessGuard roles={["admin", "shop_owner"]}>
      <UsersContent />
    </AccessGuard>
  );
}

function UsersContent() {
  const { role } = useAuth();
  if (role === "shop_owner") return <ShopOwnerUsersView />;
  
  return (
    <PlaceholderPage
      title="Users"
      description="Manage all system users and their roles"
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
      stats={adminStats}
      tableTitle="User List"
    />
  );
}

function ShopOwnerUsersView() {
  const { user } = useAuth();
  const shopId = user?.shop_id;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });

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
      // We don't have a GET endpoint to refresh the list yet, so we just show success.
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
              Hệ thống hiện tại đang xây dựng tính năng liệt kê danh sách nhân viên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Các tài khoản sau khi tạo thành công có thể đăng nhập ngay lập tức.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
