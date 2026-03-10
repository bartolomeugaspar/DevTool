const supabase = require('../config/supabase');

async function createService(req, res) {
  const { nome, descricao, preco } = req.body;

  const { data, error } = await supabase
    .from('services')
    .insert([{ nome, descricao, preco, prestador_id: req.user.id }])
    .select();

  if (error) return res.status(400).json(error);

  res.status(201).json(data[0]);
}

async function getServices(req, res) {
  const { data, error } = await supabase
    .from('services')
    .select('*, users:prestador_id(id, nome_completo, email)')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json(error);

  res.json(data);
}

async function getServiceById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Serviço não encontrado' });

  res.json(data);
}

async function updateService(req, res) {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  const { data: service, error: fetchError } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !service) return res.status(404).json({ error: 'Serviço não encontrado' });

  if (service.prestador_id !== req.user.id) {
    return res.status(403).json({ error: 'Apenas o prestador dono do serviço pode editá-lo' });
  }

  const updates = {};
  if (nome !== undefined) updates.nome = nome;
  if (descricao !== undefined) updates.descricao = descricao;
  if (preco !== undefined) updates.preco = preco;

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
}

async function deleteService(req, res) {
  const { id } = req.params;

  const { data: service, error: fetchError } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !service) return res.status(404).json({ error: 'Serviço não encontrado' });

  if (service.prestador_id !== req.user.id) {
    return res.status(403).json({ error: 'Apenas o prestador dono do serviço pode removê-lo' });
  }

  // Dissociar reservas ligadas para evitar violação FK
  await supabase
    .from('reservations')
    .update({ servico_id: null })
    .eq('servico_id', id);

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json(error);

  res.json({ message: 'Serviço removido com sucesso' });
}

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
