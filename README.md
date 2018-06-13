# ChatterBox

ChatterBox is a chat application you can use to talk to your friends! The client uses React to render the app and connects to the NodeJS backend using WebSockets.

## Usage

### Get App Running Locally

1. [Install Docker](https://docs.docker.com/engine/installation/)
1. Run `docker-compose up fullstack` to start the full app
1. Run `docker-compose up backend` to start the server

### Restart App

1. Run `docker-compose down`
1. Run `docker-compose up <backend or fullstack>`

### See Code Changes

1. Use the `--build` flag when restarting:
    ```
    docker-compose up --build <backend or fullstack>
    ```

### Update SQL Schema

1. Run `docker-compose down -v` to delete the database volume on stop

## Author

Lucas Epp
