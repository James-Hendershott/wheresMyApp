"use client";

// WHY: Client form to create a Container Type with toasts and 3D visualization
import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ICON_OPTIONS } from "@/lib/iconKeys";
import { ContainerTypeIcon } from "@/components/ContainerTypeIcon";

type FormResult = { success?: string; error?: string };

export function AddContainerTypeForm({
  action,
}: {
  action: (formData: FormData) => Promise<FormResult>;
}) {
  const actionWrapper = async (_prev: FormResult, formData: FormData) => {
    return action(formData);
  };
  const [state, formAction] = useFormState<FormResult, FormData>(actionWrapper, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [isTapered, setIsTapered] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset();
      setIsTapered(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  const inputClass =
    "w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring";
  const buttonClass =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Container Name *
          </label>
          <input
            id="name"
            name="name"
            placeholder="e.g., 27 Gallon Tote"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="codePrefix" className={labelClass}>
            Code Prefix * <span className="font-normal text-gray-500">(for auto-numbering)</span>
          </label>
          <input
            id="codePrefix"
            name="codePrefix"
            placeholder="e.g., TOTE27"
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            New containers will be numbered: PREFIX-1, PREFIX-2, etc.
          </p>
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <label htmlFor="iconKey" className={labelClass}>
          Icon <span className="font-normal text-gray-500">(search any Lucide icon name or choose a preset)</span>
        </label>
        <div className="flex items-center gap-3">
          <input id="iconKey" name="iconKey" list="icon-presets" placeholder="e.g., Package, Box, Archive, Briefcase" className={inputClass + " flex-1"} />
          <div className="flex h-9 w-9 items-center justify-center rounded border bg-white">
            {/* Live preview from text input using formRef */}
            <IconPreview formRef={formRef} />
          </div>
        </div>
        <datalist id="icon-presets">
          {ICON_OPTIONS.map((opt: typeof ICON_OPTIONS[number]) => (
            <option key={opt.value} value={opt.value} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-gray-500">Tip: You can type any Lucide icon name (e.g., Package, Truck, Archive).</p>
      </div>

      {/* Container Shape Toggle */}
      <div className="rounded border bg-gray-50 p-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isTapered}
            onChange={(e) => setIsTapered(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">
            Tapered Container (totes, bins with sloped sides)
          </span>
        </label>
      </div>

      {/* Dimensions with 3D Visualization */}
      <div className="rounded border bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Dimensions (inches) {!isTapered && "— Rectangular Box"}
          {isTapered && "— Tapered Container"}
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 3D Visual */}
          <div className="flex items-center justify-center rounded bg-gray-50 p-4">
            {!isTapered ? (
              <Dimensions3DBox />
            ) : (
              <Dimensions3DTapered />
            )}
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            {!isTapered ? (
              <>
                <div>
                  <label htmlFor="length" className={labelClass}>Length (L)</label>
                  <input id="length" name="length" type="number" min={1} placeholder="e.g., 24" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="width" className={labelClass}>Width (W)</label>
                  <input id="width" name="width" type="number" min={1} placeholder="e.g., 16" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="height" className={labelClass}>Height (H)</label>
                  <input id="height" name="height" type="number" min={1} placeholder="e.g., 12" className={inputClass} />
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-medium text-gray-600">Top Opening:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="topLength" className={labelClass}>Top Length</label>
                    <input id="topLength" name="topLength" type="number" min={1} placeholder="e.g., 24" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="topWidth" className={labelClass}>Top Width</label>
                    <input id="topWidth" name="topWidth" type="number" min={1} placeholder="e.g., 16" className={inputClass} />
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600">Bottom Base:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bottomLength" className={labelClass}>Bottom Length</label>
                    <input id="bottomLength" name="bottomLength" type="number" min={1} placeholder="e.g., 20" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="bottomWidth" className={labelClass}>Bottom Width</label>
                    <input id="bottomWidth" name="bottomWidth" type="number" min={1} placeholder="e.g., 13" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="height" className={labelClass}>Overall Height (H)</label>
                  <input id="height" name="height" type="number" min={1} placeholder="e.g., 12" className={inputClass} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button type="submit" className={buttonClass}>
        Add Container Type
      </button>
    </form>
  );
}

// Simple 3D Box Visualization
function Dimensions3DBox() {
  return (
    <div className="relative" style={{ width: 180, height: 180 }}>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* Back face */}
        <path d="M 60 60 L 140 60 L 140 140 L 60 140 Z" fill="#d4a574" stroke="#8b6f47" strokeWidth="2" />
        {/* Top face */}
        <path d="M 60 60 L 100 30 L 180 30 L 140 60 Z" fill="#e6c9a8" stroke="#8b6f47" strokeWidth="2" />
        {/* Right face */}
        <path d="M 140 60 L 180 30 L 180 110 L 140 140 Z" fill="#c9a87c" stroke="#8b6f47" strokeWidth="2" />
        
        {/* Labels */}
        <text x="100" y="155" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">L</text>
        <text x="165" y="85" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">W</text>
        <text x="150" y="100" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">H</text>
      </svg>
    </div>
  );
}

// 3D Tapered Container Visualization
function Dimensions3DTapered() {
  return (
    <div className="relative" style={{ width: 180, height: 180 }}>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* Back face (trapezoid) */}
        <path d="M 70 50 L 130 50 L 140 140 L 60 140 Z" fill="#4a90e2" stroke="#2e5c8a" strokeWidth="2" />
        {/* Top face (top opening) */}
        <path d="M 70 50 L 100 30 L 160 30 L 130 50 Z" fill="#7ab8ff" stroke="#2e5c8a" strokeWidth="2" />
        {/* Right face (trapezoid) */}
        <path d="M 130 50 L 160 30 L 170 120 L 140 140 Z" fill="#5fa3e8" stroke="#2e5c8a" strokeWidth="2" />
        
        {/* Dimension lines and labels */}
        <line x1="70" y1="45" x2="130" y2="45" stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
        <text x="100" y="40" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Top</text>
        
        <line x1="60" y1="145" x2="140" y2="145" stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
        <text x="100" y="160" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Bottom</text>
        
        <text x="150" y="95" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">H</text>
      </svg>
    </div>
  );
}

// Live icon preview component reads current iconKey value from the form
function IconPreview({ formRef }: { formRef: React.RefObject<HTMLFormElement> }) {
  const [val, setVal] = useState<string | undefined>(undefined);
  useEffect(() => {
    const el = formRef.current?.querySelector<HTMLInputElement>("#iconKey");
    if (!el) return;
    const handler = () => setVal(el.value);
    handler();
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [formRef]);
  return <ContainerTypeIcon iconKey={val} className="h-5 w-5 text-gray-700" />;
}
