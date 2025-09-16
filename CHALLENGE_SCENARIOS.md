# Escenarios de Challenge para DevOps

Este documento describe problemas comunes que se pueden introducir en la aplicación para evaluar las habilidades de diagnóstico y resolución de un candidato DevOps.

## 🎯 Escenarios de Evaluación

### 1. Problemas de Configuración

#### Escenario A: Puerto Incorrecto
**Problema**: Cambiar el puerto en el ConfigMap pero no en el Service
```yaml
# En configmap.yaml
PORT: "3000"  # ❌ Cambiar de 8080 a 3000

# service.yaml mantiene puerto 8080
# deployment.yaml mantiene containerPort 8080
```

**Síntomas**: 
- Pod arranca correctamente
- Service no puede conectar
- Health checks fallan

#### Escenario B: Variable de Entorno Faltante
**Problema**: Eliminar una variable crítica del ConfigMap
```yaml
# Eliminar APP_NAME del configmap.yaml
# data:
#   APP_NAME: "devops-challenge-app"  # ❌ Comentar esta línea
```

**Síntomas**:
- Aplicación usa valores por defecto
- Logs muestran configuración incorrecta

### 2. Problemas de Recursos

#### Escenario C: Límites de Memoria Muy Bajos
**Problema**: Configurar límites de memoria insuficientes
```yaml
resources:
  limits:
    memory: "32Mi"  # ❌ Muy bajo, debería ser 150Mi
    cpu: "200m"
```

**Síntomas**:
- Pod se reinicia constantemente (OOMKilled)
- CrashLoopBackOff

#### Escenario D: CPU Request Muy Alto
**Problema**: Request de CPU imposible de satisfacer
```yaml
resources:
  requests:
    cpu: "2000m"  # ❌ Muy alto para un cluster local
    memory: "64Mi"
```

**Síntomas**:
- Pod queda en estado Pending
- Eventos muestran "Insufficient cpu"

### 3. Problemas de Health Checks

#### Escenario E: Path Incorrecto en Probes
**Problema**: Configurar path incorrecto para health checks
```yaml
livenessProbe:
  httpGet:
    path: /healthz  # ❌ Debería ser /health
    port: 8080
```

**Síntomas**:
- Pod se reinicia constantemente
- Probes fallan con 404

#### Escenario F: Timeout Muy Corto
**Problema**: Timeout insuficiente para health checks
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  timeoutSeconds: 1  # ❌ Muy corto
  failureThreshold: 1  # ❌ Muy estricto
```

**Síntomas**:
- Pod nunca se marca como Ready
- Service no recibe tráfico

### 4. Problemas de Imagen

#### Escenario G: Imagen Inexistente
**Problema**: Referenciar una imagen que no existe
```yaml
containers:
- name: devops-challenge-app
  image: devops-challenge-app:v2.0.0  # ❌ Tag inexistente
  imagePullPolicy: Always  # ❌ Cambiar de Never
```

**Síntomas**:
- Pod queda en ImagePullBackOff
- Eventos muestran error de pull

#### Escenario H: ImagePullPolicy Incorrecto
**Problema**: Política de pull incorrecta para desarrollo local
```yaml
imagePullPolicy: Always  # ❌ Debería ser Never para local
```

**Síntomas**:
- Intenta descargar imagen de registry
- Falla si no está en registry público

### 5. Problemas de Red

#### Escenario I: Selector Incorrecto
**Problema**: Service con selector que no coincide
```yaml
# En service.yaml
selector:
  app: wrong-app-name  # ❌ Debería ser devops-challenge-app
```

**Síntomas**:
- Service no tiene endpoints
- Port-forward falla
- No hay conectividad

#### Escenario J: Puerto de Contenedor Incorrecto
**Problema**: containerPort no coincide con la aplicación
```yaml
ports:
- containerPort: 3000  # ❌ App corre en 8080
  name: http
```

**Síntomas**:
- Health checks fallan
- Service no puede conectar

### 6. Problemas de Seguridad

#### Escenario K: Usuario Root
**Problema**: Ejecutar como root (comentar securityContext)
```yaml
# securityContext:  # ❌ Comentar todo el bloque
#   runAsNonRoot: true
#   runAsUser: 1001
```

**Síntomas**:
- Aplicación funciona pero es insegura
- Violación de mejores prácticas

### 7. Problemas de Configuración Avanzados

#### Escenario L: Múltiples Problemas
**Problema**: Combinar varios errores sutiles
- Puerto incorrecto en ConfigMap
- Timeout muy corto en readiness
- Límite de memoria bajo

**Síntomas**:
- Comportamiento errático
- Requiere análisis sistemático

## 🔧 Comandos de Diagnóstico Esperados

Los candidatos deberían usar estos comandos para diagnosticar:

```bash
# Estado general
kubectl get pods -l app=devops-challenge-app
kubectl get all -l app=devops-challenge-app

# Diagnóstico detallado
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp

# Verificar configuración
kubectl get configmap devops-challenge-config -o yaml
kubectl describe service devops-challenge-service

# Debug de conectividad
kubectl port-forward service/devops-challenge-service 8080:8080
curl http://localhost:8080/health
```

## 📋 Criterios de Evaluación

### Excelente (Senior)
- Identifica el problema rápidamente
- Usa comandos de diagnóstico apropiados
- Explica la causa raíz
- Propone solución correcta
- Verifica la solución

### Bueno (Mid-level)
- Identifica el problema con alguna guía
- Usa algunos comandos de diagnóstico
- Encuentra la solución eventualmente
- Verifica parcialmente

### Necesita Mejora (Junior)
- Requiere mucha guía
- Comandos de diagnóstico limitados
- Solución con ayuda
- Verificación incompleta

## 🎲 Generación Aleatoria de Problemas

Para crear variedad en las evaluaciones, se puede usar un script que introduzca aleatoriamente uno o más de estos problemas antes de entregar el challenge al candidato.

```bash
# Ejemplo de script para introducir problemas
./introduce-problems.sh --scenario=random --difficulty=medium
```

## 📝 Notas para Evaluadores

1. **Tiempo esperado**: 15-30 minutos dependiendo del escenario
2. **Documentar**: Qué comandos usa el candidato
3. **Observar**: Metodología de troubleshooting
4. **Evaluar**: Comunicación durante el proceso
5. **Verificar**: Que la solución sea completa y correcta
