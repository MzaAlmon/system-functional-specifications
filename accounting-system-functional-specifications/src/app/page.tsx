"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { POSView } from "@/components/POSView";
import { InventoryView } from "@/components/InventoryView";
import { BarcodeView } from "@/components/BarcodeView";
import { SalesView } from "@/components/SalesView";
import { PurchasesView } from "@/components/PurchasesView";
import { PayrollView } from "@/components/PayrollView";
import { ExpensesView } from "@/components/ExpensesView";
import { BranchesView } from "@/components/BranchesView";
import { RolesView } from "@/components/RolesView";
import { SettingsView } from "@/components/SettingsView";
import { SpecsDocView } from "@/components/SpecsDocView";
import { CameraScannerModal } from "@/components/CameraScannerModal";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<number>(1);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Auto seed and load initial system master data
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // Trigger database auto-seed
        await fetch("/api/seed");

        // Load branches
        const bRes = await fetch("/api/branches");
        const bData = await bRes.json();
        if (Array.isArray(bData) && bData.length > 0) {
          setBranches(bData);
          setSelectedBranchId(bData[0].id);
        }

        // Load roles
        const rRes = await fetch("/api/roles");
        const rData = await rRes.json();
        if (Array.isArray(rData) && rData.length > 0) {
          setRoles(rData);
          setCurrentRoleId(rData[0].id);
        }

        // Load company settings
        const cRes = await fetch("/api/company-settings");
        const cData = await cRes.json();
        setCompanyInfo(cData);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };

    initializeSystem();
  }, []);

  const refreshBranches = async () => {
    const bRes = await fetch("/api/branches");
    const bData = await bRes.json();
    if (Array.isArray(bData)) setBranches(bData);
  };

  const refreshRoles = async () => {
    const rRes = await fetch("/api/roles");
    const rData = await rRes.json();
    if (Array.isArray(rData)) setRoles(rData);
  };

  const refreshSettings = async () => {
    const cRes = await fetch("/api/company-settings");
    const cData = await cRes.json();
    setCompanyInfo(cData);
  };

  const handleBarcodeScanResult = (barcode: string) => {
    setScannedBarcode(barcode);
    // Switch to POS or Inventory to show barcode search
    setActiveTab("pos");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header Navigation & Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        branches={branches}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        roles={roles}
        currentRoleId={currentRoleId}
        setCurrentRoleId={setCurrentRoleId}
        onOpenScanner={() => setScannerOpen(true)}
        companyInfo={companyInfo}
      />

      {/* Main Operational Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            selectedBranchId={selectedBranchId}
            branches={branches}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "pos" && (
          <POSView
            selectedBranchId={selectedBranchId}
            onOpenScanner={() => setScannerOpen(true)}
            companyInfo={companyInfo}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryView
            selectedBranchId={selectedBranchId}
            branches={branches}
          />
        )}

        {activeTab === "barcode" && (
          <BarcodeView onOpenScanner={() => setScannerOpen(true)} />
        )}

        {activeTab === "sales" && (
          <SalesView selectedBranchId={selectedBranchId} />
        )}

        {activeTab === "purchases" && (
          <PurchasesView selectedBranchId={selectedBranchId} />
        )}

        {activeTab === "payroll" && (
          <PayrollView selectedBranchId={selectedBranchId} branches={branches} />
        )}

        {activeTab === "expenses" && (
          <ExpensesView selectedBranchId={selectedBranchId} branches={branches} />
        )}

        {activeTab === "branches" && (
          <BranchesView branches={branches} onRefresh={refreshBranches} />
        )}

        {activeTab === "users_roles" && (
          <RolesView roles={roles} onRefresh={refreshRoles} branches={branches} />
        )}

        {activeTab === "settings" && (
          <SettingsView companyInfo={companyInfo} onRefresh={refreshSettings} />
        )}

        {activeTab === "specs_doc" && (
          <SpecsDocView onNavigateToTab={(tabId) => setActiveTab(tabId)} />
        )}
      </main>

      {/* Global Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScanResult}
      />
    </div>
  );
}
