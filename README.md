# DevOps Challenge - Node.js Application

Este repositorio contiene una aplicación simple en Node.js/TypeScript utilizada para evaluar habilidades de DevOps en Kubernetes.

---

## 🔧 Correcciones realizadas en la aplicación

### 📌 Imagen de contenedor
- En el archivo `deployment.yaml` se estaba utilizando una imagen incorrecta.  
- Se corrigió para usar la imagen correcta:
  ```yaml
  image: devops-challenge-app:dev