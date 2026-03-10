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

  // Impedir que o prestador contrate o seu próprio serviço
  if (service.prestador_id === req.user.id) {
    return res.status(400).json({ error: 'Não podes contratar o teu próprio serviço' });
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

  // Buscar saldo atual do prestador
  const { data: prestador, error: prestadorError } = await supabase
    .from('users')
    .select('saldo')
    .eq('id', service.prestador_id)
    .single();

  if (prestadorError || !prestador) {
    return res.status(404).json({ error: 'Prestador não encontrado' });
  }

  // --- TRANSAÇÃO ATÔMICA ---
  // 1. Debitar saldo do cliente
  const { error: debitError } = await supabase
    .from('users')
    .update({ saldo: cliente.saldo - service.preco })
    .eq('id', cliente.id);

  if (debitError) return res.status(500).json({ error: 'Erro ao debitar saldo do cliente' });

  // 2. Creditar saldo do prestador
  const { error: creditError } = await supabase
    .from('users')
    .update({ saldo: prestador.saldo + service.preco })
    .eq('id', service.prestador_id);

  if (creditError) {
    // Rollback: reverter débito do cliente
    await supabase
      .from('users')
      .update({ saldo: cliente.saldo })
      .eq('id', cliente.id);
    return res.status(500).json({ error: 'Erro ao creditar saldo do prestador' });
  }

  // 3. Criar reserva
  const { data: reserva, error: reservaError } = await supabase
    .from('reservations')
    .insert([{ cliente_id: cliente.id, servico_id, status: 'pendente' }])
    .select()
    .single();

  if (reservaError) {
    // Rollback: reverter débito e crédito
    await supabase.from('users').update({ saldo: cliente.saldo }).eq('id', cliente.id);
    await supabase.from('users').update({ saldo: prestador.saldo }).eq('id', service.prestador_id);
    return res.status(400).json(reservaError);
  }

  // 4. Criar histórico
  await supabase
    .from('reservations_history')
    .insert([{
      reserva_id: reserva.id,
      cliente_id: cliente.id,
      servico_id,
      preco: service.preco,
    }]);

  res.status(201).json(reserva);
}

async function cancelReservation(req, res) {
  const { id } = req.params;

  // Buscar reserva
  const { data: reserva, error: reservaError } = await supabase
    .from('reservations')
    .select('*, services(*)')
    .eq('id', id)
    .single();

  if (reservaError || !reserva) {
    return res.status(404).json({ error: 'Reserva não encontrada' });
  }

  if (reserva.cliente_id !== req.user.id) {
    return res.status(403).json({ error: 'Você não tem permissão para cancelar esta reserva' });
  }

  if (reserva.status === 'cancelado') {
    return res.status(400).json({ error: 'Reserva já foi cancelada' });
  }

  const preco = reserva.services.preco;

  // Buscar saldos atuais
  const { data: cliente } = await supabase
    .from('users').select('saldo').eq('id', reserva.cliente_id).single();
  const { data: prestador } = await supabase
    .from('users').select('saldo').eq('id', reserva.services.prestador_id).single();

  // Reverter saldo do prestador
  const { error: revertPrestadorError } = await supabase
    .from('users')
    .update({ saldo: prestador.saldo - preco })
    .eq('id', reserva.services.prestador_id);

  if (revertPrestadorError) return res.status(500).json({ error: 'Erro ao reverter saldo do prestador' });

  // Reverter saldo do cliente
  const { error: revertClienteError } = await supabase
    .from('users')
    .update({ saldo: cliente.saldo + preco })
    .eq('id', reserva.cliente_id);

  if (revertClienteError) return res.status(500).json({ error: 'Erro ao reverter saldo do cliente' });

  // Atualizar status da reserva
  const { data, error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'cancelado' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) return res.status(400).json(updateError);

  res.json({ message: 'Reserva cancelada com sucesso', reserva: data });
}

async function completeReservation(req, res) {
  const { id } = req.params;

  const { data: reserva, error: reservaError } = await supabase
    .from('reservations')
    .select('*, services(*)')
    .eq('id', id)
    .single();

  if (reservaError || !reserva) {
    return res.status(404).json({ error: 'Reserva não encontrada' });
  }

  // Só o prestador dono do serviço pode marcar como concluído
  if (reserva.services?.prestador_id !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão para concluir esta reserva' });
  }

  if (reserva.status !== 'pendente') {
    return res.status(400).json({ error: 'Só reservas pendentes podem ser concluídas' });
  }

  const { data, error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'concluido' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) return res.status(500).json({ error: 'Erro ao concluir reserva' });

  res.json(data);
}

async function history(req, res) {
  const { tipo, id } = req.user;

  let query = supabase
    .from('reservations')
    .select('*, services(*), users:cliente_id(id, nome_completo, email, nif)');

  if (tipo === 'prestador') {
    // Get reservations where the service belongs to this provider
    const { data: providerServices, error: svcErr } = await supabase
      .from('services')
      .select('id')
      .eq('prestador_id', id);

    if (svcErr) return res.status(400).json(svcErr);

    const serviceIds = (providerServices || []).map(s => s.id);

    if (serviceIds.length === 0) return res.json([]);

    query = query.in('servico_id', serviceIds);
  } else {
    query = query.eq('cliente_id', id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return res.status(400).json(error);

  res.json(data);
}

module.exports = { createReservation, cancelReservation, completeReservation, history };
