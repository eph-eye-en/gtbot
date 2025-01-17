import { LogService, MatrixClient, MessageEvent, RichReply, UserID } from "matrix-bot-sdk";
import { runHelloCommand } from "./hello";
import * as htmlEscape from "escape-html";
import { runHowDoICommand } from "./how-do-i";

// The prefix required to trigger the bot.
export const COMMAND_PREFIX = "/bot";

// This is where all of our commands will be handled
export default class CommandHandler {

    // Just some variables so we can cache the bot's display name and ID
    // for command matching later.
    private displayName: string;
    private userId: string;
    private localpart: string;

    constructor(private client: MatrixClient) {
    }

    public async start() {
        // Populate the variables above (async)
        await this.prepareProfile();

        // Set up the event handler
        this.client.on("room.message", this.onMessage.bind(this));
    }

    private async prepareProfile() {
        this.userId = await this.client.getUserId();
        this.localpart = new UserID(this.userId).localpart;

        try {
            const profile = await this.client.getUserProfile(this.userId);
            if (profile && profile['displayname']) this.displayName = profile['displayname'];
        } catch (e) {
            // Non-fatal error - we'll just log it and move on.
            LogService.warn("CommandHandler", e);
        }
    }

    private async onMessage(roomId: string, ev: any) {
        const event = new MessageEvent(ev);
        if (event.isRedacted) return; // Ignore redacted events that come through
        if (event.sender === this.userId) return; // Ignore ourselves
        if (event.messageType !== "m.text") return; // Ignore non-text messages

        // Ensure that the event is a command before going on. We allow people to ping
        // the bot as well as using our COMMAND_PREFIX.
        const prefixes = [COMMAND_PREFIX];
        const prefixUsed = prefixes.find(p => event.textBody.startsWith(p));
        if (!prefixUsed) return; // Not a command (as far as we're concerned)

        // Check to see what the arguments were to the command
        const cmdNoPrefix = event.textBody.substring(prefixUsed.length).trim();
        const args = cmdNoPrefix.split(' ');
        const cmd = args[0].replace(/-/g, "", ).toLowerCase();
        const cmdNoPrefix2 = cmdNoPrefix.substring(args[0].length).trim();

        // Try and figure out what command the user ran, defaulting to help
        try {
            if (cmd === "hello") {
                return runHelloCommand(roomId, event, args, this.client);
            } else if(cmd === "howdoi") {
                return runHowDoICommand(roomId, event, cmdNoPrefix2, this.client);
            } else {
                const help = "" +
                    `${COMMAND_PREFIX} hello [user]     - Say hello to a user.\n` +
                    `${COMMAND_PREFIX} how-do-i [thing] - Say hello to a user.\n` +
                    `${COMMAND_PREFIX} help             - This menu\n`;

                const text = `Help menu:\n${help}`;
                const html = `<b>Help menu:</b><br /><pre><code>${htmlEscape(help)}</code></pre>`;
                const reply = RichReply.createFor(roomId, ev, text, html); // Note that we're using the raw event, not the parsed one!
                reply["msgtype"] = "m.notice"; // Bots should always use notices
                return this.client.sendMessage(roomId, reply);
            }
        } catch (e) {
            // Log the error
            LogService.error("CommandHandler", e);

            // Tell the user there was a problem
            const message = "There was an error processing your command";
            return this.client.replyNotice(roomId, ev, message);
        }
    }
}
