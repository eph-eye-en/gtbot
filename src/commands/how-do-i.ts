import { MatrixClient, MessageEvent, MessageEventContent } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";

async function fetchSubTasks(str: string): Promise<string[]> {
    const body = {
        Text: str,
        Spiciness: 2,
        Ancestors: [],
    };
    const res = await fetch("https://goblin.tools/api/todo/", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return <string[]>await res.json();
}

export async function runHowDoICommand(roomId: string, event: MessageEvent<MessageEventContent>, argStr: string, client: MatrixClient) {
    const steps = await fetchSubTasks(argStr);

    const lines = [argStr + ":", ...steps.map(htmlEscape)];
    const text = lines.join("\n- ");
    const html = lines.join("<br>- ");

    return client.sendMessage(roomId, {
        body: text,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: html,
    });
}
