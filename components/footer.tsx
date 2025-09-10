export function Footer() {
  return (
    <footer className="border-t bg-white mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-center md:text-left">© {new Date().getFullYear()} LOFT – Smart Lost & Found</p>
        <nav className="flex items-center gap-4">
          <a className="hover:underline" href="#">
            Privacy (opt-in consent)
          </a>
          <a className="hover:underline" href="#">
            About
          </a>
          <a className="hover:underline" href="#">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
