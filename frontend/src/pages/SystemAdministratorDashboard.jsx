import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  UserCheck,
  Building2,
  Brain,
  ShieldCheck,
  Activity,
  UserCog,
  Settings,
  Database,
} from "lucide-react";

function SystemAdministratorDashboard() {

  // Temporary frontend data
  const systemStats = [
    {
      title: "Total Users",
      value: 124,
      icon: Users,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Active Users",
      value: 118,
      icon: UserCheck,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Departments",
      value: 8,
      icon: Building2,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Skills",
      value: 42,
      icon: Brain,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "System Roles",
      value: 5,
      icon: ShieldCheck,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const roleDistribution = [
    { role: "Employees", count: 85, percentage: 68 },
    { role: "Managers", count: 12, percentage: 10 },
    { role: "HR", count: 8, percentage: 6 },
    { role: "Department Heads", count: 4, percentage: 3 },
    { role: "Administrators", count: 1, percentage: 1 },
  ];

  const recentActivities = [
    {
      activity: "New employee registered",
      user: "Rahul Kumar",
      time: "5 minutes ago",
      icon: UserCheck,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      activity: "Manager role assigned",
      user: "Anjali Sharma",
      time: "20 minutes ago",
      icon: UserCog,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      activity: 'New skill "Docker" added',
      user: "System Administrator",
      time: "1 hour ago",
      icon: Brain,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      activity: "Department Head assigned",
      user: "Kiran Reddy",
      time: "2 hours ago",
      icon: Building2,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar role="ADMIN" />

      <div className="flex-1">

        <Navbar title="System Administrator Dashboard" />

        <div className="p-8">

          {/* Header */}
          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="bg-slate-900 p-3 rounded-xl">
                <Settings className="text-white" size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  System Administrator Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                  Manage users, roles, departments and monitor the platform.
                </p>
              </div>

            </div>

          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">

            {systemStats.map((stat) => {

              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="text-gray-500 text-sm font-medium">
                        {stat.title}
                      </p>

                      <h2 className="text-3xl font-bold text-gray-800 mt-2">
                        {stat.value}
                      </h2>

                    </div>

                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon
                        size={27}
                        className={stat.iconColor}
                      />
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">

            {/* User Role Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    User Role Distribution
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Users across different system roles
                  </p>
                </div>

                <Users className="text-indigo-600" size={25} />

              </div>

              <div className="space-y-5">

                {roleDistribution.map((item) => (

                  <div key={item.role}>

                    <div className="flex justify-between mb-2">

                      <span className="text-sm font-medium text-gray-700">
                        {item.role}
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {item.count}
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">

                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      ></div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    System Overview
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Current platform status
                  </p>
                </div>

                <Activity className="text-green-600" size={25} />

              </div>

              <div className="space-y-5">

                {/* System Status */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">

                  <div className="flex items-center gap-3">

                    <div className="bg-green-100 p-2 rounded-lg">
                      <Activity
                        size={20}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        System Status
                      </p>

                      <p className="text-sm text-gray-500">
                        All services operational
                      </p>
                    </div>

                  </div>

                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    Online
                  </span>

                </div>

                {/* Database */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">

                  <div className="flex items-center gap-3">

                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Database
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        Database
                      </p>

                      <p className="text-sm text-gray-500">
                        Knowledge Gap Platform DB
                      </p>
                    </div>

                  </div>

                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    Connected
                  </span>

                </div>

                {/* User Activity */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">

                  <div className="flex items-center gap-3">

                    <div className="bg-purple-100 p-2 rounded-lg">
                      <UserCheck
                        size={20}
                        className="text-purple-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        User Activity
                      </p>

                      <p className="text-sm text-gray-500">
                        118 active users
                      </p>
                    </div>

                  </div>

                  <span className="text-purple-700 font-bold">
                    95%
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Recent System Activity */}
          <div className="bg-white rounded-xl shadow-sm mt-6 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Recent System Activity
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest administrative activities
                </p>
              </div>

              <Settings className="text-slate-600" size={24} />

            </div>

            <div className="space-y-4">

              {recentActivities.map((activity, index) => {

                const Icon = activity.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0"
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`${activity.bgColor} p-3 rounded-full`}
                      >
                        <Icon
                          size={20}
                          className={activity.iconColor}
                        />
                      </div>

                      <div>

                        <p className="font-semibold text-gray-800">
                          {activity.activity}
                        </p>

                        <p className="text-sm text-gray-500">
                          {activity.user}
                        </p>

                      </div>

                    </div>

                    <span className="text-sm text-gray-400">
                      {activity.time}
                    </span>

                  </div>
                );

              })}

            </div>

          </div>

          {/* Quick Administration */}
          <div className="mt-6">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Administration
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

              <button className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition text-left">

                <Users
                  className="text-indigo-600 mb-3"
                  size={28}
                />

                <h3 className="font-bold text-gray-800">
                  Manage Users
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  View and manage platform users
                </p>

              </button>

              <button className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition text-left">

                <ShieldCheck
                  className="text-red-600 mb-3"
                  size={28}
                />

                <h3 className="font-bold text-gray-800">
                  Manage Roles
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Manage roles and access permissions
                </p>

              </button>

              <button className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition text-left">

                <Building2
                  className="text-purple-600 mb-3"
                  size={28}
                />

                <h3 className="font-bold text-gray-800">
                  Departments
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Manage organizational departments
                </p>

              </button>

              <button className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition text-left">

                <Brain
                  className="text-orange-600 mb-3"
                  size={28}
                />

                <h3 className="font-bold text-gray-800">
                  Skill Management
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Manage skills and skill categories
                </p>

              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default SystemAdministratorDashboard;