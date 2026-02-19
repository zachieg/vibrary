"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectRequest } from "@/lib/types";
import RequestCard from "@/components/RequestCard";
import RequestForm from "@/components/RequestForm";

interface RequestsClientProps {
  initialRequests: Omit<ProjectRequest, "requester_email">[];
}

export default function RequestsClient({ initialRequests }: RequestsClientProps) {
  const supabase = createClient();
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("project_requests")
      .select("id, title, description, tags, requester_name, status, fulfilled_by, upvotes, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setRequests(data);
    }
  }, [supabase]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber/10 via-coral/5 to-violet/10 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-12">
          <h1 className="font-serif text-3xl font-bold text-text-primary sm:text-4xl">
            What do you wish someone would vibecode?
          </h1>
          <p className="mt-3 text-text-secondary">
            Describe a project you want to see built. Vibecoders can browse
            requests and build what people actually want.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-6 inline-flex rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-coral/90 hover:shadow-md"
          >
            {showForm ? "Cancel" : "Submit a Request"}
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-12">
        {/* Request Form */}
        {showForm && (
          <div className="mb-8 animate-slide-up rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <RequestForm
              onSuccess={() => {
                setShowForm(false);
                fetchRequests();
              }}
            />
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-amber" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <h3 className="mt-4 font-serif text-xl font-bold text-text-primary">
              No requests yet
            </h3>
            <p className="mt-2 text-text-secondary">
              Be the first to request a vibecoded project!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                id={request.id}
                title={request.title}
                description={request.description}
                tags={request.tags}
                requester_name={request.requester_name}
                created_at={request.created_at}
                status={request.status}
                upvotes={request.upvotes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
