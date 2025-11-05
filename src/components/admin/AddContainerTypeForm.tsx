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
  const [state, formAction] = useFormState<FormResult, FormData>(
    actionWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [isTapered, setIsTapered] = useState(false);
  const [unit, setUnit] = useState<"inches" | "mm">("inches");

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
            Code Prefix *{" "}
            <span className="font-normal text-gray-500">
              (for auto-numbering)
            </span>
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
          Icon{" "}
          <span className="font-normal text-gray-500">
            (search any Lucide icon name or choose a preset)
          </span>
        </label>
        <div className="flex items-center gap-3">
          <input
            id="iconKey"
            name="iconKey"
            list="icon-presets"
            placeholder="e.g., Package, Box, Archive, Briefcase"
            className={inputClass + " flex-1"}
          />
          <div className="flex h-9 w-9 items-center justify-center rounded border bg-white">
            {/* Live preview from text input using formRef */}
            <IconPreview formRef={formRef} />
          </div>
        </div>
        <datalist id="icon-presets">
          {ICON_OPTIONS.map((opt: (typeof ICON_OPTIONS)[number]) => (
            <option key={opt.value} value={opt.value} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-gray-500">
          Tip: You can type any Lucide icon name (e.g., Package, Truck,
          Archive).
        </p>
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Dimensions ({unit}) {!isTapered && "— Rectangular Box"}
            {isTapered && "— Tapered Container"}
          </h3>
          <div className="flex items-center gap-2 rounded border bg-gray-50 px-2 py-1">
            <button
              type="button"
              onClick={() => setUnit("inches")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                unit === "inches"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit("mm")}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                unit === "mm"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              mm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 3D Visual */}
          <div className="flex items-center justify-center rounded bg-gray-50 p-4">
            {!isTapered ? <Dimensions3DBox /> : <Dimensions3DTapered />}
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            {!isTapered ? (
              <>
                <div>
                  <label htmlFor="length" className={labelClass}>
                    Length (L)
                  </label>
                  <input
                    id="length"
                    name="length"
                    type="number"
                    min={1}
                    placeholder="e.g., 24"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="width" className={labelClass}>
                    Width (W)
                  </label>
                  <input
                    id="width"
                    name="width"
                    type="number"
                    min={1}
                    placeholder="e.g., 16"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="height" className={labelClass}>
                    Height (H)
                  </label>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    min={1}
                    placeholder="e.g., 12"
                    className={inputClass}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-medium text-gray-600">
                  Top Opening:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="topLength" className={labelClass}>
                      Top Length
                    </label>
                    <input
                      id="topLength"
                      name="topLength"
                      type="number"
                      min={1}
                      placeholder="e.g., 24"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="topWidth" className={labelClass}>
                      Top Width
                    </label>
                    <input
                      id="topWidth"
                      name="topWidth"
                      type="number"
                      min={1}
                      placeholder="e.g., 16"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-600">
                  Bottom Base:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bottomLength" className={labelClass}>
                      Bottom Length
                    </label>
                    <input
                      id="bottomLength"
                      name="bottomLength"
                      type="number"
                      min={1}
                      placeholder="e.g., 20"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="bottomWidth" className={labelClass}>
                      Bottom Width
                    </label>
                    <input
                      id="bottomWidth"
                      name="bottomWidth"
                      type="number"
                      min={1}
                      placeholder="e.g., 13"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="height" className={labelClass}>
                    Overall Height (H)
                  </label>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    min={1}
                    placeholder="e.g., 12"
                    className={inputClass}
                  />
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

// Simple 3D Box Visualization - Wireframe Style
function Dimensions3DBox() {
  return (
    <div className="relative" style={{ width: 220, height: 220 }}>
      <svg viewBox="0 0 240 240" className="h-full w-full">
        {/* Back face - wireframe */}
        <path
          d="M 60 60 L 160 60 L 160 160 L 60 160 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
        {/* Top face - wireframe */}
        <path
          d="M 60 60 L 100 30 L 200 30 L 160 60 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
        {/* Right face - wireframe */}
        <path
          d="M 160 60 L 200 30 L 200 130 L 160 160 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />

        {/* Dimension lines and labels */}
        {/* Length line (bottom) */}
        <line
          x1="60"
          y1="175"
          x2="160"
          y2="175"
          stroke="#2563eb"
          strokeWidth="2"
          strokeDasharray="none"
        />
        <line
          x1="60"
          y1="170"
          x2="60"
          y2="180"
          stroke="#2563eb"
          strokeWidth="2"
        />
        <line
          x1="160"
          y1="170"
          x2="160"
          y2="180"
          stroke="#2563eb"
          strokeWidth="2"
        />
        <text
          x="110"
          y="195"
          fontSize="18"
          fill="#2563eb"
          textAnchor="middle"
          fontWeight="bold"
        >
          L
        </text>

        {/* Width line (right side) */}
        <line
          x1="215"
          y1="30"
          x2="215"
          y2="130"
          stroke="#10b981"
          strokeWidth="2"
        />
        <line
          x1="210"
          y1="30"
          x2="220"
          y2="30"
          stroke="#10b981"
          strokeWidth="2"
        />
        <line
          x1="210"
          y1="130"
          x2="220"
          y2="130"
          stroke="#10b981"
          strokeWidth="2"
        />
        <text
          x="230"
          y="85"
          fontSize="18"
          fill="#10b981"
          textAnchor="start"
          fontWeight="bold"
        >
          W
        </text>

        {/* Height line (left side) */}
        <line
          x1="45"
          y1="60"
          x2="45"
          y2="160"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <line
          x1="40"
          y1="60"
          x2="50"
          y2="60"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <line
          x1="40"
          y1="160"
          x2="50"
          y2="160"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <text
          x="28"
          y="115"
          fontSize="18"
          fill="#f59e0b"
          textAnchor="middle"
          fontWeight="bold"
        >
          H
        </text>
      </svg>
    </div>
  );
}

// 3D Tapered Container Visualization - Wireframe Style (Bottom Opening Larger)
function Dimensions3DTapered() {
  return (
    <div className="relative" style={{ width: 220, height: 220 }}>
      <svg viewBox="0 0 240 240" className="h-full w-full">
        {/* Back face (trapezoid - wider at bottom) */}
        <path
          d="M 80 40 L 140 40 L 160 150 L 60 150 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
        {/* Top face (smaller top opening) */}
        <path
          d="M 80 40 L 110 20 L 170 20 L 140 40 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
        {/* Right face (trapezoid) */}
        <path
          d="M 140 40 L 170 20 L 190 130 L 160 150 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
        {/* Bottom face (larger bottom base) */}
        <path
          d="M 60 150 L 90 130 L 190 130 L 160 150 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />

        {/* Dimension lines and labels */}
        {/* Top opening label */}
        <line
          x1="80"
          y1="35"
          x2="140"
          y2="35"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        <line
          x1="80"
          y1="30"
          x2="80"
          y2="40"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        <line
          x1="140"
          y1="30"
          x2="140"
          y2="40"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        <text
          x="110"
          y="20"
          fontSize="16"
          fill="#8b5cf6"
          textAnchor="middle"
          fontWeight="bold"
        >
          Top
        </text>

        {/* Bottom base label */}
        <line
          x1="60"
          y1="165"
          x2="160"
          y2="165"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <line
          x1="60"
          y1="160"
          x2="60"
          y2="170"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <line
          x1="160"
          y1="160"
          x2="160"
          y2="170"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <text
          x="110"
          y="185"
          fontSize="16"
          fill="#ec4899"
          textAnchor="middle"
          fontWeight="bold"
        >
          Bottom
        </text>

        {/* Height line */}
        <line
          x1="45"
          y1="40"
          x2="45"
          y2="150"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <line
          x1="40"
          y1="40"
          x2="50"
          y2="40"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <line
          x1="40"
          y1="150"
          x2="50"
          y2="150"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <text
          x="28"
          y="100"
          fontSize="18"
          fill="#f59e0b"
          textAnchor="middle"
          fontWeight="bold"
        >
          H
        </text>
      </svg>
    </div>
  );
}

// Live icon preview component reads current iconKey value from the form
function IconPreview({
  formRef,
}: {
  formRef: React.RefObject<HTMLFormElement>;
}) {
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
