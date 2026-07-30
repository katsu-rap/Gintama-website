import { getStore } from "@netlify/blobs";

const POSTS = ["post1", "post2", "post3"];
const REACTION_TYPES = ["heart", "smile", "laugh", "surprise", "thanks", "awesome"];

function defaultData() {
  const data = {};
  POSTS.forEach((p) => {
    data[p] = {};
    REACTION_TYPES.forEach((r) => (data[p][r] = 0));
  });
  return data;
}

export default async (req) => {
  const store = getStore("reactions");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (req.method === "GET") {
    const data = (await store.get("counts", { type: "json" })) || defaultData();
    return new Response(JSON.stringify(data), { headers });
  }

  if (req.method === "POST") {
    const { postId, reactionType } = await req.json();

    if (!POSTS.includes(postId) || !REACTION_TYPES.includes(reactionType)) {
      return new Response(JSON.stringify({ error: "Invalid postId or reactionType" }), {
        status: 400,
        headers,
      });
    }

    const data = (await store.get("counts", { type: "json" })) || defaultData();
    data[postId][reactionType] = (data[postId][reactionType] || 0) + 1;
    await store.setJSON("counts", data);

    return new Response(JSON.stringify(data), { headers });
  }

  return new Response("Method not allowed", { status: 405, headers });
};

export const config = { path: "/api/reactions" };