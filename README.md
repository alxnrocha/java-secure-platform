# VaultLedger Core — Plataforma Financiera de Contabilidad de Partida Doble & Auditoría Criptográfica

[![Java 21 LTS](https://img.shields.io/badge/Java-21%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.3.3](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17.0-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis 7](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![RSA-2048 & SHA-256](https://img.shields.io/badge/Security-RSA--2048%20%7C%20SHA--256-10B981?logo=lock&logoColor=white)](https://csrc.nist.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Demostración Interactiva en Vivo (GitHub Pages):** [https://alxnrocha.github.io/java-secure-platform/](https://alxnrocha.github.io/java-secure-platform/)

---

## 🏛️ Visión General & Propósito Arquitectónico

**VaultLedger Core** es una plataforma integral de infraestructura bancaria y contabilidad corporativa diseñada bajo los estándares de tolerancia a fallos, inmutabilidad contable y cumplimiento normativo estricto (**SOC 2 Type II, PCI-DSS v4.0, Basel III e ISO 27001**).

La plataforma implementa un motor de **Libro Mayor de Partida Doble (*Double-Entry General Ledger*)** con aislamiento transaccional `SERIALIZABLE`, control de concurrencia mediante bloqueo pesimista en orden lexicográfico para prevención de *deadlocks*, autenticación asimétrica **RSA-2048** con rotación de tokens de refresco en **Redis 7**, y una **cadena de auditoría forense inmutable encadenada criptográficamente con hashes SHA-256**.

```
                           ARQUITECTURA DE ALTO NIVEL
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      REACT 19 CLIENT (SPA + VITE + TAILWIND V4)             │
 │   • Clean Light Mode Fintech (Stripe Style)                                 │
 │   • Interactive RBAC Role Switcher (Admin, Operator, Auditor, Compliance)   │
 │   • TanStack Table v8 Real-Time Ledger + Recharts Liquidity Analytics       │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ HTTPS / REST (OpenAPI 3)
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                 SPRING BOOT 3.3 BACKEND (JAVA 21 LTS MULTI-THREADED)        │
 │  ┌─────────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐ │
 │  │ Spring Security 6 / RSA │ │ Double-Entry Engine  │ │ Forensic Audit    │ │
 │  │ Stateless JWT Provider  │ │ Serializable Engine  │ │ SHA-256 Chaining  │ │
 │  └────────────┬────────────┘ └──────────┬───────────┘ └─────────┬─────────┘ │
 └───────────────┼─────────────────────────┼───────────────────────┼───────────┘
                 │                         │                       │
                 ▼                         ▼                       ▼
 ┌────────────────────────┐    ┌───────────────────────────────────────────────┐
 │   REDIS 7 (CACHE / KV) │    │          POSTGRESQL 17 / FLYWAY MIGRATIONS    │
 │ • Token Family Trees   │    │  • Chart of Accounts & Hierarchies            │
 │ • Reuse Detection & IP │    │  • Immutable Ledger Transactions & Entries    │
 │ • Instant Revocation   │    │  • Forensic Audit Chain (Genesis to Current)  │
 └────────────────────────┘    └───────────────────────────────────────────────┘
```

---

## ⚖️ Motor Contábil de Partida Doble e Invariante Fundamental

Cada transacción procesada en VaultLedger se compone de al menos dos asientos (*ledger entries*) que deben satisfacer rigurosamente la **Invariante Matemática de Equilibrio Contable**:

$$\sum_{i=1}^{n} \text{Débito}_i = \sum_{j=1}^{m} \text{Crédito}_j > 0 \quad (\Delta = 0.00)$$

### Ecuación Patrimonial Fundamental:
$$\text{Activo} = \text{Pasivo} + \text{Patrimonio Neto} + (\text{Ingresos} - \text{Gastos})$$

### Naturaleza de Saldos y Reglas de Mutación:
| Naturaleza | Código | Saldo Normal | Impacto Débito ($+D$) | Impacto Crédito ($+C$) |
| :--- | :---: | :---: | :---: | :---: |
| **Activo (*Asset*)** | `1xxx` | **Deudor (DEBIT)** | Aumenta ($+$) | Disminuye ($-$) |
| **Pasivo (*Liability*)** | `2xxx` | **Acreedor (CREDIT)** | Disminuye ($-$) | Aumenta ($+$) |
| **Patrimonio (*Equity*)** | `3xxx` | **Acreedor (CREDIT)** | Disminuye ($-$) | Aumenta ($+$) |
| **Ingresos (*Revenue*)** | `4xxx` | **Acreedor (CREDIT)** | Disminuye ($-$) | Aumenta ($+$) |
| **Gastos (*Expense*)** | `5xxx` | **Deudor (DEBIT)** | Aumenta ($+$) | Disminuye ($-$) |

* **Concurrencia sin Bloqueos Mutuos (*Deadlock-Free Pessimistic Locking*):** Las cuentas involucradas en una transferencia se bloquean mediante `PESSIMISTIC_WRITE` ordenando siempre los identificadores alfabéticamente (`TreeSet<String> uniqueCodes`) antes de la ejecución.
* **Mecanismo de Estorno Contable (*Reversal*):** Cumpliendo la normativa contable internacional, los registros confirmados no se eliminan físicamente; se genera un asiento inverso compensatorio vinculando el identificador de la transacción original (`reversalOfId`).

---

## 🔐 Seguridad Bancaria, Criptografía Asimétrica & RBAC

### 1. Par de Claves Asimétricas RSA-2048 & JWT sin Estado
* Las credenciales de acceso se firman digitalmente utilizando una clave privada RSA de 2048 bits generada por `RsaKeyProvider` y se validan mediante la clave pública correspondiente (`RSASSAPSS256`).
* Las peticiones autenticadas viajan con cabecera `Authorization: Bearer <JWT>` sin almacenar estado de sesión en el servidor.

### 2. Rotación de Refresh Tokens en Redis 7 con Detección de Reúso
* Cada refresco de sesión genera un nuevo par `AccessToken` + `RefreshToken` y revoca el token anterior.
* Cada token pertenece a un `familyId`. Si un actor malicioso intenta reutilizar un token revocado (*Token Reuse Attack*), Redis invalida inmediatamente toda la familia de tokens asociada y emite una alerta de seguridad.

### 3. Matriz de Control de Acceso Granular (RBAC de 4 Niveles)
| Rol RBAC | Consultar Catálogo | Crear Cuentas | Emitir Transferencias | Estornar Transacciones | Inspeccionar Auditoría Forense |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `ROLE_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ROLE_OPERATOR` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `ROLE_AUDITOR` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `ROLE_COMPLIANCE_OFFICER` | ✅ | ❌ | ❌ | ✅ | ✅ |

---

## 🔍 Cadena de Auditoría Forense Criptográfica SHA-256

Cada acción crítica en el sistema genera un bloque inmutable en la tabla `audit_logs`. Cada registro incluye el hash SHA-256 de su predecesor inmediato, conformando una **cadena criptográfica continua (*Blockchain-like Audit Trail*)**:

$$\text{Hash}_k = \text{SHA-256}\Big(\text{Hash}_{k-1} \mathbin{\Vert} \text{Action} \mathbin{\Vert} \text{Entity} \mathbin{\Vert} \text{EntityID} \mathbin{\Vert} \text{UserEmail} \mathbin{\Vert} \text{Payload}\Big)$$

$$\text{Bloque Gênesis: } \text{Hash}_0 = \mathtt{0000000000000000000000000000000000000000000000000000000000000000}$$

El endpoint `/api/v1/audit/verify` y la interfaz del cliente ejecutan una verificación en tiempo real bloque por bloque. Si una fila de la base de datos es manipulada manualmente, el verificador detecta de forma inmediata el índice exacto de la discrepancia.

---

## 💻 Módulos de la Interfaz de Usuario (React 19 + Tailwind v4)

La interfaz gráfica fue construida bajo la estética **Clean Light Mode Enterprise Fintech** (inspirada en Stripe, Mercury Bank y Brex):

1. **Dashboard General & Livro Razão:**
   - 4 Tarjetas de KPIs financieros con curvas de tendencia y métricas de balance.
   - Explorador jerárquico del Plan de Cuentas con agregación de saldos por naturaleza contable.
   - Tabla de Libro Diario con **TanStack Table v8**, ordenación, búsqueda y copiado de hashes SHA-256.
2. **Terminal de Transferencias Atómicas:**
   - Asistente en dos etapas con selección visual de cuentas de Débito y Crédito.
   - Caja de **Preview al Vivo de Partida Doble** con cálculo automático del efecto patrimonial.
   - Selo de invariante contable en tiempo real ($\Delta = €0.00$).
3. **Inspector de Auditoría Forense SHA-256:**
   - Panel de control de integridad criptográfica con botón interactivo de simulación de adulteración (*Simulate Tamper Demo*).
   - Gaveta lateral (*Slide-over Drawer*) con **Visualizador de Diff JSON (Antes vs Después)** y verificación de encadenamiento hash (*Prev, Current, Next*).
4. **Dashboard de Solvencia & Liquidez:**
   - Gráficos interactivos con **Recharts**: Curvas de flujo de compensación a 30 días y gráfico de barras del equilibrio del balance general.

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
* **Java 21 LTS** (OpenJDK / Eclipse Temurin)
* **Maven 3.9+**
* **Node.js 22 LTS & npm**
* **Docker & Docker Compose** (opcional para PostgreSQL y Redis locales)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/alxnrocha/java-secure-platform.git
cd java-secure-platform
```

### 2. Iniciar Servicios de Persistencia (Docker)
```bash
docker-compose up -d
```

### 3. Ejecutar el Backend (Spring Boot 3.3)
```bash
cd server
mvn clean spring-boot:run
```
* Servidor activo en `http://localhost:8080`
* Documentación Swagger OpenAPI 3 en `http://localhost:8080/swagger-ui.html`

### 4. Ejecutar el Cliente (React 19 + Vite)
```bash
cd ../client
npm install
npm run dev
```
* Aplicación activa en `http://localhost:5173/`

---

## 🧪 Suíte de Pruebas Automatizadas

El proyecto cuenta con una cobertura integral de pruebas unitarias, de integración y de seguridad:

```bash
# Ejecutar pruebas del servidor (JUnit 5, Spring Security, Mockito)
cd server
mvn test

# Ejecutar pruebas del cliente (Vitest, React Testing Library)
cd ../client
npm run test
```

### Resultados de la Suíte:
* **Backend:** **41 / 41 Pruebas Aprobadas** (`BUILD SUCCESS`).
* **Frontend:** **15 / 15 Pruebas Aprobadas** (Motor contable, jerarquía, transferencias, auditoría y solvencia).

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.

---
**Autor:** Alexandre Rocha  
**Portfolio:** [github.com/alxnrocha](https://github.com/alxnrocha)
