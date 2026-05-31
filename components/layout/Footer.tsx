import Link from 'next/link'
import { Scale, Mail, Phone, MapPin } from 'lucide-react'

const footerSections = {
  product: {
    title: 'Product',
    links: [
      { name: 'Find Lawyers', href: '/lawyers' },
      { name: 'AI Assistant', href: '/ai-assistant' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Features', href: '/features' },
    ]
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ]
  },
  support: {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Contact Support', href: '/support' },
    ]
  }
}

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">LexiAI</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered platform connecting clients with verified lawyers. 
              Get legal assistance anytime, anywhere.
            </p>
          </div>

          {/* Footer Sections */}
          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>support@lexiai.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>123 Legal Street, NY 10001</span>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LexiAI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}