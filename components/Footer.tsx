import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
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
          <p className="text-xs text-text-secondary">
            Built with vibes. Powered by the community.
          </p>
        </div>
      </div>
    </footer>
  );
}
