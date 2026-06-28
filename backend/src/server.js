require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Security & logging
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pashusevak')
  .then(async () => {
    console.log('✅ MongoDB connected');
    try {
      const Product = require('./models/Product');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('⚠️ Database is empty. Running auto-seed...');
        const { seedData } = require('./seed');
        await seedData(true);
        console.log('✅ Auto-seed completed successfully!');
      }
    } catch (seedErr) {
      console.error('❌ Auto-seed failed:', seedErr.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running without database — API routes will use mock responses');
  });

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PashuSevak Admin API',
    version: '1.0.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
try { app.use('/api/auth', require('./routes/auth')); } catch(e) { console.log('Auth route not loaded:', e.message); }
try { app.use('/api/dashboard', require('./routes/dashboard')); } catch(e) { console.log('Dashboard route not loaded:', e.message); }
try { app.use('/api/sellers', require('./routes/sellers')); } catch(e) { console.log('Sellers route not loaded:', e.message); }
try { app.use('/api/products', require('./routes/products')); } catch(e) { console.log('Products route not loaded:', e.message); }
try { app.use('/api/orders', require('./routes/orders')); } catch(e) { console.log('Orders route not loaded:', e.message); }
try { app.use('/api/payments', require('./routes/payments')); } catch(e) { console.log('Payments route not loaded:', e.message); }
try { app.use('/api/logistics', require('./routes/logistics')); } catch(e) { console.log('Logistics route not loaded:', e.message); }
try { app.use('/api/reports', require('./routes/reports')); } catch(e) { console.log('Reports route not loaded:', e.message); }
try { app.use('/api/notifications', require('./routes/notifications')); } catch(e) { console.log('Notifications route not loaded:', e.message); }
try { app.use('/api/settings', require('./routes/settings')); } catch(e) { console.log('Settings route not loaded:', e.message); }

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 PashuSevak Admin API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
