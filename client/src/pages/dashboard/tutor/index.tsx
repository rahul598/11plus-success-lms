import { Header } from "@/components/header";

export default function TutorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Classes Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Classes</h2>
            <p className="text-gray-600 mb-4">Manage your scheduled classes and students</p>
            <button className="text-primary hover:underline">View Classes →</button>
          </div>

          {/* Content Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <p className="text-gray-600 mb-4">Create and manage educational content</p>
            <button className="text-primary hover:underline">Manage Content →</button>
          </div>

          {/* Student Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Student Progress</h2>
            <p className="text-gray-600 mb-4">Track and evaluate student performance</p>
            <button className="text-primary hover:underline">View Analytics →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
