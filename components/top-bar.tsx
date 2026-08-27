"use client";

import { ArrowLeft } from "lucide-react";
import { NavBar } from "antd-mobile";
import type { ReactNode } from "react";

export function TopBar({ title, onBack, action }: { title: string; onBack: () => void; action?: ReactNode }) {
  return <header className="top-bar"><NavBar backArrow={<ArrowLeft size={21} />} onBack={onBack} right={action}>{title}</NavBar></header>;
}
