# gtbot

My Matrix bot made with matrix-bot-sdk. Not meant for general use.

## Running / Building

To install dependencies: `npm install`

To build it: `npm run build`.

To run it: `npm run start:dev`

To check the lint: `npm run lint`

To build the Docker image: `docker build -t your-bot:latest .`

To run the Docker image (after building):
`docker run --rm -it -v $(pwd)/config:/bot/config your-bot:latest`
*Note that this will require a `config/production.yaml` file to exist as the
Docker container runs in production mode.*

### Configuration

This project uses a package called `config` to manage configuration. The default
configuration is offered as `config/default.yaml`. Copy/paste this to
`config/development.yaml` and `config/production.yaml` and edit them accordingly
for your environment.

## Credits

Credit to
[matrix-bot-sdk-bot-template](https://github.com/turt2live/matrix-bot-sdk-bot-template)
for the project template.
