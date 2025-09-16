# Correcion de la imagen en el archivo de deployment

- se estaba tomado mal la iamgen del contendor en el archivo deployment y se cambio por esta image: devops-challenge-app:dev que era la correcta.

- Validando el puerto del dockerfile y el archivo de deployment se ajusto el targetPort que estaba en 80 para que apunte al puerto 8080.

- se probo la aplicacion con el script
