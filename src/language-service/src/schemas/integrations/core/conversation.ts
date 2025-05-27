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
   * https://www.home-assistant.io/voice_control/custom_sentences_yaml/
   */
  language: string;

  /**
   * Intents defined for this language.
   * https://www.home-assistant.io/voice_control/custom_sentences_yaml/
   */
  intents?: {
    [key: string]: {
      /**
       * List of sentences/slots/etc.
       */
      data: {
        /**
         * List of sentences for this intent.
         * Supports special syntax:
         * - Alternatives: (option1 | option2)
         * - Optional: [optional text]
         * - Slot values: {list_name} or {list_name:slot_name}
         * - Expansion rules: <rule_name>
         * - Permutations: (item1;item2)
         */
        sentences: string[];

        /**
         * Optional fixed slots for the recognized intent.
         */
        slots?: {
          [key: string]: string | number | string[] | number[];
        };

        /**
         * Optional response key to use when this intent is matched.
         * If not provided, "default" is used.
         */
        response?: string;

        /**
         * Context requirements for the intent to match.
         * For example, to limit matching to entities with a specific domain.
         */
        requires_context?: {
          [key: string]: string | string[];
        };

        /**
         * Context to exclude from matching.
         * For example, to avoid matching entities with a specific domain.
         */
        excludes_context?: {
          [key: string]: string | string[];
        };

        /**
         * Local lists specific to this group of sentences.
         */
        lists?: {
          [key: string]:
          | {
            values: (
              string
              | {
                in: string;
                out: string | number;
                context?: { [key: string]: string };
              }
            )[];
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
         * Local expansion rules specific to this group of sentences.
         */
        expansion_rules?: {
          [key: string]: string;
        };
      }[];
    };
  };

  /**
   * Customized responses for intents.
   * https://www.home-assistant.io/voice_control/custom_sentences_yaml/#customizing-responses
   */
  responses?: {
    /**
     * Intent responses to customize.
     */
    intents: {
      [key: string]: {
        /**
         * Named responses for the intent.
         * Keys can be "default" or custom response names.
         */
        [key: string]: string;
      };
    };
  };

  /**
   * Optional lists of items that become alternatives in sentence templates.
   * Referenced as {list_name} or {list_name:slot_name}.
   * https://www.home-assistant.io/voice_control/custom_sentences_yaml/
   */
  lists?: {
    [key: string]:
    | {
      values: (
        string
        | {
          in: string;
          out: string | number;
          context?: { [key: string]: string };
        }
      )[];
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
   * Referenced as <rule_name> in sentences.
   */
  expansion_rules?: {
    [key: string]: string;
  };

  /**
   * Optional words that the intent recognizer can skip during recognition.
   * These words won't affect intent matching.
   */
  skip_words?: string[];
}
