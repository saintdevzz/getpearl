import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://getpearly.vercel.app';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

function getFrontendBaseUrl(req: express.Request) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === 'production') {
    return FRONTEND_URL;
  }

  const host = req.headers.host;
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return host ? `${protocol}://${host}` : FRONTEND_URL;
}

app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const genKeyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1, // 1 request per 10 minutes per IP
  message: 'Too many key generation attempts, please try again later'
});

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://getpearly.vercel.app',
    process.env.FRONTEND_URL || 'https://getpearly.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(limiter);

// Token validation helper
function isValidToken(token: any): boolean {
  if (typeof token !== 'string') return false;
  // Tokens should be 32-64 alphanumeric characters
  return /^[a-zA-Z0-9]{32,64}$/.test(token);
}

// Checkpoint validation helper
function isValidCheckpoint(checkpoint: any): boolean {
  return checkpoint === '1' || checkpoint === '2';
}

// Provider validation helper
function isValidProvider(provider: any): boolean {
  return ['lootlabs', 'linkvertise', 'workink'].includes(provider);
}

app.get('/api/status', async (req, res) => {
  const token = req.query.token as string;
  
  if (!token || !isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid token format' });
  }

  try {
    let { data, error } = await supabase
      .from('key_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      const { data: newSession, error: createError } = await supabase
        .from('key_sessions')
        .insert([{ token, checkpoint1: false, checkpoint2: false }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to create session' });
      }
      data = newSession;
    }

    res.json({
      checkpoint1: data.checkpoint1,
      checkpoint2: data.checkpoint2
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/link', async (req, res) => {
  const checkpoint = req.query.checkpoint as string;
  const provider = req.query.provider as string;
  const token = req.query.token as string;

  if (!checkpoint || !provider || !token) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (!isValidCheckpoint(checkpoint) || !isValidProvider(provider) || !isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
      const frontendBaseUrl = getFrontendBaseUrl(req);
      const callbackUrl = `${frontendBaseUrl}/api/callback?checkpoint=${encodeURIComponent(checkpoint)}&token=${encodeURIComponent(token)}`;
    let redirectUrl = callbackUrl;

    if (provider === 'lootlabs') {
      const apiKey = process.env.LOOTLABS_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch('https://api.lootlabs.gg/v1/links', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              url: callbackUrl,
              title: `Pearl Checkpoint ${checkpoint}`
            })
          });
          const json: any = await response.json();
          if (json.url) {
            redirectUrl = json.url;
          }
        } catch (e) {
          console.error('LootLabs API error:', e);
        }
      }
    } else if (provider === 'linkvertise') {
      const apiKey = process.env.LINKVERTISE_API_KEY;
      const userId = process.env.LINKVERTISE_USER_ID;
      if (apiKey && userId) {
        try {
          const response = await fetch(`https://publisher.linkvertise.com/api/v1/link_insert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Linkvertise-API-Key': apiKey
            },
            body: JSON.stringify({
              url: callbackUrl,
              title: `Pearl Checkpoint ${checkpoint}`,
              userid: userId
            })
          });
          const json: any = await response.json();
          if (json.url) {
            redirectUrl = json.url;
          }
        } catch (e) {
          console.error('Linkvertise API error:', e);
        }
      }
    } else if (provider === 'workink') {
      const apiKey = process.env.WORKINK_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch('https://work.ink/api/v1/link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              url: callbackUrl,
              title: `Pearl Checkpoint ${checkpoint}`
            })
          });
          const json: any = await response.json();
          if (json.url) {
            redirectUrl = json.url;
          }
        } catch (e) {
          console.error('WorkInk API error:', e);
        }
      }
    }

    res.redirect(redirectUrl);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/callback', async (req, res) => {
  const checkpoint = req.query.checkpoint as string;
  const token = req.query.token as string;

  if (!checkpoint || !token) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (!isValidCheckpoint(checkpoint) || !isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const updates: any = {};
    if (checkpoint === '1') {
      updates.checkpoint1 = true;
    } else if (checkpoint === '2') {
      updates.checkpoint2 = true;
    }

    const { error } = await supabase
      .from('key_sessions')
      .update(updates)
      .eq('token', token);

    if (error) {
      return res.status(500).send('Failed to update session');
    }

    const frontendBaseUrl = getFrontendBaseUrl(req);
    res.redirect(`${frontendBaseUrl}/getkey?token=${encodeURIComponent(token)}`);
  } catch (e) {
    res.status(500).send('Internal server error');
  }
});

app.get('/api/genkey', genKeyLimiter, async (req, res) => {
  const token = req.query.token as string;
  
  if (!token || !isValidToken(token)) {
    return res.status(400).json({ error: 'Invalid token format' });
  }

  try {
    const { data, error } = await supabase
      .from('key_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: 'Session not found' });
    }

    if (!data.checkpoint1 || !data.checkpoint2) {
      return res.status(400).json({ error: 'Checkpoints not completed' });
    }

    // Generate cryptographically secure key
    const randomSegment = crypto.randomBytes(12).toString('hex').toUpperCase().substring(0, 4);
    const newKey = 'pearl-' + Array.from({ length: 4 }, () => crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 4)).join('-');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from('license_keys')
      .insert([{ key: newKey, expires_at: expiresAt }]);

    if (insertError) {
      return res.status(500).json({ error: 'Failed to generate key' });
    }

    await supabase
      .from('key_sessions')
      .delete()
      .eq('token', token);

    res.json({ success: true, key: newKey });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
