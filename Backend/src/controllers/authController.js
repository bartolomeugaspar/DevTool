const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { nome_completo, nif, email, senha, tipo_usuario } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ nome_completo, nif, email, senha: hash, tipo_usuario }]);

  if (error) return res.status(400).json(error);

  res.status(201).json(data);
}

module.exports = { register };
