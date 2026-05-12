"use client";

import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { ROLE_COLORS } from "@/config/roles";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <AccessGuard roles={["staff", "cashier"]}>
      <ProfileContent />
    </AccessGuard>
  );
}

function ProfileContent() {
  const { user, role } = useAuth();

  const avatarClass = cn(
    "flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold",
    ROLE_COLORS[role]
  );

  const roleLabel = role === "cashier" ? "Cashier" : "Staff";

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="My Profile"
          description="View and update your personal information"
          role={role}
          breadcrumbs={[{ label: roleLabel }, { label: "My Profile" }]}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="flex flex-col items-center p-6 gap-4">
            <div className={avatarClass}>{user.avatar}</div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <RoleBadge role={role} className="mt-1" />
            </div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={user.name} /></div>
                <div className="space-y-2"><Label>Email</Label><Input defaultValue={user.email} type="email" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="+84 000 000 000" /></div>
                <div className="space-y-2"><Label>Role</Label><Input defaultValue={roleLabel} disabled className="opacity-60" /></div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Leave blank to keep current" />
              </div>
              <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
