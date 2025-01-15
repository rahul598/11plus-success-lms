import { Header } from "@/components/header";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold mb-6">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Exams Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mock Exams</h2>
            <p className="text-gray-600 mb-4">Practice with our comprehensive mock exams</p>
            <button className="text-primary hover:underline">View Available Tests →</button>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <p className="text-gray-600 mb-4">Track your performance and improvements</p>
            <button className="text-primary hover:underline">View Progress Report →</button>
          </div>

          {/* Upcoming Classes Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
            <p className="text-gray-600 mb-4">Join your scheduled online classes</p>
            <button className="text-primary hover:underline">View Schedule →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
