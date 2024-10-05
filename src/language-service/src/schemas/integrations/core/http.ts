/**
 * HTTP integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/http/__init__.py
 */
import { Deprecated, IncludeList, Port, PositiveInteger } from "../../types";

export type Domain = "http";
export interface Schema {
  /**
   * DEPRECATED.
   * The base URL has been deprecated, please use internal_url and external_url instead.
   */
  base_url?: Deprecated;

  /**
   * A list of origin domain names to allow CORS requests from. Enabling this will set the Access-Control-Allow-Origin header to the Origin header if it is found in the list, and the Access-Control-Allow-Headers header to Origin, Accept, X-Requested-With, Content-type, Authorization.
   * https://www.home-assistant.io/integrations/http#cors_allowed_origins
   */
  cors_allowed_origins?: string | string[] | IncludeList;

  /**
   * Flag indicating whether additional IP filtering is enabled.
   * https://www.home-assistant.io/integrations/http#ip_ban_enabled
   */
  ip_ban_enabled?: boolean;

  /**
   * Number of failed login attempt from single IP after which it will be automatically banned if ip_ban_enabled is true.
   * https://www.home-assistant.io/integrations/http#login_attempts_threshold
   */
  login_attempts_threshold?: PositiveInteger;

  /**
   * Only listen to incoming requests on specific IP/host. By default it will accept all IPv4 connections. Use server_host: ::0 if you want to listen to (and only) IPv6.
   * Warning! Only use this option when you run Home Assistant Core directly in Python!
   * https://www.home-assistant.io/integrations/http#server_host
   */
  server_host?: string;

  /**
   * Let you set a port for Home Assistant to run on.
   * https://www.home-assistant.io/integrations/http#server_port
   */
  server_port?: Port;

  /**
   * Path to your TLS/SSL certificate to serve Home Assistant over a secure connection.
   * https://www.home-assistant.io/integrations/http#ssl_certificate
   */
  ssl_certificate?: string;

  /**
   * Path to your TLS/SSL key to serve Home Assistant over a secure connection.
   * https://www.home-assistant.io/integrations/http#ssl_key
   */
  ssl_key?: string;

  /**
   * Path to the client/peer TLS/SSL certificate to accept secure connections from.
   * https://www.home-assistant.io/integrations/http#ssl_peer_certificate
   */
  ssl_peer_certificate?: string;

  /**
   * The Mozilla SSL profile to use. Only lower if you are experiencing integrations causing SSL handshake errors.
   * Can be either "modern" or "intermediate". Modern is the default.
   * https://www.home-assistant.io/integrations/http#ssl_profile
   */
  ssl_profile?: "modern" | "intermediate";

  /**
   * DEPRECATED.
   * This option has no effect. Please remove this from your configuration.
   */
  trusted_networks?: Deprecated;

  /**
   * List of trusted proxies, consisting of IP addresses or networks, that are allowed to set the X-Forwarded-For header. This is required when using use_x_forwarded_for because all requests to Home Assistant, regardless of source, will arrive from the reverse proxy IP address.
   * This option should be handled and set with extreme care!
   * https://www.home-assistant.io/integrations/http#trusted_proxies
   */
  trusted_proxies?: string | string[] | IncludeList;

  /**
   * Enable parsing of the X-Forwarded-For header, passing on the client’s correct IP address in proxied setups. You must also whitelist trusted proxies using the trusted_proxies setting for this to work. Non-whitelisted requests with this header will be considered IP spoofing attacks, and the header will, therefore, be ignored.
   * https://www.home-assistant.io/integrations/http#use_x_forwarded_for
   */
  use_x_forwarded_for?: boolean;

  /**
   * Controls the `X-Frame-Options` header to help prevent clickjacking.
   * https://www.home-assistant.io/integrations/http#use_x_frame_options
   */
  use_x_frame_options?: boolean;
}
