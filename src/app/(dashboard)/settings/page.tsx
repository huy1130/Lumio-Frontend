"use client";

import { useState } from "react";
import { Save, Bell, Shield, Palette, Store, Users, Globe } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const settingsSections = [
  { id: "store", icon: Store, label: "Store" },
  { id: "users", icon: Users, label: "Users & Roles" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "security", icon: Shield, label: "Security" },
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "regional", icon: Globe, label: "Regional" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("store");

  return (
    <div>
      <Header />
      <div className="p-6">
        <div className="flex gap-6">
          {/* Settings sidebar */}
          <nav className="w-52 shrink-0">
            <ul className="space-y-1">
              {settingsSections.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
                        activeSection === s.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings content */}
          <div className="flex-1 space-y-6 max-w-2xl">
            {activeSection === "store" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>General information about your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Store Name</Label>
                        <Input defaultValue="My Coffee Shop" />
                      </div>
                      <div className="space-y-2">
                        <Label>Store Code</Label>
                        <Input defaultValue="STORE-001" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input defaultValue="123 Main Street, Ho Chi Minh City" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input defaultValue="+84 123 456 789" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue="info@mycoffeeshop.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input type="number" defaultValue="8" className="w-32" />
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Current plan and billing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-semibold">Professional Plan</p>
                        <p className="text-sm text-muted-foreground">$79/month · Renews Apr 14, 2026</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="success">Active</Badge>
                        <Button variant="outline" size="sm">Upgrade</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: "Users", used: 4, max: 10 },
                        { label: "Products", used: 6, max: 1000 },
                        { label: "Locations", used: 1, max: 5 },
                      ].map((u) => (
                        <div key={u.label} className="rounded-lg border p-3">
                          <p className="text-2xl font-bold">{u.used}<span className="text-sm text-muted-foreground font-normal">/{u.max}</span></p>
                          <p className="text-xs text-muted-foreground">{u.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>Users & Role Management</CardTitle>
                  <CardDescription>Manage team access and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Alice Manager", email: "manager@pos.com", role: "manager" },
                    { name: "Bob Admin", email: "admin@pos.com", role: "admin" },
                    { name: "Carol Staff", email: "staff@pos.com", role: "staff" },
                    { name: "Dave Cashier", email: "cashier@pos.com", role: "cashier" },
                  ].map((user) => (
                    <div key={user.email} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" /> Invite User
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what you get notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Low stock alerts", desc: "Get notified when stock falls below minimum" },
                    { label: "New orders", desc: "Receive alerts for incoming orders" },
                    { label: "Payment confirmations", desc: "Be notified when payments are processed" },
                    { label: "Daily sales report", desc: "Email summary at end of business day" },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <div className="w-11 h-6 rounded-full bg-primary cursor-pointer relative shrink-0">
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <Button className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="At least 8 characters" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">Enable 2FA</Button>
                  </div>
                  <Button className="gap-2"><Save className="h-4 w-4" /> Update Password</Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Light", "Dark", "System"].map((t) => (
                        <button
                          key={t}
                          className={`rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted ${t === "System" ? "border-primary ring-1 ring-primary" : ""}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {["bg-blue-500", "bg-violet-500", "bg-green-500", "bg-orange-500", "bg-rose-500"].map((c) => (
                        <button key={c} className={`h-8 w-8 rounded-full ${c} ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all`} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "regional" && (
              <Card>
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>Language, timezone, and currency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Language", defaultValue: "English (US)" },
                    { label: "Timezone", defaultValue: "Asia/Ho_Chi_Minh (UTC+7)" },
                    { label: "Currency", defaultValue: "USD ($)" },
                    { label: "Date Format", defaultValue: "MM/DD/YYYY" },
                  ].map((r) => (
                    <div key={r.label} className="space-y-2">
                      <Label>{r.label}</Label>
                      <Input defaultValue={r.defaultValue} />
                    </div>
                  ))}
                  <Button className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
