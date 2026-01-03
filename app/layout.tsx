export const metadata = {
  title: "Tone Memory",
  description: "Guitar tone memory app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Arial" }}>
        {children}
      </body>
    </html>
  );
}
