'use client'

import { m } from 'motion/react'
import Link from 'next/link'
import { fadeUpVariants, staggerContainerVariants } from '@/lib/motion'

const productLinks = [
  { label: 'Links', href: '#features' },
  { label: 'Analytics', href: '#features' },
  { label: 'Services', href: '#features' },
  { label: 'Integrations', href: '#features' },
  { label: 'API', href: '#features' },
]

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Careers', href: '#' },
]

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

const connectLinks = [
  { label: 'Twitter', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Email', href: 'mailto:k@kanielt.com' },
]

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1200px] mx-auto px-5 pt-16 pb-8">
        {/* 4-column grid */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12"
        >
          {/* Product */}
          <m.div variants={fadeUpVariants}>
            <h4 className="text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] mb-4 font-medium">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>

          {/* Company */}
          <m.div variants={fadeUpVariants}>
            <h4 className="text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] mb-4 font-medium">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>

          {/* Legal */}
          <m.div variants={fadeUpVariants}>
            <h4 className="text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] mb-4 font-medium">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>

          {/* Connect */}
          <m.div variants={fadeUpVariants}>
            <h4 className="text-[12px] uppercase tracking-[0.08em] text-[#6E6E73] mb-4 font-medium">
              Connect
            </h4>
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>

        {/* Bottom row */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-[16px] font-bold lh-gradient-text">
            LinkHub
          </Link>
          <p className="text-[13px] text-[#48484A]">
            &copy; {new Date().getFullYear()} LinkHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
