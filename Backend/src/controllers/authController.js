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

async function login(req, res) {
  const { email, senha } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(senha, user.senha);

  if (!valid) return res.status(401).json({ error: 'Senha inválida' });

  const token = jwt.sign(
    { id: user.id, tipo: user.tipo_usuario },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token });
}

module.exports = { register, login };
