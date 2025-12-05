# Domain Overview

## Plataforma de Pedidos
- Usuário cria pedidos via API Gateway
- Serviços internos processam estoque, pagamento e notificações

## Entidade Order (versão inicial)
- id (string/uuid)
- items: array { sku, quantity }
- totalAmount (number)
- status (pending | confirmed | canceled | failed)