# AuditAI — prototipo de cuentas médicas

Demo pública de los tres portales (Radicación IPS, Auditoría HITL y Consola Admin).

## GitHub Pages

Los tres aplicativos se publican **juntos** en el mismo sitio. En local usan puertos distintos (`4200` / `4210` / `4220`); en Pages equivalen a rutas:

| Portal | Local | GitHub Pages |
|---|---|---|
| Hub | — | https://logike-co.github.io/ibs-audit-ai-prototype/ |
| Radicación IPS | http://localhost:4200 | https://logike-co.github.io/ibs-audit-ai-prototype/radicacion/ |
| Auditoría HITL | http://localhost:4210 | https://logike-co.github.io/ibs-audit-ai-prototype/hitl/ |
| Consola Admin | http://localhost:4220 | https://logike-co.github.io/ibs-audit-ai-prototype/admin/ |

La navegación interna del HUD de presentador usa esas mismas URLs, así que los tres tienen que estar publicados a la vez (el workflow de Pages lo garantiza).

## Local

```bash
cd audit-ai-radicacion-web && npm start          # :4200
cd audit-ai-hitl-auditoria-web && npm start      # :4210
cd audit-ai-admin-console-web && npm start       # :4220
```
