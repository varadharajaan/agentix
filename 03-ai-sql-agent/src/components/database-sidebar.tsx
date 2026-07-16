"use client";

import { Check, Database, FileUp, LoaderCircle } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

export type DatabaseFile = {
  name: string;
  size: number;
  isDefault: boolean;
};

type DatabaseSidebarProps = {
  databases: DatabaseFile[];
  selectedDatabase: string;
  uploading: boolean;
  onSelect: (name: string) => void;
  onUpload: (file: File) => Promise<void>;
};

function formatSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DatabaseSidebar({
  databases,
  selectedDatabase,
  uploading,
  onSelect,
  onUpload,
}: DatabaseSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (file) await onUpload(file);
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r bg-background border-slate-200 px-4 py-5 lg:sticky lg:top-0 lg:left-0 lg:h-screen lg:w-80 lg:overflow-y-auto">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-10 place-items-center rounded-xl bg-cyan-400 shadow-lg shadow-cyan-400/20">
          <Database className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-tight">SQL AI Assistant</p>
          <p className="text-xs text-slate-400">AI workspace</p>
        </div>
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".db,.sqlite,.sqlite3"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          void upload(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event: DragEvent) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event: DragEvent) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event: DragEvent) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-5 text-center transition ${dragging ? "border-cyan-300 bg-gray-200" : "border-gray-300 bg-gray-100 hover:border-gray-500"}`}
      >
        {uploading ? (
          <LoaderCircle className="mx-auto mb-3 size-6 animate-spin " />
        ) : (
          <FileUp className="mx-auto mb-3 size-6 " />
        )}
        <span className="block text-sm font-medium">
          {uploading ? "Adding database…" : "Drop a database here"}
        </span>
        <span className="mt-1 block text-xs ">
          or browse .db, .sqlite, .sqlite3
        </span>
      </button>

      <div className="mt-8 flex items-center justify-between px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          Databases
        </p>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-gray-300">
          {databases.length}
        </span>
      </div>
      <div className="mt-3 space-y-1 overflow-y-auto">
        {databases.map((database) => {
          const selected = database.name === selectedDatabase;
          return (
            <button
              type="button"
              key={database.name}
              onClick={() => onSelect(database.name)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${selected ? "bg-gray-100 text-slate-950" : "hover:bg-gray-200"}`}
            >
              <Database className="size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {database.isDefault
                    ? database.name
                    : database.name.replace(/^\d+-/, "")}
                </span>
                <span
                  className={`block text-xs ${selected ? "text-slate-700" : "text-slate-400"}`}
                >
                  {database.isDefault ? "Starter database" : "Uploaded"} ·{" "}
                  {formatSize(database.size)}
                </span>
              </span>
              {selected && <Check className="size-4 opacity-70" />}
            </button>
          );
        })}
      </div>
      <p className="mt-auto px-2 pt-6 text-xs leading-5 text-slate-500">
        Queries are read-only. Your source data is never changed.
      </p>
    </aside>
  );
}
