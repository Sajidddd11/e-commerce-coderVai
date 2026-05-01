import axios from 'axios'

export interface PathaoConfig {
    base_url: string
    client_id: string
    client_secret: string
    username: string
    password: string
    grant_type: string
    access_token?: string
    refresh_token?: string
    token_expires_at?: number
}

export interface PathaoStoreData {
    store_id: number
    store_name: string
    contact_name?: string
    contact_number?: string
    address?: string
    city_id?: number
    zone_id?: number
    area_id?: number
}

export interface PathaoOrderRequest {
    store_id: number
    merchant_order_id?: string
    recipient_name: string
    recipient_phone: string
    recipient_address: string
    delivery_type: 48 | 12 // 48 = Normal, 12 = On Demand
    item_type: 1 | 2 // 1 = Document, 2 = Parcel
    special_instruction?: string
    item_quantity: number
    item_weight: number // Min 0.5, Max 10
    item_description?: string
    amount_to_collect: number
}

export interface PathaoOrderResponse {
    consignment_id: string
    merchant_order_id?: string
    order_status: string
    delivery_fee: number
}

export class PathaoService {
    private config: PathaoConfig
    private pgConnection: any

    constructor(config: PathaoConfig, pgConnection: any) {
        this.config = config
        this.pgConnection = pgConnection
    }

    /**
     * Get access token (use cached if valid, otherwise fetch new)
     */
    async getAccessToken(): Promise<string> {
        // Check if we have a valid cached token
        if (this.config.access_token && this.config.token_expires_at) {
            const now = Date.now()
            // Token expires in 5 days (432000 seconds), refresh if less than 1 day remaining
            if (this.config.token_expires_at > now + (24 * 60 * 60 * 1000)) {
                console.log('✅ Using cached Pathao access token')
                return this.config.access_token
            }
        }

        // Fetch new token
        console.log('🔄 Fetching new Pathao access token...')
        const response = await axios.post(`${this.config.base_url}/aladdin/api/v1/issue-token`, {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            grant_type: this.config.grant_type,
            username: this.config.username,
            password: this.config.password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const { access_token, refresh_token, expires_in } = response.data

        // Update config with new token
        this.config.access_token = access_token
        this.config.refresh_token = refresh_token
        this.config.token_expires_at = Date.now() + (expires_in * 1000)

        // Save to database
        await this.saveConfig()

        console.log('✅ New Pathao access token obtained')
        return access_token
    }

    /**
     * Save updated config to database
     */
    private async saveConfig(): Promise<void> {
        await this.pgConnection('courier_config')
            .where('provider', 'pathao')
            .update({
                config: JSON.stringify(this.config),
                updated_at: new Date()
            })
    }

    /**
     * Get list of stores from Pathao
     */
    async getStores(): Promise<PathaoStoreData[]> {
        const token = await this.getAccessToken()

        const response = await axios.get(`${this.config.base_url}/aladdin/api/v1/stores`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=UTF-8'
            }
        })

        return response.data.data.data || []
    }

    /**
     * Create a new order/shipment in Pathao
     */
    async createOrder(orderData: PathaoOrderRequest): Promise<PathaoOrderResponse> {
        const token = await this.getAccessToken()

        const response = await axios.post(
            `${this.config.base_url}/aladdin/api/v1/orders`,
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        if (response.data.code !== 200) {
            throw new Error(response.data.message || 'Failed to create Pathao order')
        }

        return response.data.data
    }

    /**
     * Get order info from Pathao
     */
    async getOrderInfo(consignmentId: string): Promise<any> {
        const token = await this.getAccessToken()

        const response = await axios.get(
            `${this.config.base_url}/aladdin/api/v1/orders/${consignmentId}/info`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        return response.data.data
    }

    /**
     * Get list of cities
     */
    async getCities(): Promise<Array<{ city_id: number; city_name: string }>> {
        const token = await this.getAccessToken()

        const response = await axios.get(
            `${this.config.base_url}/aladdin/api/v1/city-list`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }
        )

        return response.data.data.data || []
    }

    /**
     * Get zones for a city
     */
    async getZones(cityId: number): Promise<Array<{ zone_id: number; zone_name: string }>> {
        const token = await this.getAccessToken()

        const response = await axios.get(
            `${this.config.base_url}/aladdin/api/v1/cities/${cityId}/zone-list`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }
        )

        return response.data.data.data || []
    }

    /**
     * Get areas for a zone
     */
    async getAreas(zoneId: number): Promise<Array<{ area_id: number; area_name: string; home_delivery_available: boolean }>> {
        const token = await this.getAccessToken()

        const response = await axios.get(
            `${this.config.base_url}/aladdin/api/v1/zones/${zoneId}/area-list`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }
        )

        return response.data.data.data || []
    }

    /**
     * Calculate delivery price
     */
    async calculatePrice(params: {
        store_id: number
        item_type: 1 | 2
        delivery_type: 48 | 12
        item_weight: number
        recipient_city: number
        recipient_zone: number
    }): Promise<{
        price: number
        discount: number
        promo_discount: number
        final_price: number
        cod_percentage: number
    }> {
        const token = await this.getAccessToken()

        const response = await axios.post(
            `${this.config.base_url}/aladdin/api/v1/merchant/price-plan`,
            params,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }
        )

        return response.data.data
    }
}
