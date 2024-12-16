import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Function to introduce a delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Wait for 5 seconds
  await delay(5000);

  // Generate a random count between 0 and 100
  const randomCount = Math.floor(Math.random() * 101);

  res.status(200).json({ count: randomCount });
}
