import { IconBrandWhatsapp, IconCalendarClock, IconBrandGithub, IconCopyright, IconBrandUpwork, IconBrandLinkedin } from '@tabler/icons-react'

export default function Footer() {
  return (
    <footer id="contact" className="section max-w-7xl mx-auto p-8 md:p-24 pb-0 w-full md:mb-12 mb-0">
      <div className="flex justify-center items-center">
        <div className="bg-[var(--bg-800)] p-12 md:p-0 flex flex-col items-center justify-center rounded-2xl w-full md:h-[300px]">
          <div className="flex items-center gap-2 bg-[var(--highlight)]/15 px-4 py-1 rounded-2xl">
            <span className="pulse bg-[var(--highlight)] w-2 h-2 rounded-full"></span>
            <span className="text-xs">Available for remote projects</span>
          </div>
          <h1 className="text-3xl md:text-5xl max-w-md md:max-w-none mt-4 font-bold text-center">
            Your idea. <span className="text-[var(--highlight)]">My execution.</span> <span className="">Infinite potential.</span>
          </h1>
          <span className="text-sm mt-2 text-center text-[var(--text-secondary)]">
            Let&apos;s turn your vision into reality. Together, we&apos;ll create something extraordinary. <span className="">Chat with me now</span> or <span className="">schedule a call.</span>
          </span>
          <div className="mt-8 flex items-center flex-col md:flex-row gap-4 md:gap-8">
            <a
              href="https://wa.me/919924330642"
              className="flex text-sm md:text-base cursor-pointer transition-all duration-300 hover:bg-[var(--bg-600)]/50 bg-[var(--bg-600)]/20 items-center gap-2 text-md text-[var(--text-primary)] px-6 py-2 rounded-full font-medium">
              <IconBrandWhatsapp size={20} />
              Chat with me now
            </a>
            <a
              href="https://calendly.com/hussainofficial53/30min"
              target="_blank"
              rel="noreferrer"
              className="flex hover:underline transition-all duration-300 hover:text-[var(--highlight)] items-center gap-2 text-sm md:text-base text-[var(--text-primary)] px-6 py-2 rounded-full font-medium">
              <IconCalendarClock size={20} />
              Schedule a call
            </a>
          </div>
          <div className="flex md:hidden mt-12 items-center gap-6">
            <a href="https://github.com/hussainofficial53" target="_blank" rel="noreferrer">
              <IconBrandGithub size={24} />
            </a>
            <a href="https://x.com/hussainofficial53" target="_blank" rel="noreferrer">
              <IconBrandUpwork size={24} />
            </a>
            <a href="https://www.linkedin.com/in/iamhussaindev/" target="_blank" rel="noreferrer">
              <IconBrandLinkedin size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-8 mb-8 md:mb-[-60px]">
        <div className="flex items-center gap-2">
          <IconCopyright size={16} />
          2025 Hussain Dehgamwala. All rights reserved.
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="https://github.com/hussainofficial53" target="_blank" rel="noreferrer">
            <IconBrandGithub size={24} />
          </a>
          <a href="https://x.com/hussainofficial53" target="_blank" rel="noreferrer">
            <IconBrandUpwork size={24} />
          </a>
          <a href="https://www.linkedin.com/in/iamhussaindev/" target="_blank" rel="noreferrer">
            <IconBrandLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}
