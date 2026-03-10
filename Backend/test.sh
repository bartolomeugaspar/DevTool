#!/usr/bin/env bash
set -e

BASE="http://localhost:3000/api"
TS=$(date +%s)
EMAIL_C="cliente_${TS}@test.com"
EMAIL_P="prestador_${TS}@test.com"
NIF_C="111${TS}"
NIF_P="222${TS}"

pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; }
section() { echo; echo "━━━ $1 ━━━"; }

# ─── 1. REGISTER ──────────────────────────────────────────────
section "1. REGISTER"

R=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"nome_completo\":\"Joao Cliente\",\"nif\":\"$NIF_C\",\"email\":\"$EMAIL_C\",\"senha\":\"123456\",\"tipo_usuario\":\"cliente\"}")
echo "  cliente: $R"
echo "$R" | grep -q '"id"' && pass "cliente registado" || fail "cliente register FALHOU"

R=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"nome_completo\":\"Maria Prestadora\",\"nif\":\"$NIF_P\",\"email\":\"$EMAIL_P\",\"senha\":\"123456\",\"tipo_usuario\":\"prestador\"}")
echo "  prestador: $R"
echo "$R" | grep -q '"id"' && pass "prestador registado" || fail "prestador register FALHOU"

# ─── 2. LOGIN ─────────────────────────────────────────────────
section "2. LOGIN"

TOKEN_C=$(curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_C\",\"senha\":\"123456\"}" | jq -r '.token')
[ "$TOKEN_C" != "null" ] && [ -n "$TOKEN_C" ] && pass "login cliente OK" || fail "login cliente FALHOU"

TOKEN_P=$(curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_P\",\"senha\":\"123456\"}" | jq -r '.token')
[ "$TOKEN_P" != "null" ] && [ -n "$TOKEN_P" ] && pass "login prestador OK" || fail "login prestador FALHOU"

# ─── 3. CREATE SERVICE ────────────────────────────────────────
section "3. CREATE SERVICE (prestador)"

R=$(curl -s -X POST "$BASE/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_P" \
  -d '{"nome":"Corte de cabelo","descricao":"Corte masculino","preco":2000}')
echo "  $R"
SERVICE_ID=$(echo "$R" | jq -r '.id')
[ "$SERVICE_ID" != "null" ] && [ -n "$SERVICE_ID" ] && pass "servico criado (id=$SERVICE_ID)" || fail "criar servico FALHOU"

section "3b. CREATE SERVICE (cliente deve falhar)"
R=$(curl -s -X POST "$BASE/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_C" \
  -d '{"nome":"X","descricao":"X","preco":100}')
echo "  $R"
echo "$R" | grep -q '"error"' && pass "cliente bloqueado (403)" || fail "cliente NAO foi bloqueado"

# ─── 4. LIST SERVICES ─────────────────────────────────────────
section "4. GET /services"
R=$(curl -s "$BASE/services" -H "Authorization: Bearer $TOKEN_C")
echo "  $R" | head -c 200
echo "$R" | jq -e 'type == "array"' > /dev/null && pass "lista de servicos OK" || fail "listar servicos FALHOU"

section "4b. GET /services/:id"
R=$(curl -s "$BASE/services/$SERVICE_ID" -H "Authorization: Bearer $TOKEN_C")
echo "  $R"
echo "$R" | grep -q "\"id\"" && pass "buscar servico por id OK" || fail "buscar por id FALHOU"

# ─── 5. RESERVA (saldo insuficiente) ──────────────────────────
section "5. POST /reservations (saldo insuficiente - deve falhar)"
R=$(curl -s -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_C" \
  -d "{\"servico_id\":\"$SERVICE_ID\"}")
echo "  $R"
echo "$R" | grep -qi "saldo\|insuficiente\|error" && pass "saldo insuficiente bloqueado" || fail "saldo insuficiente NAO foi bloqueado"

# ─── 5b. Adicionar saldo ao cliente via Supabase diretamente ──
section "5b. Injetar saldo no cliente (via API Supabase REST)"
CLIENT_ID=$(curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_C\",\"senha\":\"123456\"}" | jq -r '.token' | \
  python3 -c "import sys,base64,json; p=sys.stdin.read().strip().split('.')[1]; p+='='*(-len(p)%4); print(json.loads(base64.b64decode(p))['id'])")
echo "  CLIENT_ID=$CLIENT_ID"

SUPABASE_URL="https://xkkjqtgtknblzxtbdyga.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2pxdGd0a25ibHp4dGJkeWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzUzMDAsImV4cCI6MjA4ODcxMTMwMH0.wBVtOtvDYnZu9fAo0zpOd4wyqyeyOlf-mHgECP7VG_g"

curl -s -X PATCH "$SUPABASE_URL/rest/v1/users?id=eq.$CLIENT_ID" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"saldo":10000}' && pass "saldo injetado" || fail "injectar saldo FALHOU"

