/**
 * Conversation integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/conversation/__init__.py
 */
export type Domain = "conversation";

export interface Schema {
  /**
   * Intents that the conversation integration should understand.
   * https://www.home-assistant.io/integrations/conversation#intents
   */
  intents?: { [key: string]: string | string[] };
}

export interface CustomSentence {
  /**
   * The language of this custom sentence file.
   * https://www.home-assistant.io/integrations/conversation/#adding-custom-sentences
   */
  language: string;

  /**
   * Intents
   */
  intents: {
    [key: string]: {
      /**
       * List of sentences/slots/etc.
       */
      data: {
        /**
         * List of sentences for this intent.
         */
        sentences: string[];

        /**
         * Optional fixed slots for the recognized intent.
         */
        slots?: {
          [key: string]: string | string[];
        };

        response?: string;

        requires_context?: {
          [key: string]: string | string[];
        };

        excludes_context?: {
          [key: string]: string | string[];
        };
      }[];
    };
  };

  /**
   * Optional lists of items that become alternatives in sentence templates. Referenced as {list_name} or {list_name:slot_name}.
   */
  lists?: {
    [key: string]:
      | {
          values: Array<
            | string
            | {
                in: string;
                out: string;
                context?: { [key: string]: string };
              }
          >;
        }
      | {
          range: {
            type?: "number" | "percentage" | "temperature";
            from: number;
            to: number;
          };
        }
      | {
          wildcard: boolean;
        };
  };

  /**
   * Optional rules that are expanded in sentence templates.
   */
  expansion_rules?: {
    [key: string]: string;
  };

  /**
   * Optional words that the intent recognizer can skip during recognition.
   */
  skip_words?: string[];
}
