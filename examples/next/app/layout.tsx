import './synced-fluid.css'

export const metadata = {
  title: 'Synced Fluid Next Example',
  description: 'A strict-fluid Synced Fluid starter.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
