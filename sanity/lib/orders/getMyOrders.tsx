import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getMyOrders(userId: string){
    if (!userId){
        throw new Error("User ID is required");
        }
    
    const MY_ORDER_QUERY = defineQuery(`
        *[_type == "order" && clerkUserId == $userId] | order(orderDate desc){
            ...,
            products[]{
                ...,
                product->
            }
        }
        `);

    try {
        const orders = await sanityFetch({
            query: MY_ORDER_QUERY,
            params: { userId }
        })
        console.log("Orders inside: ",orders)
        return orders.data || [];
    } catch (error) {
        console.error("Error fetching the data: ", error)
        throw new Error("Error fetching orders")
    }
        
}