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
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Something went wrong",
      }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }

    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (response.token) {
      localStorage.setItem("authToken", response.token);
    }

    return response;
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
    localStorage.removeItem("authToken");
  }

  // Contact methods
  async getContacts() {
    return this.request("/contacts");
  }

  async addContact(name: string, phoneNumber: string) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify({ name, phoneNumber }),
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
  async getMessages(contactId: string) {
    return this.request(`/sms/messages/${contactId}`);
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

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  async healthCheck() {
    return this.request("/health");
  }
}

export default new ApiService();
