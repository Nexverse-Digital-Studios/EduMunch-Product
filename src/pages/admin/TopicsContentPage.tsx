import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { topicService } from "@/services/topicService";
import { Plus, Trash2, FileText, ChevronDown, ChevronRight } from "lucide-react";

export default function TopicsContentPage() {
  const { user } = useAuthStore();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    new Set()
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"topic" | "content">("topic");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [formData, setFormData] = useState({
    topic_name: "",
    topic_number: "",
    description: "",
    content_title: "",
    content_type: "PDF",
  });

  useEffect(() => {
    if (user?.orgId && selectedSubject) {
      fetchTopics();
    }
  }, [user?.orgId, selectedSubject]);

  const fetchTopics = async () => {
    setLoading(true);
    const { data } = await topicService.getCompleteHierarchy(
      user,
      selectedSubject
    );
    setTopics(data || []);
    setLoading(false);
  };

  const toggleExpand = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleCreateTopic = async () => {
    if (!formData.topic_name) {
      alert("Please enter topic name");
      return;
    }

    const { error } = await topicService.createTopic(user, {
      subject_id: selectedSubject,
      parent_topic_id: selectedTopic?.id,
      topic_name: formData.topic_name,
      topic_number: formData.topic_number,
      description: formData.description,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        topic_name: "",
        topic_number: "",
        description: "",
        content_title: "",
        content_type: "PDF",
      });
      fetchTopics();
    }
  };

  const handleAddContent = async () => {
    if (!selectedTopic || !formData.content_title) {
      alert("Please select a topic and enter content title");
      return;
    }

    const { error } = await topicService.addTopicContent(user, {
      topic_id: selectedTopic.id,
      content_title: formData.content_title,
      content_type: formData.content_type,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        topic_name: "",
        topic_number: "",
        description: "",
        content_title: "",
        content_type: "PDF",
      });
      fetchTopics();
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm("Delete this topic and all its content?")) {
      await topicService.deleteTopic(user, topicId);
      fetchTopics();
    }
  };

  const renderTopic = (topic: any, level: number = 0) => (
    <div key={topic.id} className="mb-2">
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-surface-secondary rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-primary">
        <button
          onClick={() => toggleExpand(topic.id)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {topic.children?.length > 0 ? (
            expandedTopics.has(topic.id) ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )
          ) : (
            <div className="w-6" />
          )}
        </button>

        <div
          style={{ paddingLeft: `${level * 20}px` }}
          className="flex-1 flex items-center gap-3"
        >
          <FileText className="text-indigo-600 dark:text-indigo-400" size={18} />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-dark-text-primary">{topic.topic_name}</p>
            {topic.topic_number && (
              <p className="text-xs text-gray-500 dark:text-gray-400">#{topic.topic_number}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedTopic(topic);
              setModalType("content");
              setShowModal(true);
            }}
            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
          >
            + Content
          </button>
          <button
            onClick={() => {
              setSelectedTopic(topic);
              setModalType("topic");
              setShowModal(true);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
          >
            + Subtopic
          </button>
          <button
            onClick={() => handleDeleteTopic(topic.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expandedTopics.has(topic.id) && (
        <div className="ml-6 mt-2">
          {topic.children?.map((child: any) => renderTopic(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Topics & Content</h1>
        <button
          onClick={() => {
            setSelectedTopic(null);
            setModalType("topic");
            setShowModal(true);
          }}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2"
          disabled={!selectedSubject}
        >
          <Plus size={20} /> New Topic
        </button>
      </div>

      {/* Subject Selector */}
      <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setExpandedTopics(new Set());
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select a subject --</option>
          <option value="sub1">Mathematics</option>
          <option value="sub2">Physics</option>
          <option value="sub3">Chemistry</option>
          <option value="sub4">Biology</option>
        </select>
      </div>

      {/* Topics Hierarchy */}
      {selectedSubject && (
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            Topic Hierarchy
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No topics found. Create your first topic.
            </div>
          ) : (
            <div className="space-y-2">{topics.map((topic) => renderTopic(topic))}</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow-lg p-6 w-96 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
              {modalType === "topic"
                ? selectedTopic
                  ? "Add Subtopic"
                  : "Create Topic"
                : "Add Content"}
            </h2>

            <div className="space-y-4">
              {modalType === "topic" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      value={formData.topic_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          topic_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Algebra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Topic Number
                    </label>
                    <input
                      type="text"
                      value={formData.topic_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          topic_number: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 1.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                      placeholder="Optional description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mb-4 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium">
                      Adding content to: {selectedTopic?.topic_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Content Title *
                    </label>
                    <input
                      type="text"
                      value={formData.content_title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content_title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Chapter 1 Lecture"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="PDF">PDF</option>
                      <option value="VIDEO">Video</option>
                      <option value="DOCUMENT">Document</option>
                      <option value="LINK">Link</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-primary"
              >
                Cancel
              </button>
              <button
                onClick={
                  modalType === "topic"
                    ? handleCreateTopic
                    : handleAddContent
                }
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                {modalType === "topic" ? "Create Topic" : "Add Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

