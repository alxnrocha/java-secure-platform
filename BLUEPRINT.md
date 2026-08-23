# ✦ VAULTLEDGER CORE — BLUEPRINT OFICIAL ✦
## Enterprise Double-Entry Financial Engine & Security Platform

> **Portfólio Profissional — Projeto 19**  
> **Repositório GitHub:** `https://github.com/alxnrocha/java-secure-platform`  
> **Stack:** React 19 • TypeScript 5.8 • Vite 8 • Tailwind CSS v4 • Java 21 LTS • Spring Boot 3.3+ • Spring Security 6 (Stateless RSA JWT + Refresh Rotation) • PostgreSQL 17 • Redis 7 • Flyway • Testcontainers • MapStruct • TanStack Table v8 • Recharts • JUnit 5 • Vitest

---

## 1. Visão Executiva do Produto

**VaultLedger** é uma plataforma financeira corporativa de **Livro Razão de Partida Dobrada (Double-Entry General Ledger)** e **Controle de Segurança com Trilha de Auditoria Forense Imutável**. Concebida para instituições financeiras, fintechs e departamentos de tesouraria que exigem consistência transacional matemática rigorosa, isolamento RBAC (*Role-Based Access Control*) em quatro camadas e conformidade com normas regulatórias financeiras (SOX / PCI-DSS).

### Pilares de Negócio:
1. **Motor de Partida Dobrada (Double-Entry Engine):** Cada movimentação financeira no sistema é composta por no mínimo duas partidas contábeis balanceadas (um Débito e um Crédito). A soma de todos os débitos deve ser rigorosamente igual à soma de todos os créditos ($\sum Débitos = \sum Créditos$), garantindo conservação de saldo em nível transacional atômico (`SERIALIZABLE`).
2. **Plano de Contas Contábil Completo (Chart of Accounts):** Gestão estruturada de contas categorizadas em cinco naturezas financeiras fundamentais:
   - **ASSET (Ativos):** Caixa Operacional, Tesouraria, Contas a Receber, Liquidez em Custódia.
   - **LIABILITY (Passivos):** Depósitos de Clientes, Obrigações Fiscais, Linhas de Crédito.
   - **EQUITY (Patrimônio Líquido):** Capital Social, Reservas de Lucro.
   - **REVENUE (Receitas):** Taxas de Transação, Spread Cambial, Serviços de Custódia.
   - **EXPENSE (Despesas):** Custos de Liquidação Bancária, Infraestrutura, Taxas de Rede.
3. **Segurança Avançada & Matriz RBAC Granular:**
   - `ROLE_ADMIN`: Gestão total de usuários, auditoria forense, bloqueio de contas e configurações de segurança.
   - `ROLE_OPERATOR`: Execução de transferências atômicas, lançamentos contábeis e depósitos.
   - `ROLE_AUDITOR`: Acesso somente-leitura irrestrito ao Livro Razão, trilha criptográfica de logs e relatórios regulatórios.
   - `ROLE_COMPLIANCE_OFFICER`: Aprovação de transações de alto valor, congelamento preventivo de contas e análise de risco.
4. **Trilha de Auditoria Criptográfica Forense (Tamper-Evident SHA-256 Chain):**
   - Cada mutação de estado no banco de dados gera um registro imutável com o snapshot do estado anterior (`payload_before`), estado atual (`payload_after`), autor, endereço IP e um **Hash SHA-256 encadeado** ao registro anterior (estilo *blockchain light*), tornando qualquer adulteração manual no banco de dados imediatamente detectável.
5. **Autenticação Stateless de Alta Segurança:**
   - Tokens JWT assinados com par de chaves assimétricas **RSA-256** (chaves de 2048-bit).
   - Rotação de Refresh Token no **Redis 7** com detecção automática de reutilização (revogação imediata de toda a família de tokens em caso de tentativa de roubo).

---

## 2. Arquitetura do Sistema

