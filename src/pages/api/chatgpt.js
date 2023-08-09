export default async function handler(req, res) {
  // If this is a POST request
  if (req.method === "POST") {
    // Process the request
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "No message provided" });
    }

    // 1. Store the message to the API
    const storeResponse = await fetch(`${process.env.API_URL}/messages`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    });

    // 2. Get the settings
    const settingsResponse = await fetch(`${process.env.API_URL}/settings`);
    const settings = await settingsResponse.json();

    const prompt =
      settings.find((setting) => setting.name === "prompt")?.value || "";
    const context =
      settings.find((setting) => setting.name === "context")?.value || 6;
    const temperature =
      settings.find((setting) => setting.name === "temperature")?.value || 0.7;

    // 3. Get the last [context] messages
    const messagesResponse = await fetch(
      `${process.env.API_URL}/messages?_limit=${context}&_sort=id&_order=desc`
    );
    const messagesHistory = await messagesResponse.json();

    // 4. Call the ChatGPT API
    const response = await fetch(process.env.CHATGPT_PROXY_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHATGPT_PROXY_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: +temperature,
        messages: [
          { role: "system", content: prompt },
          ...messagesHistory.reverse().map((message) => {
            return {
              role: message.role,
              content: message.content,
            };
          }),
        ],
      }),
    });
    const chatGPTData = await response.json();

    let responseMessage = "";

    if (chatGPTData.choices && chatGPTData.choices.length > 0) {
      responseMessage = chatGPTData.choices[0].message.content;
    }

    // 5. Store the response to the API
    const chatGPTStoreResponse = await fetch(
      `${process.env.API_URL}/messages`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "assistant",
          content: responseMessage,
        }),
      }
    );

    // Return the response from ChatGPT
    return res.status(200).json({
      message: responseMessage,
    });
  }

  // Otherwise, reject
  return res.status(405).json({ message: "Method Not Allowed" });
}
