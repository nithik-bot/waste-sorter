export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Get the API Key from Cloudflare Environment Variables
  const API_KEY = env.GROQ_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API Key missing in Cloudflare settings." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Parse the image data from the frontend
    const { image } = await request.json();

    // 3. Talk to Groq AI
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // or your preferred vision model
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Is this recyclable, compost, or trash? Answer in one word." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    // 4. Return the AI's answer back to your website
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
