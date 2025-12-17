export default function ExamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {children}
        </div>
    );
}
