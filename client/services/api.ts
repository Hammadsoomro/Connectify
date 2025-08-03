const API_BASE_URL = "/api";

class ApiService {
  private getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        const config: RequestInit = {
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeader(),
            ...options.headers,
          },
          ...options,
        };

        // Only add timeout for non-login requests to avoid abort issues
        if (!endpoint.includes("/auth/login")) {
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 30000);
          config.signal = controller.signal;
        }

        console.log(`API Request (attempt ${attempt + 1}): ${url}`);

        const response = await fetch(url, config);
        if (timeoutId !== null) clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(error.message || "API request failed");
        }

        const data = await response.json();
        console.log(`API Success: ${url}`);
        return data;
      } catch (error: any) {
        if (timeoutId !== null) clearTimeout(timeoutId);

        // Handle abort errors specifically
        if (error.name === "AbortError") {
          console.error(`Request timeout (attempt ${attempt + 1}) for ${url}`);
          if (attempt === maxRetries) {
            throw new Error(
              "Request timeout - please check your connection and try again",
            );
          }
          continue; // Retry on timeout
        }

        console.error(
          `API Error (attempt ${attempt + 1}) for ${url}:`,
          error.message,
        );

        // If this is the last attempt, throw a user-friendly error
        if (attempt === maxRetries) {
          if (error.name === "AbortError") {
            throw new Error(
              "Request timeout. Please check your internet connection.",
            );
          }

          if (error.message === "Failed to fetch") {
            throw new Error(
              "Unable to connect to server. Please check your internet connection.",
            );
          }

          throw error;
        }

        // Wait before retrying with exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    try {
      console.log("Attempting login for:", email);
      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        console.log("Login successful, token stored");
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      console.log("Attempting registration for:", email);
      const response = await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (response.token) {
        localStorage.setItem("authToken", response.token);
        console.log("Registration successful, token stored");
      }

      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  async updateProfile(profile: {
    name: string;
    email: string;
    avatar?: string;
  }) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  logout() {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.clear(); // Clear any other cached data

    // Force page reload to clear any cached state
    window.location.href = "/";
  }

  // Contact methods
  async getContacts(phoneNumber?: string) {
    const params = phoneNumber
      ? `?phoneNumber=${encodeURIComponent(phoneNumber)}`
      : "";
    return this.request(`/contacts${params}`);
  }

  async addContact(
    name: string,
    phoneNumber: string,
    activePhoneNumber?: string,
  ) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify({ name, phoneNumber, activePhoneNumber }),
    });
  }

  async updateContact(
    contactId: string,
    data: { name?: string; avatar?: string },
  ) {
    return this.request(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContact(contactId: string) {
    return this.request(`/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  async markAsRead(contactId: string) {
    return this.request(`/contacts/${contactId}/read`, {
      method: "PUT",
    });
  }

  // Message methods
  async getMessages(contactId: string, phoneNumber?: string) {
    const params = phoneNumber
      ? `?phoneNumber=${encodeURIComponent(phoneNumber)}`
      : "";
    return this.request(`/sms/messages/${contactId}${params}`);
  }

  async sendSMS(contactId: string, content: string, fromNumber: string) {
    return this.request("/sms/send", {
      method: "POST",
      body: JSON.stringify({ contactId, content, fromNumber }),
    });
  }

  // Phone number methods
  async getPhoneNumbers() {
    return this.request("/phone-numbers");
  }

  async setActiveNumber(numberId: string) {
    return this.request(`/phone-numbers/${numberId}/activate`, {
      method: "PUT",
    });
  }

  async getAvailableNumbers(areaCode?: string) {
    const params = areaCode ? `?areaCode=${areaCode}` : "";
    return this.request(`/phone-numbers/available${params}`);
  }

  async purchaseNumber(phoneNumber: string) {
    return this.request("/phone-numbers/purchase", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    });
  }

  // Admin methods
  async createSubAccount(name: string, email: string, password: string) {
    return this.request("/admin/sub-accounts", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getSubAccounts() {
    return this.request("/admin/sub-accounts");
  }

  async assignNumberToSubAccount(subAccountId: string, phoneNumberId: string) {
    return this.request("/admin/assign-number", {
      method: "POST",
      body: JSON.stringify({ subAccountId, phoneNumberId }),
    });
  }

  async removeNumberAssignment(subAccountId: string, phoneNumber: string) {
    return this.request("/admin/remove-assignment", {
      method: "POST",
      body: JSON.stringify({ subAccountId, phoneNumber }),
    });
  }

  async deactivateSubAccount(subAccountId: string) {
    return this.request(`/admin/sub-accounts/${subAccountId}/deactivate`, {
      method: "PUT",
    });
  }

  async getDashboardStats() {
    return this.request("/admin/dashboard-stats");
  }

  // Wallet methods
  async getWallet() {
    return this.request("/wallet");
  }

  async addFunds(amount: number, paymentMethod: string = "manual") {
    return this.request("/wallet/add-funds", {
      method: "POST",
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  async getWalletStats() {
    return this.request("/wallet/stats");
  }

  async updateMonthlyLimit(limit: number) {
    return this.request("/wallet/monthly-limit", {
      method: "PUT",
      body: JSON.stringify({ limit }),
    });
  }

  async getBillingSummary() {
    return this.request("/wallet/billing-summary");
  }

  async triggerMonthlyBilling() {
    return this.request("/wallet/trigger-billing", {
      method: "POST",
    });
  }

  // Twilio methods
  async getTwilioBalance() {
    return this.request("/twilio/balance");
  }

  // Transfer funds to sub-account
  async transferToSubAccount(subAccountId: string, amount: number) {
    return this.request("/wallet/transfer-to-subaccount", {
      method: "POST",
      body: JSON.stringify({ subAccountId, amount }),
    });
  }

  // SafePay payment methods
  async createPaymentIntent(amount: number, currency: string = "PKR") {
    return this.request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  async createPaymentSession(amount: number, currency: string = "PKR") {
    return this.request("/payments/create-session", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  async confirmPayment(paymentId: string) {
    return this.request("/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  async healthCheck() {
    return this.request("/health");
  }
}

export default new ApiService();
