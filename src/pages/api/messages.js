export default async function handler(req, res) {
  // Make API request to fetch all messages, for example:
  const response = await fetch(`${process.env.API_URL}/messages`);
  const data = await response.json();

  return res.status(200).json(data);
}
