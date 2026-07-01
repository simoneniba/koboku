export function Footer() {
  return (
    <footer id="contact" className="bg-ink text-bone px-6 md:px-10 pt-32 pb-10">
      <div className="mx-auto max-w-7xl">
        <span className="text-eyebrow text-bone/50">— Let's build</span>
        <h2 className="mt-6 text-display text-[clamp(3rem,10vw,9rem)] leading-[0.9]">
          Have a story <span className="italic text-accent">worth telling?</span>
        </h2>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div>
            <p className="text-eyebrow text-bone/50 mb-3">Email</p>
            <a href="mailto:info@koboku.it" className="hover:text-accent transition-colors">
              info@koboku.it
            </a>
          </div>
          <div>
            <p className="text-eyebrow text-bone/50 mb-3">Studio</p>
            <p>
              Brescia, IT
              <br />
              By appointment
            </p>
          </div>
          <div>
            <p className="text-eyebrow text-bone/50 mb-3">Social</p>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.instagram.com/koboku_aistudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-2 hover:text-accent transition-colors"
                >
                  <span>@koboku_aistudio</span>
                  <span className="text-bone/40">— Follow →</span>
                </a>
              </li>
              <li>Are.na</li>
              <li>Read.cv</li>
            </ul>
          </div>
          <div>
            <p className="text-eyebrow text-bone/50 mb-3">Colophon</p>
            <p className="text-bone/70">
              Next.js · GSAP · Three.js · crafted in Brescia, animated everywhere.
            </p>
          </div>
        </div>

        <div className="mt-24 flex items-end justify-between text-eyebrow text-bone/40">
          <span>© Koboku Studio · MMXXVI</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
