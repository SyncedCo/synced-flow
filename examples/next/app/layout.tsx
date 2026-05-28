import './synced-flow.css'

export const metadata = {
  title: 'Synced Flow Next Example',
  description: 'A strict-fluid Synced Flow starter.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
