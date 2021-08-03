import { ViewLayout } from "../types";

/**
 * Lovelace Webpage/iframe Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-iframe-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
export interface Schema {
  /**
   * The Webpage card allows you to embed your favorite webpage right into Home Assistant.
   * https://www.home-assistant.io/lovelace/iframe/
   */
  type: "iframe";

  /**
   * Height-width-ratio. Defaults to 50%.
   * https://www.home-assistant.io/lovelace/iframe/#aspect_ratio
   */
  aspect_ratio?: string;

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/iframe/#title
   */
  title?: string;

  /**
   * Website URL.
   * https://www.home-assistant.io/lovelace/iframe/#url
   */
  url: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
