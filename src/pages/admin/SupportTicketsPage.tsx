import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { supportTicketService } from "@/services/supportTicketService";
import { Plus, Search, MessageCircle, Clock, CheckCircle } from "lucide-react";

export default function SupportTicketsPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("OPEN");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ticket_type: "OTHER",
  });

  useEffect(() => {
    if (user?.orgId) {
      fetchTickets();
      fetchStats();
    }
  }, [user?.orgId]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supportTicketService.getSupportTickets(user, {
      status: activeTab,
    });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data } = await supportTicketService.getTicketStats(user);
    setStats(data);
  };

  const handleCreateTicket = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    const { error } = await supportTicketService.createTicket(user, {
      title: formData.title,
      description: formData.description,
      ticket_type: formData.ticket_type,
      status: "OPEN",
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        ticket_type: "OTHER",
      });
      fetchTickets();
      fetchStats();
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statConfig = {
    OPEN: { label: "Open", icon: Clock, color: "bg-red-100 text-red-800" },
    IN_PROGRESS: {
      label: "In Progress",
      icon: MessageCircle,
      color: "bg-yellow-100 text-yellow-800",
    },
    RESOLVED: {
      label: "Resolved",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-red-600">Open</p>
                <p className="text-2xl font-bold text-red-900">{stats.open}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.in_progress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.resolved}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {["OPEN", "IN_PROGRESS", "RESOLVED"].map((tab) => {
          const config = statConfig[tab as keyof typeof statConfig];
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tickets found in {activeTab.toLowerCase()} status.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "OPEN"
                        ? "bg-red-100 text-red-800"
                        : ticket.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Type: {ticket.ticket_type}</span>
                    <span>
                      Created:{" "}
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief title of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={formData.ticket_type}
                  onChange={(e) =>
                    setFormData({ ...formData, ticket_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OTHER">Other</option>
                  <option value="ATTENDANCE">Attendance Issue</option>
                  <option value="PAYMENT">Payment Issue</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
