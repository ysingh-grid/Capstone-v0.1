# Codebase Map

**Actualizado en:** 2026-05-25T16:34:50.410979+00:00
**Proyecto:** Capstone-v0.1

## Propósito aparente del proyecto

The Geometry Agent Harness is a multi-agent system designed to autonomously generate, refine, and verify 3D parametric CAD models from natural language descriptions. It orchestrates a suite of AI agents using **Temporal** for resilient workflows, **CadQuery** for geometric execution, and **VTK/OCCT** for visual and mathematical verification.

## Stack y runtime detectados

- Runtime: `python`
- Lenguaje principal: `python`
- Framework: `fastapi`

## Entry points y rutas críticas

- main.py

## Módulos o dominios principales

- CADSmith
- CLAUDE.md
- PRD_Geometry_Agent_Harness (1).md
- PRD_Geometry_Agent_Harness.md.pdf
- README.md
- app.log
- artifacts
- harness

## Pruebas, build y despliegue

### Tests

- No se detecta una infraestructura clara de tests automatizados.

### Build / arranque

- No se detectan scripts claros de build o arranque más allá del código fuente.

### Despliegue / operación

- No se detectan artefactos claros de despliegue o CI/CD en la raíz.

## Convenciones y patrones que conviene respetar

- Mantener el punto de verdad de dependencias y tooling en los ficheros Python detectados.
- Seguir los patrones del framework `fastapi` antes de introducir estructuras nuevas.

## Riesgos, deuda visible y preguntas abiertas

- La ausencia de tests claros aumenta el riesgo de regresión al tocar el repo.
- No hay señales claras de despliegue/CI, así que conviene validar el camino de entrega antes de cambios grandes.
