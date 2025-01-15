import { Header } from "@/components/header";
import { UserCircle, Package, MapPin, Settings, LineChart, GraduationCap, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl font-bold mb-6">Parent Dashboard</h1>

        {/* Child's Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Child's Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <LineChart className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Performance Tracking</h3>
              </div>
              <p className="text-gray-600 mb-4">Monitor your child's test scores and academic progress</p>
              <Link href="/dashboard/parent/progress">
                <button className="text-primary hover:underline">View Progress →</button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Upcoming Tests</h3>
              </div>
              <p className="text-gray-600 mb-4">View scheduled tests and exam dates</p>
              <Link href="/dashboard/parent/schedule">
                <button className="text-primary hover:underline">View Schedule →</button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Tutor Communication</h3>
              </div>
              <p className="text-gray-600 mb-4">Connect with your child's tutors</p>
              <Link href="/dashboard/parent/messages">
                <button className="text-primary hover:underline">Message Tutors →</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <UserCircle className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Profile</h3>
              </div>
              <p className="text-gray-600 mb-4">Update your personal information</p>
              <Link href="/dashboard/parent/profile">
                <button className="text-primary hover:underline">Edit Profile →</button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Orders</h3>
              </div>
              <p className="text-gray-600 mb-4">View your order history</p>
              <Link href="/dashboard/parent/orders">
                <button className="text-primary hover:underline">View Orders →</button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Addresses</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage your addresses</p>
              <Link href="/dashboard/parent/addresses">
                <button className="text-primary hover:underline">Manage Addresses →</button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Settings</h3>
              </div>
              <p className="text-gray-600 mb-4">Configure account settings</p>
              <Link href="/dashboard/parent/settings">
                <button className="text-primary hover:underline">Manage Settings →</button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}