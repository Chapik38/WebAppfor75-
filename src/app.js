const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { validateCompatibility } = require('./services/compatibilityService');
const { analyzeConfiguration } = require('./services/recommendationService');
const env = require('./config/env');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing authentication token' });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function createApp({ authService, componentModel, configurationModel }) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan('dev'));

  app.set('views', path.resolve(process.cwd(), 'views'));
  app.set('view engine', 'ejs');

  app.use(express.static(path.resolve(process.cwd(), 'public')));

  app.get('/', (req, res) => res.redirect('/login'));
  app.get('/login', (req, res) => res.render('login', { title: 'Вход' }));
  app.get('/register', (req, res) => res.render('register', { title: 'Регистрация' }));
  app.get('/builder', (req, res) => res.render('builder', { title: 'Сборка ПК' }));
  app.get('/analyzer', (req, res) => res.render('analyzer', { title: 'Улучшение ПК' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.post(
    '/api/auth/register',
    body('username').trim().isLength({ min: 3, max: 50 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 64 }),
    validate,
    async (req, res, next) => {
      try {
        res.status(201).json(await authService.register(req.body));
      } catch (e) {
        next(e);
      }
    }
  );

  app.post(
    '/api/auth/login',
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 64 }),
    validate,
    async (req, res, next) => {
      try {
        res.json(await authService.login(req.body));
      } catch (e) {
        next(e);
      }
    }
  );

  app.get('/api/components', auth, async (req, res, next) => {
    try {
      res.json({ components: await componentModel.listAll() });
    } catch (e) {
      next(e);
    }
  });

  app.post('/api/components/validate', auth, async (req, res, next) => {
    try {
      const ids = Object.values(req.body || {}).filter(Boolean);
      const components = await componentModel.getByIds(ids);
      const byCategory = {};
      components.forEach((c) => {
        byCategory[c.category] = c;
      });
      res.json(validateCompatibility(byCategory));
    } catch (e) {
      next(e);
    }
  });

  app.get('/api/configurations', auth, async (req, res, next) => {
    try {
      res.json({ configurations: await configurationModel.listByUser(req.user.id) });
    } catch (e) {
      next(e);
    }
  });

  app.post(
    '/api/configurations',
    auth,
    body('title').trim().isLength({ min: 2, max: 120 }),
    body('config').isObject(),
    validate,
    async (req, res, next) => {
      try {
        const id = await configurationModel.saveConfiguration({
          userId: req.user.id,
          title: req.body.title,
          configJson: req.body.config
        });
        res.status(201).json({ id });
      } catch (e) {
        next(e);
      }
    }
  );

  app.put(
    '/api/configurations/:id',
    auth,
    body('title').optional().trim().isLength({ min: 2, max: 120 }),
    body('config').optional().isObject(),
    validate,
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid configuration id' });
        const updated = await configurationModel.updateConfiguration({
          id,
          userId: req.user.id,
          title: req.body.title,
          configJson: req.body.config
        });
        if (!updated) return res.status(404).json({ error: 'Configuration not found' });
        return res.json({ ok: true });
      } catch (e) {
        return next(e);
      }
    }
  );

  app.delete('/api/configurations/:id', auth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid configuration id' });
      const deleted = await configurationModel.deleteConfiguration({ id, userId: req.user.id });
      if (!deleted) return res.status(404).json({ error: 'Configuration not found' });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  });

  app.post('/api/analyzer', auth, async (req, res, next) => {
    try {
      const ids = Object.values(req.body || {}).filter(Boolean);
      const components = await componentModel.getByIds(ids);
      const byCategory = {};
      components.forEach((c) => {
        byCategory[c.category] = c;
      });
      res.json(analyzeConfiguration(byCategory));
    } catch (e) {
      next(e);
    }
  });

  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.status(404).render('error', { title: 'Не найдено', message: 'Страница не найдена' });
  });
  app.use((err, req, res, next) => {
    if (err.status >= 500 || !err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };
