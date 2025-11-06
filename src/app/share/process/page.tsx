// WHY: Process content shared from other apps
// WHAT: UI for handling shared photos, text, or URLs to add as items
// HOW: Reads query params from share target, provides form to create item
// GOTCHA: Shared files are in memory, need to upload to storage

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Share2, Image as ImageIcon, FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ShareProcessPage() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const text = searchParams.get("text");
  const url = searchParams.get("url");
  const hasMedia = searchParams.get("hasMedia") === "true";

  const [itemName, setItemName] = useState(title || "");
  const [description, setDescription] = useState(text || "");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Share2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Shared Content</h1>
          <p className="text-sm text-gray-600">
            Add this to your inventory
          </p>
        </div>
      </div>

      {/* Shared data preview */}
      <div className="mb-6 space-y-3">
        {title && (
          <div className="flex items-start gap-2 rounded-lg border bg-gray-50 p-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-500">Title</div>
              <div className="break-words text-sm">{title}</div>
            </div>
          </div>
        )}

        {text && (
          <div className="flex items-start gap-2 rounded-lg border bg-gray-50 p-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-500">Text</div>
              <div className="break-words text-sm">{text}</div>
            </div>
          </div>
        )}

        {url && (
          <div className="flex items-start gap-2 rounded-lg border bg-gray-50 p-3">
            <LinkIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-500">URL</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-blue-600 hover:underline"
              >
                {url}
              </a>
            </div>
          </div>
        )}

        {hasMedia && (
          <div className="flex items-start gap-2 rounded-lg border bg-blue-50 p-3">
            <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-blue-600">Media Attached</div>
              <div className="text-sm text-blue-800">
                Photos/videos were shared (upload feature coming soon)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create item form */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Create Item</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Item Name</label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="What is this item?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
            />
          </div>

          {url && (
            <div>
              <label className="mb-1 block text-sm font-medium">Reference URL</label>
              <Input value={url} readOnly className="bg-gray-50" />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button className="flex-1" disabled={!itemName.trim()}>
              Add to Inventory
            </Button>
            <Button variant="outline" onClick={() => window.close()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>💡 Tip:</strong> You can share photos, links, or text from any app to
        WheresMy. Just tap "Share" and select WheresMy from the share menu.
      </div>
    </main>
  );
}
