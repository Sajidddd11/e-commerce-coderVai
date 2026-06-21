import axios from 'axios'

export const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1'

export interface SteadfastConfig {
    api_key: string
    secret_key: string
}

export interface SteadfastOrderRequest {
    invoice: string
    recipient_name: string
    recipient_phone: string
    recipient_address: string
    cod_amount: number
    note?: string
    item_description?: string
}

export interface SteadfastOrderResponse {
    status: number
    message: string
    consignment: {
        consignment_id: number
        invoice: string
        tracking_code: string
        recipient_name: string
        recipient_phone: string
        recipient_address: string
        cod_amount: number
        status: string
        note?: string
        created_at: string
        updated_at: string
    }
}

export interface SteadfastStatusResponse {
    status: number
    delivery_status: string
}

export interface SteadfastBalanceResponse {
    status: number
    current_balance: number
}

export class SteadfastService {
    private config: SteadfastConfig

    constructor(config: SteadfastConfig) {
        this.config = config
    }

    private get headers() {
        return {
            'Api-Key': this.config.api_key,
            'Secret-Key': this.config.secret_key,
            'Content-Type': 'application/json',
        }
    }

    /**
     * GET /get_balance — used as connectivity / test-connection check
     */
    async getBalance(): Promise<SteadfastBalanceResponse> {
        const response = await axios.get(`${STEADFAST_BASE_URL}/get_balance`, {
            headers: this.headers,
        })
        return response.data
    }

    /**
     * POST /create_order — create a single shipment
     */
    async createOrder(orderData: SteadfastOrderRequest): Promise<SteadfastOrderResponse> {
        const response = await axios.post(
            `${STEADFAST_BASE_URL}/create_order`,
            orderData,
            { headers: this.headers }
        )

        const data: SteadfastOrderResponse = response.data

        if (data.status !== 200) {
            throw new Error(data.message || 'Failed to create Steadfast order')
        }

        return data
    }

    /**
     * GET /status_by_cid/{id} — check delivery status by Steadfast consignment ID
     */
    async getStatusByConsignmentId(consignmentId: string | number): Promise<SteadfastStatusResponse> {
        const response = await axios.get(
            `${STEADFAST_BASE_URL}/status_by_cid/${consignmentId}`,
            { headers: this.headers }
        )
        return response.data
    }

    /**
     * GET /status_by_trackingcode/{code} — check delivery status by tracking code
     */
    async getStatusByTrackingCode(trackingCode: string): Promise<SteadfastStatusResponse> {
        const response = await axios.get(
            `${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`,
            { headers: this.headers }
        )
        return response.data
    }

    /**
     * Test connectivity — returns balance info on success
     */
    async testConnection(): Promise<{ success: boolean; balance: number }> {
        const result = await this.getBalance()
        return {
            success: result.status === 200,
            balance: result.current_balance,
        }
    }
}
