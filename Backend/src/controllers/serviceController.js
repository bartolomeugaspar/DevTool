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
    .select('*')
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

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) return res.status(400).json(error);

  res.json({ message: 'Serviço removido com sucesso' });
}

module.exports = { createService, getServices, getServiceById, deleteService };
