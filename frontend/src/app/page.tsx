"use client";

import { platform } from "os";
import { useState, useEffect } from "react";

interface Payload {
  userid: string;
  platform: string;
  tags: string[];
  summary: string;
}

export default function Home() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/get");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: Payload[] = await response.json();
      setPayloads(data);

      const tags = Array.from(new Set(data.flatMap((payload) => payload.tags)));
      setAllTags(tags);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredPayloads = selectedTags.length
    ? payloads.filter((payload) =>
        payload.tags.some((tag) => selectedTags.includes(tag))
      )
    : payloads;

  const urgencyTags = ["urgent", "low_urgency"];
  const otherTags = allTags.filter((tag) => !urgencyTags.includes(tag));

  // Mapping for platform-specific URLs
  const platformUrlMapping: { [platform: string]: string } = {
    messenger:
      "https://business.facebook.com/latest/inbox/all/?nav_ref=manage_page_ap_plus_inbox_message_button&asset_id=591541020708265&mailbox_id=&selected_item_id=100006744826420&thread_type=FB_MESSAGE",
    email: "https://mail.google.com/mail/u/0/#inbox",
    default: "https://example.com",
  };

  // Function to get the URL based on the platform
  const getPlatformUrl = (platform: string) => {
    return (
      platformUrlMapping[platform.toLowerCase()] || platformUrlMapping.default
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Service Center</h1>

        <div className="mt-4">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-semibold mb-2">Filter by Tags</h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="flex flex-row gap-8">
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Urgency Tags</h3>
              <div className="flex flex-wrap gap-2">
                {urgencyTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelection(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Other Tags</h3>
              <div className="flex flex-wrap gap-2">
                {otherTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelection(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTags.includes(tag)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayloads.map((payload, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    window.open(getPlatformUrl(payload.platform), "_blank")
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payload.platform}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payload.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payload.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
