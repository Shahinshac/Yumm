import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Use the connection string from environment variables
  // Supabase provides this under Settings -> Database -> Connection String
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return res.status(500).json({ 
      error: 'DATABASE_URL is not set in environment variables.',
      tip: 'Get your connection string from Supabase (Settings > Database > Connection String > Node.js)'
    });
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    // The SQL Schema
    const schema = `
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        restaurantId TEXT NOT NULL,
        restaurantName TEXT NOT NULL,
        items JSONB NOT NULL,
        status TEXT NOT NULL,
        total DECIMAL NOT NULL,
        address TEXT NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pending_owners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        restaurantName TEXT NOT NULL,
        restaurantLocation TEXT NOT NULL,
        restaurantCategory TEXT,
        status TEXT DEFAULT 'pending',
        registeredAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pending_partners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        vehicleType TEXT,
        status TEXT DEFAULT 'pending',
        registeredAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    await client.query(schema);
    await client.end();

    return res.status(200).json({ 
      success: true, 
      message: 'Database tables created successfully!',
      tables: ['orders', 'pending_owners', 'pending_partners']
    });
  } catch (error: any) {
    console.error('Database Init Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
