import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    return (
        <>
            <Head title="Welcome" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
                <h1 className="mb-4 text-4xl font-bold text-gray-800">Public Landing Page</h1>
                <p className="mb-6 text-gray-600">
                    This is the placeholder for your user-facing website. You can customize this later with your real content.
                </p>

                <Link href="/admin/login" className="rounded bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700">
                    Go to Admin Login
                </Link>
            </div>
        </>
    );
}
