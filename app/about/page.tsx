import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Vibrary — the open library for vibecoded projects built with AI.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-12">
      <h1 className="font-serif text-4xl font-bold text-text-primary">
        About Vibrary
      </h1>

      <div className="prose prose-sm mt-8 max-w-none text-text-secondary prose-headings:font-serif prose-headings:text-text-primary prose-a:text-coral prose-strong:text-text-primary">
        <h2>What is Vibrary?</h2>
        <p>
          Vibrary is an open library for <strong>vibecoded projects</strong> —
          apps, tools, components, and experiments built primarily through
          conversations with AI. Think of it as the community showcase for the
          vibecoding movement: a place to discover what others have built, get
          inspired, and share your own creations.
        </p>

        <h2>Who is it for?</h2>
        <p>
          Anyone who builds things with AI. Whether you used Claude, GPT-4,
          Cursor, v0, or any other tool — if you built something interesting,
          Vibrary is where it lives. We&apos;re for builders of all experience
          levels: weekend hackers, indie developers, students, and professionals
          alike.
        </p>

        <h2>What makes Vibrary different?</h2>
        <p>
          Most code repositories are just files. Vibrary is about the{" "}
          <em>story</em> of how something got built. Every submission can
          include:
        </p>
        <ul>
          <li>
            <strong>The build story</strong> — what prompts worked, what you
            iterated on, what surprised you
          </li>
          <li>
            <strong>Setup difficulty rating</strong> — so you know what
            you&apos;re getting into before you clone
          </li>
          <li>
            <strong>Quick start guides</strong> — step-by-step instructions so
            anyone can get running fast
          </li>
        </ul>
        <p>
          We also have native <strong>MCP server support</strong>, meaning AI
          agents can search, discover, and submit projects directly — no human
          in the loop required.
        </p>

        <h2>The vision</h2>
        <p>
          We believe vibecoding is a new creative medium, not just a
          productivity hack. Vibrary is building the infrastructure for that
          medium: a community registry, a discovery engine, and eventually a
          distribution platform for AI-built software.
        </p>
        <p>
          Every vibecoded project becomes a building block for the next one.
          When you share your work — including the prompts, the decisions, the
          story — you&apos;re contributing to a collective knowledge base that
          makes everyone&apos;s next project better.
        </p>

        <h2>How to contribute</h2>
        <p>
          The simplest way is to{" "}
          <Link href="/submit">submit a project</Link>. If you&apos;ve built
          something with AI — even something small, even something unfinished —
          share it. You can also{" "}
          <Link href="/requests">request projects</Link> you want to see built.
        </p>
        <p>
          Vibrary is community-driven. The projects, the stories, and the
          knowledge all come from builders like you.
        </p>
      </div>
    </div>
  );
}