```text
19-java-secure-platform/
├── client/                               # Frontend React 19 + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── api/                          # Cliente HTTP tipado com suporte a modo Mock Standalone
│   │   ├── assets/                       # Estilos globais e tokens Dark Fintech (Stripe/Brex UI)
│   │   ├── components/
│   │   │   ├── accounts/                 # Chart of Accounts, Saldos por Natureza, AccountCard
│   │   │   ├── ledger/                   # DoubleEntryTable (TanStack Table), DebitCreditBadge, FilterBar
│   │   │   ├── transfer/                 # AtomicTransferModal, DoubleEntryPreview, SolvencyChecker
│   │   │   ├── audit/                    # ForensicAuditLogTable, SHA256ChainInspector, DiffModal
│   │   │   ├── rbac/                     # RoleSwitcher, PermissionMatrixInspector, SecurityShield
│   │   │   ├── analytics/                # BalanceSheetCard, LiquidityFlowChart, TransactionVolumeChart
│   │   │   ├── layout/                   # AppHeader, Sidebar, RoleIndicatorBadge, SecurityStatus
│   │   │   └── ui/                       # Primitivas: Button, Card, Badge, Modal, Input, Select, Toast
│   │   ├── data/                         # Mock datasets realistas para preview perfeito no GitHub Pages
│   │   ├── stores/                       # Zustand 5 (Auth/RBAC State, Ledger Filters, Selected Account)
│   │   ├── types/                        # Interfaces e DTOs TypeScript espelhados no backend
│   │   ├── App.tsx                       # Layout mestre responsivo Dark Fintech
│   │   └── main.tsx                      # Ponto de entrada React
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                               # Backend Java 21 LTS + Spring Boot 3.3+
│   ├── src/main/java/com/alxnrocha/vaultledger/
│   │   ├── config/                       # SecurityConfig, RsaKeyConfig, RedisConfig, OpenApiConfig, CorsConfig
│   │   ├── controller/                   # AuthController, AccountController, LedgerController, AuditController, MetricsController
│   │   ├── dto/                          # Java 21 Records (TransferRequestDTO, AccountDTO, LedgerEntryDTO, AuditLogDTO)
│   │   ├── entity/                       # JPA Entities (@Entity User, Account, Transaction, LedgerEntry, AuditLog)
│   │   ├── enums/                        # AccountType, EntryType, TransactionStatus, RoleType
│   │   ├── exception/                    # GlobalExceptionHandler (@RestControllerAdvice, RFC 7807)
│   │   ├── mapper/                       # MapStruct Mappers (Entity <-> DTO)
│   │   ├── repository/                   # Spring Data JPA Repositories (JPQL queries com Pessimistic Lock)
│   │   ├── security/                     # JwtTokenService, CustomUserDetailsService, SecurityAuditorAware
│   │   ├── service/                      # LedgerEngineService, AccountService, AuditLogService, AuthService
│   │   └── VaultLedgerApplication.java   # Spring Boot Main Class
│   ├── src/main/resources/
│   │   ├── db/migration/                 # V1__initial_schema.sql, V2__seed_fintech_data.sql (Flyway)
│   │   └── application.yml               # Configuração do datasource, Redis, JWT e Swagger
│   ├── src/test/java/com/alxnrocha/vaultledger/
│   │   ├── integration/                  # Testes com Testcontainers (PostgreSQL 17 + Redis 7)
│   │   └── service/                      # Testes unitários do motor de partida dobrada (JUnit 5 + Mockito)
│   ├── pom.xml                           # Configuração Maven com Java 21, Spring Boot 3.3, Spring Security 6
│   └── mvnw / mvnw.cmd                   # Maven Wrapper para execução independente
├── compose.yaml                          # PostgreSQL 17 Alpine + Redis 7 Alpine + PgAdmin
├── design/
│   ├── mockup.png                        # Mockup oficial de alta fidelidade
│   └── PROMPTS.md                        # Prompts de UI/UX (local, no .gitignore)
├── .github/workflows/deploy.yml          # CI/CD Pipeline (Maven build + Vitest + GitHub Pages)
├── .gitignore
├── BLUEPRINT.md
└── README.md
```

---

