/**
 * Mainlayer React Native Client
 *
 * Mainlayer is the subscription and entitlement infrastructure for AI agents and apps.
 * Base URL: https://api.mainlayer.fr
 * Auth: Bearer token (your Mainlayer API key)
 */

const MAINLAYER_BASE_URL = 'https://api.mainlayer.fr';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'once';
  features: string[];
  resourceId: string;
  popular?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  planId?: string;
  expiresAt?: string;
  error?: string;
}

export interface EntitlementStatus {
  entitled: boolean;
  planId?: string;
  expiresAt?: string;
  reason?: string;
}

export interface MainlayerConfig {
  apiKey: string;
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class MainlayerError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MainlayerError';
  }
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class MainlayerClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: MainlayerConfig) {
    if (!config.apiKey) {
      throw new MainlayerError('Mainlayer API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? MAINLAYER_BASE_URL;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: this.buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      throw new MainlayerError(
        `Mainlayer API error: ${response.status} ${response.statusText}`,
        response.status,
        errorDetails
      );
    }

    return response.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Check whether a payer has an active entitlement for a resource.
   *
   * @param resourceId  - The Mainlayer resource / product ID
   * @param payerWallet - The payer identifier (user ID, email, or wallet address)
   * @returns true if the payer is entitled to access the resource
   */
  async checkEntitlement(
    resourceId: string,
    payerWallet: string
  ): Promise<boolean> {
    try {
      const result = await this.request<EntitlementStatus>(
        'GET',
        `/v1/entitlements/check?resource_id=${encodeURIComponent(resourceId)}&payer=${encodeURIComponent(payerWallet)}`
      );
      return result.entitled === true;
    } catch (error) {
      if (error instanceof MainlayerError && error.statusCode === 402) {
        // 402 Payment Required — no active entitlement
        return false;
      }
      throw error;
    }
  }

  /**
   * Initiate payment for a resource on behalf of a payer.
   *
   * @param resourceId  - The Mainlayer resource / product ID
   * @param payerWallet - The payer identifier
   * @returns PaymentResult with transaction details
   */
  async pay(
    resourceId: string,
    payerWallet: string
  ): Promise<PaymentResult> {
    return this.request<PaymentResult>('POST', '/v1/payments', {
      resource_id: resourceId,
      payer: payerWallet,
    });
  }

  /**
   * Retrieve available subscription plans.
   *
   * @returns Array of Plan objects
   */
  async getPlans(): Promise<Plan[]> {
    const result = await this.request<{ plans: Plan[] }>('GET', '/v1/plans');
    return result.plans ?? [];
  }

  /**
   * Get detailed entitlement status for a payer + resource.
   */
  async getEntitlementStatus(
    resourceId: string,
    payerWallet: string
  ): Promise<EntitlementStatus> {
    return this.request<EntitlementStatus>(
      'GET',
      `/v1/entitlements/status?resource_id=${encodeURIComponent(resourceId)}&payer=${encodeURIComponent(payerWallet)}`
    );
  }

  /**
   * Cancel an active subscription.
   */
  async cancelSubscription(
    resourceId: string,
    payerWallet: string
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      'POST',
      '/v1/subscriptions/cancel',
      { resource_id: resourceId, payer: payerWallet }
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton factory (lazy-initialized)
// ---------------------------------------------------------------------------

let _client: MainlayerClient | null = null;

export function getMainlayerClient(apiKey?: string): MainlayerClient {
  if (!_client) {
    const key = apiKey ?? process.env.EXPO_PUBLIC_MAINLAYER_API_KEY;
    if (!key) {
      throw new MainlayerError(
        'No Mainlayer API key found. Set EXPO_PUBLIC_MAINLAYER_API_KEY or pass apiKey explicitly.'
      );
    }
    _client = new MainlayerClient({ apiKey: key });
  }
  return _client;
}

export function resetMainlayerClient(): void {
  _client = null;
}