# ─── 6. CRIAR RESERVA ─────────────────────────────────────────
section "6. POST /reservations (com saldo)"
R=$(curl -s -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_C" \
  -d "{\"servico_id\":\"$SERVICE_ID\"}")
echo "  $R"
RESERVA_ID=$(echo "$R" | jq -r '.id')
[ "$RESERVA_ID" != "null" ] && [ -n "$RESERVA_ID" ] && pass "reserva criada (id=$RESERVA_ID)" || fail "criar reserva FALHOU"

# ─── 6b. Prestador nao pode reservar ──────────────────────────
section "6b. POST /reservations (prestador deve falhar)"
R=$(curl -s -X POST "$BASE/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_P" \
  -d "{\"servico_id\":\"$SERVICE_ID\"}")
echo "  $R"
echo "$R" | grep -q '"error"' && pass "prestador bloqueado de reservar" || fail "prestador NAO foi bloqueado"

# ─── 7. HISTÓRICO ─────────────────────────────────────────────
section "7. GET /reservations/history"
R=$(curl -s "$BASE/reservations/history" -H "Authorization: Bearer $TOKEN_C")
echo "  $R" | head -c 300
echo "$R" | jq -e 'type == "array" and length > 0' > /dev/null && pass "historico OK" || fail "historico FALHOU"

section "7b. GET /reservations"
R=$(curl -s "$BASE/reservations" -H "Authorization: Bearer $TOKEN_C")
echo "$R" | jq -e 'type == "array"' > /dev/null && pass "GET /reservations OK" || fail "GET /reservations FALHOU"

# ─── 8. CANCELAR RESERVA ──────────────────────────────────────
section "8. DELETE /reservations/:id"
R=$(curl -s -X DELETE "$BASE/reservations/$RESERVA_ID" \
  -H "Authorization: Bearer $TOKEN_C")
echo "  $R"
echo "$R" | grep -qi "cancelad" && pass "reserva cancelada OK" || fail "cancelar reserva FALHOU"

section "8b. Cancelar reserva ja cancelada (deve falhar)"
R=$(curl -s -X DELETE "$BASE/reservations/$RESERVA_ID" \
  -H "Authorization: Bearer $TOKEN_C")
echo "  $R"
echo "$R" | grep -q '"error"' && pass "duplo cancelamento bloqueado" || fail "duplo cancelamento NAO bloqueado"

# ─── 9. DELETE SERVICE ────────────────────────────────────────
section "9. DELETE /services/:id"
R=$(curl -s -X DELETE "$BASE/services/$SERVICE_ID" \
  -H "Authorization: Bearer $TOKEN_P")
echo "  $R"
echo "$R" | grep -qi "removid\|sucesso" && pass "servico removido OK" || fail "remover servico FALHOU"

section "9b. DELETE /services/:id sem permissao (cliente)"
# criar novo servico para testar
R2=$(curl -s -X POST "$BASE/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_P" \
  -d '{"nome":"Outro","descricao":"Teste","preco":500}')
SID2=$(echo "$R2" | jq -r '.id')
R=$(curl -s -X DELETE "$BASE/services/$SID2" \
  -H "Authorization: Bearer $TOKEN_C")
echo "  $R"
echo "$R" | grep -q '"error"' && pass "cliente bloqueado de deletar servico" || fail "cliente NAO foi bloqueado de deletar"

# ─── 10. AUTH GUARDS ──────────────────────────────────────────
section "10. Sem token (deve retornar 401)"
R=$(curl -s "$BASE/services")
echo "  $R"
echo "$R" | grep -q '"error"' && pass "sem token bloqueado (401)" || fail "sem token NAO bloqueado"

echo
echo "━━━ TESTES CONCLUÍDOS ━━━"