## 3. Modelo de Banco de Dados Relacional (PostgreSQL 17)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "possui tokens"
    USERS ||--o{ TRANSACTIONS : "executa transações"
    USERS ||--o{ AUDIT_LOGS : "gera auditoria"
    
    ACCOUNTS ||--o{ LEDGER_ENTRIES : "possui partidas"
    TRANSACTIONS ||--|{ LEDGER_ENTRIES : "composta por (>= 2)"

    USERS {
        UUID id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR role
        BOOLEAN is_active
        BOOLEAN mfa_enabled
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    REFRESH_TOKENS {
        UUID id PK
        UUID user_id FK
        VARCHAR token_hash UK
        UUID family_id
        BOOLEAN is_revoked
        TIMESTAMP expires_at
        TIMESTAMP created_at
    }

    ACCOUNTS {
        UUID id PK
        VARCHAR account_number UK
        VARCHAR name
        VARCHAR type
        VARCHAR currency
        DECIMAL balance
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    TRANSACTIONS {
        UUID id PK
        VARCHAR reference_code UK
        VARCHAR description
        VARCHAR transaction_type
        VARCHAR status
        DECIMAL total_amount
        VARCHAR currency
        UUID executed_by_user_id FK
        TIMESTAMP created_at
    }

    LEDGER_ENTRIES {
        UUID id PK
        UUID transaction_id FK
        UUID account_id FK
        VARCHAR entry_type
        DECIMAL amount
        DECIMAL balance_after
        TIMESTAMP created_at
    }

    AUDIT_LOGS {
        UUID id PK
        UUID user_id FK
        VARCHAR action
        VARCHAR resource
        VARCHAR entity_id
        JSONB payload_before
        JSONB payload_after
        VARCHAR ip_address
        VARCHAR user_agent
        VARCHAR previous_hash
        VARCHAR current_hash
        TIMESTAMP created_at
    }
```

### Regras de Invariância Contábil & Integridade:
1. **Invariante Fundamental:** Em qualquer transação $T$, a soma das entradas com `entry_type = DEBIT` é exatamente igual à soma das entradas com `entry_type = CREDIT`.
2. **Equação Contábil Geral:** $\text{Ativos} = \text{Passivos} + \text{Patrimônio Líquido} + (\text{Receitas} - \text{Despesas})$.
3. **Controle de Concorrência:** As atualizações de saldo utilizam bloqueio pessimista (`PESSIMISTIC_WRITE`) no banco de dados e isolamento `SERIALIZABLE` para eliminar race conditions em movimentações simultâneas de uma mesma conta.
4. **Imutabilidade do Ledger:** As tabelas `transactions` e `ledger_entries` são estritamente *Append-Only*. Correções de lançamentos são feitas exclusivamente por meio de transações estornadoras (*reversal transactions*).

---

## 4. Matriz de Permissões RBAC (Role-Based Access Control)

| Ação / Endpoint | `ROLE_ADMIN` | `ROLE_OPERATOR` | `ROLE_AUDITOR` | `ROLE_COMPLIANCE_OFFICER` |
|:---|:---:|:---:|:---:|:---:|
| `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/accounts` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/accounts` (Criar Conta) | ✅ | ❌ | ❌ | ❌ |
| `PATCH /api/v1/accounts/:id/freeze` | ✅ | ❌ | ❌ | ✅ |
| `GET /api/v1/ledger/entries` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/transactions/transfer` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/v1/transactions/reverse` | ✅ | ❌ | ❌ | ✅ |
| `GET /api/v1/audit/logs` | ✅ | ❌ | ✅ | ✅ |
| `GET /api/v1/audit/verify-chain` | ✅ | ❌ | ✅ | ✅ |
| `GET /api/v1/metrics/solvency` | ✅ | ✅ | ✅ | ✅ |

---

## 5. Roteiro de Execução (6 Milestones & 21 Issues Granulares)

### 🔹 Milestone 1: Setup do Monorepo, Dados & Entidades JPA
- **#1:** `Core Scaffold & Multi-Module Architecture` *(Java 21, Spring Boot 3.3, React 19, Docker Compose)* — **[Concluído]**
- **#2:** `Relational Database Schema & Flyway Migrations` *(DDL V1 + Seeds V2 com Plano de Contas)*
- **#3:** `JPA Entities, Enums de Natureza Contábil & Repositórios com Pessimistic Lock`

### 🔹 Milestone 2: Spring Security 6, Criptografia RSA & Redis
- **#4:** `Infraestrutura de Chaves RSA-256 & Serviço JWT Stateless`
- **#5:** `Rotação de Refresh Token no Redis com Detecção de Reuso e Blacklist`
- **#6:** `Security Filter Chain do Spring Security 6 & Avaliador de Matriz RBAC`
- **#7:** `Auth REST API (/login, /refresh, /me, /logout) & DTOs Jakarta`

### 🔹 Milestone 3: Motor Contábil Double-Entry & Trilha Forense SHA-256
- **#8:** `Serviço do Plano de Contas (Chart of Accounts) & Saldos por Natureza`
- **#9:** `Motor de Partidas Dobradas (ΣD = ΣC) com Isolamento SERIALIZABLE`
- **#10:** `Mecanismo de Estorno Contábil & Cálculo de Índices de Solvência`
- **#11:** `Serviço de Auditoria Forense Imutável com Hash SHA-256 Encadeado`
- **#12:** `REST Controllers (Ledger, Audit, Metrics) & OpenAPI Swagger Docs`

### 🔹 Milestone 4: Design System Dark Fintech & Estado Reativo
- **#14:** `Dark Fintech Design System (Tailwind v4), Shell de Navegação & Seletor RBAC`
- **#15:** `Mock Engine Standalone & Camada de API Client Tipada (para GitHub Pages)`

### 🔹 Milestone 5: Módulos de Interface React 19 (TanStack Table & Recharts)
- **#16:** `Árvore do Plano de Contas & Cards de Saldo por Natureza Contábil`
- **#17:** `Explorador do Livro Razão em Tempo Real com TanStack Table v8`
- **#18:** `Terminal de Transferência Atômica com Preview Contábil & Validação Zod`
- **#19:** `Inspetor da Trilha de Auditoria Forense & Verificador Criptográfico SHA-256`
- **#20:** `Dashboard Analítico & Gráficos de Solvência / Liquidez com Recharts`

### 🔹 Milestone 6: QA Automatizado, CI/CD & Deploy
- **#21:** `Suíte de Testes Automatizados (JUnit 5 + Mockito + Testcontainers + Vitest)`
- **#22:** `GitHub Actions CI/CD Pipeline, Documentação Executiva e Deploy no GitHub Pages`
