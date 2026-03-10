const supabase = require('../config/supabase');

async function createService(req, res) {
  if (req.user.tipo !== 'prestador') {
    return res.status(403).json({ error: 'Apenas prestadores podem criar serviços' });
  }

  const { nome, descricao, preco } = req.body;

  const { data, error } = await supabase
    .from('services')
    .insert([{ nome, descricao, preco, prestador_id: req.user.id }]);

  if (error) return res.status(400).json(error);

  res.status(201).json(data);
}

module.exports = { createService };
