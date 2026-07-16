"use client";

import DatabaseSidebar, { DatabaseFile } from "@/components/database-sidebar";
import ExplanationPanel from "@/components/sql/explanation-panel";
import InputPrompt from "@/components/sql/input-prompt";
import LoadingPanel from "@/components/sql/loading-panel";
import ResultsPanel from "@/components/sql/result-panel";
import SQLPanel from "@/components/sql/sql-panel";
import { QueryResponse } from "@/types/agent";
import { Database, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [databases, setDatabases] = useState<DatabaseFile[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void fetch("/api/databases")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDatabases(data.data);
          setSelectedDatabase((current) => current || data.data[0]?.name || "");
        }
      });
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/databases", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error ?? "Upload failed.");
      setDatabases((current) => [...current, data.data]);
      setSelectedDatabase(data.data.name);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    if (!selectedDatabase) {
      setError("Choose or upload a database first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          databaseName: selectedDatabase,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setResponse(data.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to process request.",
      );
    } finally {
      setLoading(false);
    }
  };
  const resetChat = () => {
    setQuestion("");
    setResponse(null);
    setError("");
    setLoading(false);
  };
  console.log(response);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background backdrop-blur-sm border-b border-slate-200 lg:left-80 lg:right-96">
        <div className="mx-auto px-5 lg:px-10 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              What would you like to know?
            </h1>
            <p className=" text-sm text-slate-500">
              Select a database on the left, then ask in plain English.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 bg-gray-100 px-3 py-2 font-bold flex items-center gap-2">
              <Database className="size-4" />
              {selectedDatabase
                ? selectedDatabase.replace(/^\d+-/, "")
                : "No database selected"}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={resetChat}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>
      <main className="min-h-screen bg-slate-50 text-slate-950 lg:flex lg:pr-96">
        <DatabaseSidebar
          databases={databases}
          selectedDatabase={selectedDatabase}
          uploading={uploading}
          onSelect={setSelectedDatabase}
          onUpload={handleUpload}
        />
        <section className="flex min-h-screen min-w-0 flex-1 pt-16 py-10 flex-col">
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 lg:px-10">
            <div className="space-y-6 pb-36">
              {loading && <LoadingPanel />}

              {response && (
                <>
                  <SQLPanel sql={response.sql} />

                  <ResultsPanel
                    rows={response.rows}
                    rowCount={response.rowCount}
                    databaseName={selectedDatabase.replace(/^\d+-/, "")}
                  />
                </>
              )}
              {!loading && !response && (
                <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <div className="grid size-12 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Sparkles className="size-6" />
                  </div>
                  <h2 className="mt-4 font-semibold">
                    Your analysis will appear here
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    The assistant will inspect the schema, generate a safe SQL
                    query, and explain the results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <div className="hidden lg:block fixed top-0 right-0 h-screen w-96 border-l border-slate-200 bg-background overflow-y-auto p-6">
        <ExplanationPanel answer={response?.explanation ?? ""} />
      </div>
      <InputPrompt
        question={question}
        loading={loading}
        error={error}
        onQuestionChange={setQuestion}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// Fixed right explanation panel is rendered outside the main layout so it
// doesn't affect page flow and remains visible on large screens.
