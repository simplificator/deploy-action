# Simplificator Deploy Action

This action allows to you deploy any kind of compose definition to a server. The action connects to the server using SSH, initialized Docker Swarm, deploys your compose definition and cleans up unused images and containers afterward.

## Usage

Below you can find an example workflow on how to deploy your application using our deployment action. We assume that a connection to your server is possible with an SSH key. Password authentication is not supported.

```yaml
name: Deploy to production

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: "ubuntu-latest"
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      - name: Install SSH key
        uses: shimataro/ssh-key-action@v2
        with:
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          known_hosts: ${{ secrets.KNOWN_HOSTS }}

      - name: Deploy to production
        uses: simplificator/deploy-action@main
        with:
          compose-file: docker-compose.yml
          stack-name: my-app
          ssh-user-at-host: deployer@123.124.125.126
          secrets: |
            - name: secret
              value: ${{ secrets.SECRET }}
```

## Inputs

| Name               | Description                                                                                                                                                                                         |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compose-file`     | Path to your docker compose definition inside the repository.                                                                                                                                       |
| `secrets`          | Allows to define a YAML array of Docker secrets which should be created (not required). You need to define it as a multiline YAML string, as this is technically not supported by Actions directly. |
| `stack-name`       | Name of the Docker Stack that shoud be created on your server.                                                                                                                                      |
| `ssh-user-at-host` | User@host to connect to (e.g. `hello@myhost.com`)                                                                                                                                                   |
| `ssh-port`         | SSH port to connect to. Defaults to 22 if not defined.                                                                                                                                              |

## License

MIT / BSD
