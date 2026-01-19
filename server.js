const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
// The PORT is provided by iisnode automatically
const PORT = process.env.PORT || 3000;

// Supabase Configuration
const supabaseUrl = 'https://hshbeyxeuwebtnjuibms.supabase.co';
// Use process.env for security in production
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OmniTicket Backend is healthy', 
    timestamp: new Date(),
    server: 'IIS/iisnode'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('OmniTicket API is online. Access endpoints via /api/');
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});