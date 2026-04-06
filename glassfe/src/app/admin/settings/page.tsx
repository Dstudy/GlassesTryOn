"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Store, Mail, Bell, Shield, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Spectra Specs",
    storeEmail: "admin@spectraspecs.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Main Street, City, State 12345",
    storeDescription: "Stylish Eyewear for Every Vision",
    notifications: {
      newOrders: true,
      lowStock: true,
      customerMessages: false,
      systemUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: "strong",
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    // In real app, show success toast
  };

  const updateSetting = (path: string, value: any) => {
    setSettings((prev) => {
      const keys = path.split(".");
      const newSettings = { ...prev };
      // Use `any` for dynamic nested updates to satisfy TS and keep code concise
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your store settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => updateSetting("storeName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="storeEmail">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => updateSetting("storeEmail", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="storePhone">Store Phone</Label>
              <Input
                id="storePhone"
                value={settings.storePhone}
                onChange={(e) => updateSetting("storePhone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="storeAddress">Store Address</Label>
              <Input
                id="storeAddress"
                value={settings.storeAddress}
                onChange={(e) => updateSetting("storeAddress", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) =>
                  updateSetting("storeDescription", e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newOrders">New Orders</Label>
                <p className="text-sm text-gray-500">
                  Get notified when new orders are placed
                </p>
              </div>
              <Switch
                id="newOrders"
                checked={settings.notifications.newOrders}
                onCheckedChange={(checked) =>
                  updateSetting("notifications.newOrders", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStock">Low Stock Alerts</Label>
                <p className="text-sm text-gray-500">
                  Get notified when products are running low
                </p>
              </div>
              <Switch
                id="lowStock"
                checked={settings.notifications.lowStock}
                onCheckedChange={(checked) =>
                  updateSetting("notifications.lowStock", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="customerMessages">Customer Messages</Label>
                <p className="text-sm text-gray-500">
                  Get notified when customers send messages
                </p>
              </div>
              <Switch
                id="customerMessages"
                checked={settings.notifications.customerMessages}
                onCheckedChange={(checked) =>
                  updateSetting("notifications.customerMessages", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemUpdates">System Updates</Label>
                <p className="text-sm text-gray-500">
                  Get notified about system updates and maintenance
                </p>
              </div>
              <Switch
                id="systemUpdates"
                checked={settings.notifications.systemUpdates}
                onCheckedChange={(checked) =>
                  updateSetting("notifications.systemUpdates", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  updateSetting("security.twoFactorAuth", checked)
                }
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  updateSetting(
                    "security.sessionTimeout",
                    parseInt(e.target.value)
                  )
                }
                className="w-32"
              />
            </div>
            <div>
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <select
                id="passwordPolicy"
                value={settings.security.passwordPolicy}
                onChange={(e) =>
                  updateSetting("security.passwordPolicy", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="basic">Basic (6+ characters)</option>
                <option value="medium">Medium (8+ characters, numbers)</option>
                <option value="strong">
                  Strong (8+ characters, numbers, symbols)
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Support Email</Label>
                <Input value="support@spectraspecs.com" disabled />
              </div>
              <div>
                <Label>Support Phone</Label>
                <Input value="+1 (555) 123-4567" disabled />
              </div>
            </div>
            <div className="mt-4">
              <Label>Business Hours</Label>
              <Input value="Monday - Friday: 9:00 AM - 6:00 PM" disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
