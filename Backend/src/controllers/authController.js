const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { nome_completo, nif, email, senha, tipo_usuario } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ nome_completo, nif, email, senha: hash, tipo_usuario }])
    .select('id, nome_completo, nif, email, tipo_usuario, created_at')
    .single();

  if (error) return res.status(400).json(error);

  res.status(201).json(data);
}

async function login(req, res) {
  const { email, nif, senha } = req.body;

  if (!email && !nif) {
    return res.status(400).json({ error: 'Forneça email ou NIF para autenticar' });
  }

  let query = supabase.from('users').select('*');
  if (email) {
    query = query.eq('email', email);
  } else {
    query = query.eq('nif', nif);
  }

  const { data: user } = await query.single();

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

async function me(req, res) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nome_completo, nif, email, tipo_usuario, saldo, created_at')
    .eq('id', req.user.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Utilizador não encontrado' });

  res.json(data);
}

async function topup(req, res) {
  const ALLOWED_AMOUNTS = [500, 1000, 2500, 5000];
  const valor = Number(req.body.valor);

  if (!ALLOWED_AMOUNTS.includes(valor)) {
    return res.status(400).json({ error: 'Valor inválido. Escolha: 500, 1000, 2500 ou 5000 Kz' });
  }

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('saldo')
    .eq('id', req.user.id)
    .single();

  if (fetchError || !user) return res.status(404).json({ error: 'Utilizador não encontrado' });

  const novoSaldo = user.saldo + valor;

  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({ saldo: novoSaldo })
    .eq('id', req.user.id)
    .select('id, nome_completo, nif, email, tipo_usuario, saldo, created_at')
    .single();

  if (updateError) return res.status(500).json({ error: 'Erro ao actualizar saldo' });

  res.json(updated);
}

module.exports = { register, login, me, topup };
