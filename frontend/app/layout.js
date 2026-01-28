import './globals.css'

export const metadata = {
  title: 'LMS - Learning Management System',
  description: 'Canvas-like Learning Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
