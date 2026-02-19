import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Vibrary"
              width={100}
              height={28}
              className="h-6 w-auto"
            />
            <span className="text-sm text-text-secondary">
              — The open library for vibecoded projects
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <Link href="/about" className="hover:text-coral transition-colors">
              About
            </Link>
            <span>Built with vibes. Powered by the community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
