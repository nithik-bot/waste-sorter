export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { image } = await request.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}` // Environment variables via env
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Analyze this image. If it's recyclable, say 'RECYCLABLE'. If it's trash, say 'TRASH'. Respond with only the word." 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${image}` } 
              }
            ]
          }
        ],
        max_tokens: 20,
        temperature: 0.2
      })
    });

    const data = await response.json();

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