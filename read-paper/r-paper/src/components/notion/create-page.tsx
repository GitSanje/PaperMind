"use client";
import { useState } from "react";

export default function CreatePage({ token, parent_page_id }: { token: string; parent_page_id: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = async () => {
    const res = await fetch("/api/notion/create-page", {
      method: "POST",
      body: JSON.stringify({ token, parent_page_id, title, content }),
    });

    const data = await res.json();
    console.log(data);
    alert(data.message || "Failed to create");
  };

  return (
    <div className="p-4">
      <input
        placeholder="Page Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <input
        placeholder="Page Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-1 rounded">
        Create Page
      </button>
    </div>
  );
}
