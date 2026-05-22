"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessGuard } from "@/components/shared/AccessGuard";
import { featureService } from "@/lib/services/featureService";
import type { ApiFeature, CreateFeaturePayload } from "@/types";
import { toast } from "sonner";

const EMPTY_FORM: CreateFeaturePayload = {
  feature_code: "",
  description: "",
  is_active: true,
};

export default function FeaturesPage() {
  return (
    <AccessGuard roles={["admin"]}>
      <FeaturesContent />
    </AccessGuard>
  );
}

function FeaturesContent() {
  const [features, setFeatures] = useState<ApiFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiFeature | null>(null);
  const [form, setForm] = useState<CreateFeaturePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApiFeature | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchFeatures() {
    setLoading(true);
    setError(null);
    try {
      const data = await featureService.getAll();
      setFeatures(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được features");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchFeatures();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(feature: ApiFeature) {
    setEditing(feature);
    setForm({
      feature_code: feature.feature_code,
      description: feature.description ?? "",
      is_active: feature.is_active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.feature_code.trim()) {
      setFormError("Vui lòng nhập feature_code.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreateFeaturePayload = {
        feature_code: form.feature_code.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        is_active: form.is_active ?? true,
      };

      if (editing) {
        const updated = await featureService.update(editing.id, payload);
        setFeatures((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f)),
        );
        toast.success("Đã cập nhật feature");
      } else {
        const created = await featureService.create(payload);
        setFeatures((prev) => [...prev, created]);
        toast.success("Đã tạo feature");
      }
      setModalOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lưu thất bại";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await featureService.remove(deleteTarget.id);
      setFeatures((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Đã xóa feature");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-auto px-2 py-0 text-xs"
              onClick={() => void fetchFeatures()}
            >
              Retry
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tính năng gói (Features)
              </CardTitle>
              <CardDescription>
                Catalog feature (vd. MAX_SHOPS). Gắn vào gói khi tạo subscription với
                max_shops.
              </CardDescription>
            </div>
            <Button className="gap-2" onClick={openCreate} disabled={loading}>
              <Plus className="h-4 w-4" /> Thêm feature
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải…
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Feature code</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-muted-foreground"
                      >
                        Chưa có feature. Tạo MAX_SHOPS hoặc thêm mới.
                      </TableCell>
                    </TableRow>
                  ) : (
                    features.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell className="text-muted-foreground">
                          #{feature.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{feature.feature_code}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate text-muted-foreground">
                          {feature.description ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={feature.is_active ? "success" : "secondary"}>
                            {feature.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => openEdit(feature)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => setDeleteTarget(feature)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa feature" : "Tạo feature"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="feature_code">Feature code *</Label>
              <Input
                id="feature_code"
                value={form.feature_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, feature_code: e.target.value }))
                }
                placeholder="MAX_SHOPS"
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-desc">Mô tả</Label>
              <Input
                id="f-desc"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="f-active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.is_active ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
              />
              <Label htmlFor="f-active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa feature?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Xóa <strong>{deleteTarget?.feature_code}</strong> có thể ảnh hưởng gói đã gắn.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
