"use client";

import { BrainCircuit, BarChart3, MessageSquare, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessGuard } from "@/components/shared/AccessGuard";

const configs = [
  {
    icon: <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    title: "AI Chatbot",
    description: "Configure the AI-powered chatbot for cashier assistance and customer queries.",
    settings: [
      { label: "Enable Chatbot",        defaultOn: true  },
      { label: "Auto-suggest products", defaultOn: true  },
      { label: "Customer FAQ mode",     defaultOn: false },
      { label: "Multi-language",        defaultOn: false },
    ],
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
    title: "AI Visualization",
    description: "Configure AI-generated charts and analytics insights for all roles.",
    settings: [
      { label: "Enable AI Charts",      defaultOn: true  },
      { label: "Predictive analytics",  defaultOn: true  },
      { label: "Anomaly detection",     defaultOn: false },
      { label: "Auto-refresh data",     defaultOn: true  },
    ],
  },
  {
    icon: <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    title: "AI Automation",
    description: "Automate repetitive tasks using AI — reordering, report generation, alerts.",
    settings: [
      { label: "Auto reorder stock",    defaultOn: false },
      { label: "Report scheduling",     defaultOn: true  },
      { label: "Smart alerts",          defaultOn: true  },
      { label: "AI audit summaries",    defaultOn: false },
    ],
  },
];

export default function AIConfigPage() {
  return (
    <AccessGuard roles={["manager"]}>
      <AIConfigContent />
    </AccessGuard>
  );
}

function AIConfigContent() {
  return (
    <div>
      <Header />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Configure AI"
          description="Manage AI features and settings for the entire platform"
          role="manager"
          breadcrumbs={[{ label: "Manager" }, { label: "Configure AI" }]}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {configs.map((cfg) => (
            <Card key={cfg.title} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  {cfg.icon}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-indigo-500" />
                    {cfg.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">{cfg.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {cfg.settings.map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.label}</span>
                    <div className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${s.defaultOn ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${s.defaultOn ? "translate-x-4" : "translate-x-1"}`} />
                    </div>
                  </div>
                ))}
                <Button size="sm" className="w-full mt-2" variant="outline">Save Changes</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
