import { Header } from "@/components/header";

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold mb-6">Parent Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Child's Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Child's Progress</h2>
            <p className="text-gray-600 mb-4">Monitor your child's performance and activities</p>
            <button className="text-primary hover:underline">View Progress →</button>
          </div>

          {/* Upcoming Tests Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Tests</h2>
            <p className="text-gray-600 mb-4">View scheduled tests and exam dates</p>
            <button className="text-primary hover:underline">View Schedule →</button>
          </div>

          {/* Tutor Communication Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tutor Communication</h2>
            <p className="text-gray-600 mb-4">Connect with your child's tutors</p>
            <button className="text-primary hover:underline">Message Tutors →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
