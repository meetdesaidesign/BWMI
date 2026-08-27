"use client";

import { useState } from "react";
import { Button } from "antd-mobile";
import { OverlaySheet } from "./overlay-sheet";
import { PinLoader } from "./pin-loader";
import { WARD_CENTER } from "@/lib/geo";
import type { getCopy } from "@/lib/i18n";

/** Manual location recovery for denied permission and low-accuracy fixes. */
export function PinSheet({
  open,
  t,
  center,
  onClose,
  onConfirm,
}: {
  open: boolean;
  t: ReturnType<typeof getCopy>;
  center: [number, number] | null;
  onClose: () => void;
  onConfirm: (point: [number, number]) => void;
}) {
  const [point, setPoint] = useState<[number, number]>(center ?? WARD_CENTER);

  return (
    <OverlaySheet
      open={open}
      title={t.pinTitle}
      onClose={onClose}
      closeLabel={t.close}
      footer={
        <Button block color="primary" size="large" className="primary-button" onClick={() => onConfirm(point)}>
          {t.pinConfirm}
        </Button>
      }
    >
      <p className="type-body-md pin-help">{t.pinHelp}</p>
      {open && <PinLoader center={center ?? WARD_CENTER} onChange={setPoint} label={t.pinTitle} />}
    </OverlaySheet>
  );
}
