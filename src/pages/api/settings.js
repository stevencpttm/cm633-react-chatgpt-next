export default async function handler(req, res) {
  if (req.method === "PUT") {
    const currentSettingsResponse = await fetch(
      `${process.env.API_URL}/settings`
    );
    const currentSettings = await currentSettingsResponse.json();

    const { prompt, context, temperature } = req.body;

    const settings = [
      {
        id: currentSettings.find((setting) => setting.name === "prompt").id,
        name: "prompt",
        value: prompt,
      },
      {
        id: currentSettings.find((setting) => setting.name === "context").id,
        name: "context",
        value: context,
      },
      {
        id: currentSettings.find((setting) => setting.name === "temperature")
          .id,
        name: "temperature",
        value: temperature,
      },
    ];

    for (const setting of settings) {
      await fetch(`${process.env.API_URL}/settings/${setting.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setting),
      });
    }

    return res.status(200).json([]);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
