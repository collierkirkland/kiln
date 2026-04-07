import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// ─── PKCE Helpers ─────────────────────────────────────────────────────────────
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Step 1: Redirect user to Etsy OAuth
app.get('/auth/etsy', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  req.session.codeVerifier = codeVerifier;
  req.session.oauthState = state;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ETSY_API_KEY,
    redirect_uri: process.env.ETSY_REDIRECT_URI,
    scope: 'listings_r listings_w listings_d shops_r',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.redirect(`https://www.etsy.com/oauth/connect?${params}`);
});

// Step 2: Etsy redirects back here with a code
app.get('/auth/etsy/callback', async (req, res) => {
  const { code, state } = req.query;

  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid OAuth state' });
  }

  try {
    const tokenRes = await axios.post('https://api.etsy.com/v3/public/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_API_KEY,
      redirect_uri: process.env.ETSY_REDIRECT_URI,
      code,
      code_verifier: req.session.codeVerifier,
    });

    req.session.etsyToken = tokenRes.data.access_token;
    req.session.etsyRefreshToken = tokenRes.data.refresh_token;

    // Fetch shop info to save shop_id
    const meRes = await axios.get('https://openapi.etsy.com/v3/application/users/me', {
      headers: {
        'x-api-key': process.env.ETSY_API_KEY,
        Authorization: `Bearer ${req.session.etsyToken}`,
      },
    });

    req.session.userId = meRes.data.user_id;

    // Get shop_id
    const shopsRes = await axios.get(
      `https://openapi.etsy.com/v3/application/users/${req.session.userId}/shops`,
      {
        headers: {
          'x-api-key': process.env.ETSY_API_KEY,
          Authorization: `Bearer ${req.session.etsyToken}`,
        },
      }
    );

    req.session.shopId = shopsRes.data.shop_id;
    req.session.shopName = shopsRes.data.shop_name;

    res.redirect(`${process.env.CLIENT_URL}?connected=true`);
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Check auth status
app.get('/auth/status', (req, res) => {
  if (req.session.etsyToken) {
    res.json({
      connected: true,
      shopId: req.session.shopId,
      shopName: req.session.shopName,
    });
  } else {
    res.json({ connected: false });
  }
});

// Disconnect
app.post('/auth/disconnect', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ─── Etsy Listing Routes ──────────────────────────────────────────────────────

function etsyHeaders(req) {
  return {
    'x-api-key': process.env.ETSY_API_KEY,
    Authorization: `Bearer ${req.session.etsyToken}`,
  };
}

// Get all draft listings
app.get('/api/listings/drafts', async (req, res) => {
  if (!req.session.etsyToken) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/shops/${req.session.shopId}/listings`,
      {
        headers: etsyHeaders(req),
        params: { state: 'draft', limit: 100 },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Listings error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch draft listings' });
  }
});

// Get single listing detail
app.get('/api/listings/:listingId', async (req, res) => {
  if (!req.session.etsyToken) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/listings/${req.params.listingId}`,
      { headers: etsyHeaders(req) }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Get listing images
app.get('/api/listings/:listingId/images', async (req, res) => {
  if (!req.session.etsyToken) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const response = await axios.get(
      `https://openapi.etsy.com/v3/application/listings/${req.params.listingId}/images`,
      { headers: etsyHeaders(req) }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing images' });
  }
});

// ─── Claude Generation Route ──────────────────────────────────────────────────

app.post('/api/generate', async (req, res) => {
  if (!req.session.etsyToken) return res.status(401).json({ error: 'Not authenticated' });

  const { listing, template, imageUrl } = req.body;

  if (!listing) return res.status(400).json({ error: 'Listing data required' });

  try {
    const templateContext = template
      ? `Use the following description template as your structural guide. Fill in the [PLACEHOLDERS] with specific details derived from the listing. Keep the tone, format, and section headers:\n\n${template}`
      : 'Write a compelling, SEO-optimized Etsy listing description with clear sections for product details, what makes it special, and care/shipping info.';

    const messageContent = [];

    // If we have an image URL, fetch and include it
    if (imageUrl) {
      try {
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(imgRes.data).toString('base64');
        const contentType = imgRes.headers['content-type'] || 'image/jpeg';
        messageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: contentType, data: base64 },
        });
      } catch (imgErr) {
        console.warn('Could not load image:', imgErr.message);
      }
    }

    messageContent.push({
      type: 'text',
      text: `You are an expert Etsy copywriter specializing in print-on-demand products. Generate a complete Etsy listing for the following draft:

LISTING INFO:
- Title (draft): ${listing.title || 'Untitled'}
- Category: ${listing.taxonomy_path?.join(' > ') || 'Not set'}
- Price: $${((listing.price?.amount || 0) / (listing.price?.divisor || 100)).toFixed(2)}
- Tags (existing): ${listing.tags?.join(', ') || 'None'}

TEMPLATE INSTRUCTIONS:
${templateContext}

Please respond with a JSON object containing:
{
  "title": "optimized Etsy title (max 140 chars, keyword-rich)",
  "description": "full listing description following the template",
  "tags": ["array", "of", "13", "relevant", "tags", "max 20 chars each"]
}

Only respond with the JSON object, no other text.`,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: messageContent }],
    });

    const text = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(clean);

    res.json({ success: true, generated });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: 'Failed to generate listing content' });
  }
});

// ─── Update Listing Route ─────────────────────────────────────────────────────

app.patch('/api/listings/:listingId', async (req, res) => {
  if (!req.session.etsyToken) return res.status(401).json({ error: 'Not authenticated' });

  const { title, description, tags } = req.body;

  try {
    const response = await axios.patch(
      `https://openapi.etsy.com/v3/application/shops/${req.session.shopId}/listings/${req.params.listingId}`,
      { title, description, tags },
      { headers: { ...etsyHeaders(req), 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, listing: response.data });
  } catch (err) {
    console.error('Update error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🔥 Kiln server running at http://localhost:${PORT}`);
});
