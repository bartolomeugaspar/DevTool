const supabase = require('../config/supabase');

async function createReservation(req, res) {
  const { servico_id } = req.body;

  // Buscar serviço
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', servico_id)
    .single();

  if (serviceError || !service) {
    return res.status(404).json({ error: 'Serviço não encontrado' });
  }

  // Buscar cliente
  const { data: cliente, error: clienteError } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (clienteError || !cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  // Verificar saldo
  if (cliente.saldo < service.preco) {
    return res.status(400).json({ error: 'Saldo insuficiente' });
  }

  // Debitar saldo do cliente
  const { error: debitError } = await supabase
    .from('users')
    .update({ saldo: cliente.saldo - service.preco })
    .eq('id', cliente.id);

  if (debitError) return res.status(500).json({ error: 'Erro ao debitar saldo do cliente' });

  // Creditar saldo do prestador
  const { data: prestador } = await supabase
    .from('users')
    .select('saldo')
    .eq('id', service.prestador_id)
    .single();

  const { error: creditError } = await supabase
    .from('users')
    .update({ saldo: (prestador?.saldo || 0) + service.preco })
    .eq('id', service.prestador_id);

  if (creditError) return res.status(500).json({ error: 'Erro ao creditar saldo do prestador' });

  // Criar reserva
  const { data, error: reservaError } = await supabase
    .from('reservations')
    .insert([{ cliente_id: cliente.id, servico_id, status: 'pendente' }]);

  if (reservaError) return res.status(400).json(reservaError);

  res.status(201).json(data);
}

module.exports = { createReservation };
