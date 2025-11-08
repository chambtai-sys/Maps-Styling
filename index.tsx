/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { GoogleGenAI, mcpToTool } from '@google/genai';
import { ChatState, marked, Playground, ICON_BUSY, ICON_COPY, ICON_CHECK, ICON_DOWNLOAD_SIMPLE } from './playground';
import {STYLE_SPEC} from './style_spec'; 
import {EXAMPLE_STYLE} from './example_style';
import { JSONSchema } from './json_schema';
import { MapParams, startMcpGoogleMapServer } from './mcp_maps_server';
import {render} from 'lit';

/* --------- */

async function startClient(transport: Transport) {
  const client = new Client({ name: "AI Studio MCP", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

/* ------------ */

const SYSTEM_INSTRUCTIONS = `You are an expert in creating JSON stylesheets
  for Google's Cloud-based map styling. Use the following JSON Schema spec: ${JSON.stringify(JSONSchema)}
  and this overview doc: ${STYLE_SPEC} to generate styles. Refer to
  ${EXAMPLE_STYLE} ("example_style") as an exhaustive example of what can be styled.
  When styling, first come up
  with a few key colors to act as a palette, with a variety of shades of each
  color. You do not need to style every single feature as in the example style,
  but make sure to style many of the sub-features under
  natural.land.landCover with similar shades to create pleasing
  variation in the vegetation features. Other polygons that are important
  to style in this palette include natural.water, natural.land.landCover,
  infrastructure.urbanArea, pointOfInterest.recreation.park, natural.land,
  pointOfInterest.recreation.zoo, pointOfInterest.recreation.sportsField,
  pointOfInterest.recreation.golfCourse, pointOfInterest.other.cemetery,
  pointOfInterest.recreation.natureReserve, infrastructure.businessCorridor,
  pointOfInterest.recreation.sportsComplex, pointOfInterest.other.military,
  pointOfInterest.emergency.hospital, administrative.reservation, and
  pointOfInterest.transit.airport. If you were asked to generate a style
  based on a color palette, ALWAYS style all of the preceding features.

  Note that not all combinations of features and element/stylers are valid. For example,
  the following two combinations are invalid:

  Feature ID: pointOfInterest.recreation.natureReserve
  Element: label
  Styler: pinFillColor

  Feature ID: political.border
  Element: geometry
  Styler: strokeColor

  In the case of political.border, use \`color\` instead of \`strokeColor\`. This is the
  only feature that is allowed to use the \`color\` styler.

  Refer to example_style and do not add any feature/element/styler combinations that do not
  appear in example_style. Note that you do not need to recreate every single combination
  in example_style; it should instead be considered the superset of your styling capabilities.

  **Important:** If the user requests that something change with relation to zoom, consider that z08 to z16
  are the most common zoom levels. So for example, if they want it to get darker as they zoom,
  specify a light color at z00, the same light color at z08, and a darker color at z16.

  When specifying keyzooms, you _must_ specify a value at z00.

  **Important:** Show the style to the user as you're creating it.

  When you're done creating this JSON, let the user know that you are now validating and
  applying the style.

  Once you've finished creating the style, call the validate_and_generate tool to check whether
  the generated JSON passes all validation. If validation reports errors, adjust the
  stylesheet JSON you created to remove the offending keys and re-run the validation step.

  Do not inform the user if validation fails, just modify the stylesheet and try again.

  Once you get a success message from the validate_and_generate tool, tell the user that you
  have created their style!

  The only context you need to remember is the user's prompts and the stylesheets you
  generate in your initial step before calling any tools. Everything else should be considered
  transient data.`;


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function createAiChat(mcpClient: Client) {
  return ai.chats.create({
    model: 'gemini-2.5-flash-preview-09-2025',
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      tools: [mcpToTool(mcpClient)],
      thinkingConfig: {
        thinkingBudget: 1024,
      }
    },
  });
}

function camelCaseToDash(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function textForFunctionCall(str: string) {
  switch (str) {
    case 'public_to_internal_stylesheet':
      return 'Processing generated stylesheet';
    case 'generate_style_table':
      return 'Loading and applying your custom styles'
  }
}

document.addEventListener('DOMContentLoaded', async (event) => {
  const rootElement = document.querySelector('#root')! as HTMLElement;

  const playground = new Playground();
  rootElement.appendChild(playground);

  const configVersion = await playground.configVersion;


  // ---------

  const [transportA, transportB] = InMemoryTransport.createLinkedPair();

  void startMcpGoogleMapServer(transportA, (params: MapParams) => {
    playground.renderMapQuery(params);
  },
  configVersion);

  const mcpClient = await startClient(transportB);

  // --------

  const aiChat = createAiChat(mcpClient);

  playground.sendMessageHandler = async (
    input: string,
    role: string,
    image?: {mimeType: string; data: string},
  ) => {

    const { thinking, textNode } = playground.addMessage('assistant', '');

    playground.setChatState(ChatState.GENERATING);
    render(ICON_BUSY, thinking);

    const messageParts: (
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    )[] = [];

    if (image) {
      messageParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    if (input) {
      messageParts.push({ text: input });
    }

    const message = image ? messageParts : input;

    let newCode = '';
    let thought = '';

    try {
      const res = await aiChat.sendMessageStream({ message });

      for await (const chunk of res) {
        for (const candidate of chunk.candidates ?? []) {
          for (const part of candidate.content?.parts ?? []) {
            if (part.functionCall) {
              const mcpCall = {
                name: camelCaseToDash(part.functionCall.name!),
                arguments: part.functionCall.args
              };

              const callText = textForFunctionCall(part.functionCall.name!);

              // const explanation = 'Calling function:\n```json\n' + JSON.stringify(mcpCall, null, 2) + '\n```'
              if (callText) {
                const { thinking, textNode } = playground.addMessage('assistant', callText);
              }
              // textNode.innerHTML = await marked.parse(explanation);
            }

            if (part.thought) {
              playground.setChatState(ChatState.THINKING);
              if (part.text) {
                thought += part.text;
                thinking.innerHTML = await marked.parse(thought);
                thinking.parentElement!.classList.remove('hidden');
              }
            } else if (part.text) {
              playground.setChatState(ChatState.EXECUTING);
              newCode += part.text;
              textNode.classList.add('executing');
              textNode.innerHTML = await marked.parse(newCode);
            }
            playground.scrollToTheEnd();
          }
        }
      }
    } catch (e: any) {
      console.error('GenAI SDK Error:', e.message);
      let message = e.message;
      const splitPos = e.message.indexOf('{');
      if (splitPos > -1) {
        const msgJson = e.message.substring(splitPos);
        try {
          const sdkError = JSON.parse(msgJson);
          if (sdkError.error) {
            message = sdkError.error.message;
            message = await marked.parse(message);
          }
        } catch (e) {
          console.error('Unable to parse the error message:', e);
        }
      }
      const { textNode } = playground.addMessage('error', '');
      textNode.innerHTML = message;
    }

    textNode.classList.remove('executing');

    const codeBlocks = textNode.querySelectorAll('pre');
    for (const block of codeBlocks) {
      const code = block.querySelector('code');
      if (!code) continue;

      if (block.parentElement?.classList.contains('code-block-wrapper')) {
        continue;
      }

      const rawCode = code.textContent ?? '';

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      block.parentNode?.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const createActionsDiv = (position: string) => {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = `code-actions ${position}`;

        const copyBtn = document.createElement('button');
        copyBtn.title = 'Copy Code';
        render(ICON_COPY, copyBtn);
        copyBtn.onclick = async () => {
          await navigator.clipboard.writeText(rawCode);
          render(ICON_CHECK, copyBtn);
          setTimeout(() => render(ICON_COPY, copyBtn), 2000);
        };

        const downloadBtn = document.createElement('button');
        downloadBtn.title = 'Download Code';
        render(ICON_DOWNLOAD_SIMPLE, downloadBtn);
        downloadBtn.onclick = () => {
          let lang = 'txt';
          for (const cls of code.classList) {
            if (cls.startsWith('language-')) {
              lang = cls.replace('language-', '');
              break;
            }
          }
          const filename = `code.${lang}`;
          const mimeTypes: {[key: string]: string} = {
            'json': 'application/json',
            'js': 'text/javascript',
            'html': 'text/html',
            'css': 'text/css',
          };
          const mimeType = mimeTypes[lang] || 'text/plain';
          const blob = new Blob([rawCode], {type: mimeType});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(downloadBtn);
        return actionsDiv;
      };

      wrapper.appendChild(createActionsDiv('top'));
      wrapper.appendChild(createActionsDiv('bottom'));
    }

    // close thinking block
    thinking.parentElement!.removeAttribute('open');

    // If the answer was just code
    if (textNode.innerHTML.trim().length === 0) {
      textNode.innerHTML = 'Done';
    }

    playground.setChatState(ChatState.IDLE);
    thinking.innerHTML = '';
  };
});
