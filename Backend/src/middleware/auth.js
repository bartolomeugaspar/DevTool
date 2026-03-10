const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function isCliente(req, res, next) {
  if (req.user?.tipo !== 'cliente') {
    return res.status(403).json({ error: 'Apenas clientes podem realizar esta ação' });
  }
  next();
}

function isPrestador(req, res, next) {
  if (req.user?.tipo !== 'prestador') {
    return res.status(403).json({ error: 'Apenas prestadores podem realizar esta ação' });
  }
  next();
}

module.exports = { auth, isCliente, isPrestador };
