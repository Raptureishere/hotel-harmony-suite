import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Hotel,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Globe,
  Palette,
  Save,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { toggleDarkMode } from '@/features/ui/uiSlice';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { toast } = useToast();

  const [hotelName, setHotelName] = useState('Grand Hotel');
  const [hotelEmail, setHotelEmail] = useState('info@grandhotel.com');
  const [hotelPhone, setHotelPhone] = useState('+1 (555) 000-0000');
  const [hotelAddress, setHotelAddress] = useState('123 Grand Avenue, New York, NY 10001');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(false);
  const [occupancyReports, setOccupancyReports] = useState(true);

  const [taxRate, setTaxRate] = useState('10');
  const [lateFee, setLateFee] = useState('50');
  const [cancellationPolicy, setCancellationPolicy] = useState('24h');

  const handleSave = (section: string) => {
    toast({
      title: 'Settings saved',
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your hotel configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Hotel className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-accent" />
                Hotel Information
              </CardTitle>
              <CardDescription>
                Basic information about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelEmail">Contact Email</Label>
                  <Input
                    id="hotelEmail"
                    type="email"
                    value={hotelEmail}
                    onChange={(e) => setHotelEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelPhone">Phone Number</Label>
                  <Input
                    id="hotelPhone"
                    value={hotelPhone}
                    onChange={(e) => setHotelPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                      <SelectItem value="GBP">GBP — British Pound</SelectItem>
                      <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
                      <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotelAddress">Address</Label>
                <Input
                  id="hotelAddress"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-accent" />
                Operations
              </CardTitle>
              <CardDescription>
                Check-in/out times and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="gold" onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control what alerts and reports you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Alert Types
                </h4>
                {[
                  {
                    label: 'New Booking Alerts',
                    description: 'Get notified when a new booking is made',
                    value: bookingAlerts,
                    setter: setBookingAlerts,
                  },
                  {
                    label: 'Payment Alerts',
                    description: 'Notifications for payments and invoices',
                    value: paymentAlerts,
                    setter: setPaymentAlerts,
                  },
                  {
                    label: 'Maintenance Alerts',
                    description: 'Room maintenance requests and updates',
                    value: maintenanceAlerts,
                    setter: setMaintenanceAlerts,
                  },
                  {
                    label: 'Occupancy Reports',
                    description: 'Daily/weekly occupancy summaries',
                    value: occupancyReports,
                    setter: setOccupancyReports,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.setter}
                      disabled={!emailNotifications}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="gold" onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Billing & Policies
              </CardTitle>
              <CardDescription>
                Tax rates, fees, and cancellation policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Check-out Fee ($)</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    min="0"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Select value={cancellationPolicy} onValueChange={setCancellationPolicy}>
                    <SelectTrigger id="cancellationPolicy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible (free cancellation)</SelectItem>
                      <SelectItem value="24h">24 Hours Notice Required</SelectItem>
                      <SelectItem value="48h">48 Hours Notice Required</SelectItem>
                      <SelectItem value="72h">72 Hours Notice Required</SelectItem>
                      <SelectItem value="non-refundable">Non-refundable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="gold" onClick={() => handleSave('Billing')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage access control and authentication options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  label: 'Two-Factor Authentication',
                  description: 'Require 2FA for all staff logins',
                  defaultChecked: false,
                },
                {
                  label: 'Session Timeout',
                  description: 'Automatically log out after 30 minutes of inactivity',
                  defaultChecked: true,
                },
                {
                  label: 'IP Restriction',
                  description: 'Restrict access to specific IP addresses',
                  defaultChecked: false,
                },
                {
                  label: 'Audit Logging',
                  description: 'Log all staff actions for compliance',
                  defaultChecked: true,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Change Admin Password</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleSave('Password')}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the interface looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={() => dispatch(toggleDarkMode())}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'Gold', color: 'hsl(38, 92%, 50%)', active: true },
                    { name: 'Blue', color: 'hsl(217, 91%, 60%)', active: false },
                    { name: 'Green', color: 'hsl(152, 69%, 40%)', active: false },
                    { name: 'Purple', color: 'hsl(262, 83%, 58%)', active: false },
                    { name: 'Rose', color: 'hsl(346, 77%, 49%)', active: false },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        theme.active
                          ? 'border-accent bg-accent/5'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full relative flex items-center justify-center"
                        style={{ backgroundColor: theme.color }}
                      >
                        {theme.active && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Theme switching is a preview feature — Gold is the current active theme.
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="gold" onClick={() => handleSave('Appearance')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
